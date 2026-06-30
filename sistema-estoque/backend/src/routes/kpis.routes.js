import { prisma } from "../lib/prisma.js"

// Início do mês N meses atrás (para séries históricas).
function startOfMonthsAgo(n) {
  const d = new Date()
  d.setMonth(d.getMonth() - n, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

export async function kpiRoutes(app) {
  // GET /api/kpis  (protegido) — cartões de resumo do dashboard
  app.get(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["KPIs"],
        summary: "Resumo do dashboard (totais, estoque baixo, valores)",
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const startOfMonth = startOfMonthsAgo(0)
      const [products, batches, exitsThisMonth, cogsAgg] = await Promise.all([
        prisma.product.findMany(),
        prisma.stockBatch.findMany({ where: { quantity: { gt: 0 } } }),
        prisma.stockExit.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.stockExit.aggregate({
          _sum: { totalCost: true },
          where: { createdAt: { gte: startOfMonth } },
        }),
      ])

      const lowStockCount = products.filter((p) => p.quantity <= p.minQuantity).length
      const stockValueAtPrice = products.reduce((sum, p) => sum + p.quantity * p.price, 0)
      const stockValueAtCost = batches.reduce((sum, b) => sum + b.quantity * b.unitCost, 0)

      return {
        totalProducts: products.length,
        lowStockCount,
        exitsThisMonth,
        // Mantido como valor de venda do estoque (compatível com a versão anterior).
        totalValue: stockValueAtPrice,
        stockValueAtCost,
        stockValueAtPrice,
        cogsThisMonth: cogsAgg._sum.totalCost ?? 0,
      }
    }
  )

  // GET /api/kpis/charts  (protegido) — séries para os gráficos do dashboard
  app.get(
    "/charts",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["KPIs"],
        summary: "Séries históricas: movimentações por mês e produtos por categoria",
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const since = startOfMonthsAgo(5) // últimos 6 meses
      const [exits, entries, categories] = await Promise.all([
        prisma.stockExit.findMany({ where: { createdAt: { gte: since } } }),
        prisma.stockEntry.findMany({ where: { createdAt: { gte: since } } }),
        prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
      ])

      // Monta os 6 buckets mensais em ordem cronológica.
      const buckets = []
      for (let i = 5; i >= 0; i--) {
        const d = startOfMonthsAgo(i)
        buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTH_LABELS[d.getMonth()], baixas: 0, entradas: 0, custo: 0 })
      }
      const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))
      for (const e of exits) {
        const k = `${e.createdAt.getFullYear()}-${e.createdAt.getMonth()}`
        if (byKey[k]) { byKey[k].baixas += e.quantity; byKey[k].custo += e.totalCost }
      }
      for (const e of entries) {
        const k = `${e.createdAt.getFullYear()}-${e.createdAt.getMonth()}`
        if (byKey[k]) byKey[k].entradas += e.quantity
      }

      return {
        movementsByMonth: buckets.map(({ key, ...rest }) => rest), // eslint-disable-line no-unused-vars
        productsByCategory: categories.map((c) => ({ categoria: c.name, quantidade: c._count.products })),
      }
    }
  )

  // GET /api/kpis/financial  (protegido) — inteligência financeira do estoque
  app.get(
    "/financial",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["KPIs"],
        summary: "Indicadores financeiros: valor, margem e produtos de maior impacto",
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const products = await prisma.product.findMany({
        include: {
          category: true,
          batches: { where: { quantity: { gt: 0 } } },
        },
      })

      const rows = products.map((p) => {
        const costValue = p.batches.reduce((sum, b) => sum + b.quantity * b.unitCost, 0)
        const avgUnitCost = p.quantity > 0 ? costValue / p.quantity : 0
        const saleValue = p.quantity * p.price
        const margin = saleValue - costValue
        const marginPercent = saleValue > 0 ? (margin / saleValue) * 100 : 0
        return {
          productId: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category?.name ?? "",
          quantity: p.quantity,
          avgUnitCost,
          unitPrice: p.price,
          costValue,
          saleValue,
          margin,
          marginPercent,
        }
      })

      const totalStockCost = rows.reduce((s, r) => s + r.costValue, 0)
      const totalStockPrice = rows.reduce((s, r) => s + r.saleValue, 0)

      return {
        totalStockCost,
        totalStockPrice,
        potentialProfit: totalStockPrice - totalStockCost,
        // Produtos com maior impacto financeiro (valor de venda em estoque).
        topProductsByValue: [...rows].sort((a, b) => b.saleValue - a.saleValue).slice(0, 5),
        products: rows,
      }
    }
  )

  // GET /api/kpis/alerts  (protegido) — alertas inteligentes de reposição
  app.get(
    "/alerts",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["KPIs"],
        summary: "Produtos em estoque crítico com sugestão de reposição",
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const since = startOfMonthsAgo(2) // consumo dos últimos 3 meses
      const [products, exits] = await Promise.all([
        prisma.product.findMany(),
        prisma.stockExit.findMany({ where: { createdAt: { gte: since } } }),
      ])

      // Consumo médio mensal por produto (base para a sugestão de reposição).
      const consumedByProduct = {}
      for (const e of exits) {
        consumedByProduct[e.productId] = (consumedByProduct[e.productId] ?? 0) + e.quantity
      }

      return products
        .filter((p) => p.quantity <= p.minQuantity)
        .map((p) => {
          const avgMonthlyConsumption = (consumedByProduct[p.id] ?? 0) / 3
          // Repor para cobrir o mínimo + 1 mês de consumo estimado.
          const target = p.minQuantity + Math.ceil(avgMonthlyConsumption)
          const suggestedQuantity = Math.max(target - p.quantity, 1)
          return {
            productId: p.id,
            name: p.name,
            sku: p.sku,
            quantity: p.quantity,
            minQuantity: p.minQuantity,
            avgMonthlyConsumption: Number(avgMonthlyConsumption.toFixed(1)),
            suggestedQuantity,
            severity: p.quantity === 0 ? "critical" : "low",
          }
        })
        .sort((a, b) => a.quantity - b.quantity)
    }
  )
}
