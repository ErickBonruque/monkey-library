import { prisma } from "../lib/prisma.js"

export async function kpiRoutes(app) {
  // GET /api/kpis  (protegido) — métricas do dashboard
  app.get(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["KPIs"],
        summary: "Métricas do dashboard (totais, estoque baixo, valor)",
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const products = await prisma.product.findMany()

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const exitsThisMonth = await prisma.stockExit.count({
        where: { createdAt: { gte: startOfMonth } },
      })

      const lowStockCount = products.filter((p) => p.quantity <= p.minQuantity).length
      const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0)

      return {
        totalProducts: products.length,
        lowStockCount,
        exitsThisMonth,
        totalValue,
      }
    }
  )
}
