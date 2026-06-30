import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { createEntry, createExit } from "../src/lib/stock.js"

const prisma = new PrismaClient()

// Data deslocada N meses para trás (para gerar histórico nos gráficos).
function monthsAgo(n) {
  const d = new Date()
  d.setMonth(d.getMonth() - n, 15)
  return d
}

async function main() {
  console.log("Limpando dados existentes...")
  await prisma.stockExitConsumption.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.stockEntry.deleteMany()
  await prisma.stockExit.deleteMany()
  await prisma.stockBatch.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log("Criando usuários...")
  const adminPassword = await bcrypt.hash("123456", 8)
  const admin = await prisma.user.create({
    data: { name: "Admin User", email: "admin@admin.com", password: adminPassword, role: "admin", status: "active" },
  })

  const defaultPassword = await bcrypt.hash("123456", 8)
  const [ana, bruno] = await Promise.all([
    prisma.user.create({ data: { name: "Ana Silva", email: "ana@empresa.com", password: defaultPassword, role: "admin", status: "active" } }),
    prisma.user.create({ data: { name: "Bruno Lima", email: "bruno@empresa.com", password: defaultPassword, role: "manager", status: "active" } }),
    prisma.user.create({ data: { name: "Carla Santos", email: "carla@empresa.com", password: defaultPassword, role: "viewer", status: "inactive" } }),
    prisma.user.create({ data: { name: "Diego Costa", email: "diego@empresa.com", password: defaultPassword, role: "manager", status: "active" } }),
  ])

  console.log("Criando categorias...")
  const [eletronicos, escritorio, limpeza, informatica] = await Promise.all([
    prisma.category.create({ data: { name: "Eletrônicos", description: "Equipamentos e dispositivos eletrônicos" } }),
    prisma.category.create({ data: { name: "Escritório", description: "Materiais e móveis de escritório" } }),
    prisma.category.create({ data: { name: "Limpeza", description: "Produtos de limpeza e higiene" } }),
    prisma.category.create({ data: { name: "Informática", description: "Periféricos e acessórios de TI" } }),
  ])

  console.log("Criando produtos (sem saldo; o saldo virá das entradas)...")
  // price = preço de venda; cost = custo unitário usado na entrada inicial.
  const defs = [
    { name: "Notebook Dell Inspiron", sku: "NB-001", categoryId: eletronicos.id, qty: 15, minQuantity: 5, price: 3500, cost: 2400 },
    { name: 'Monitor LG 24"', sku: "MN-002", categoryId: eletronicos.id, qty: 3, minQuantity: 5, price: 950, cost: 600 },
    { name: "Cadeira Ergonômica", sku: "MV-003", categoryId: escritorio.id, qty: 8, minQuantity: 3, price: 1200, cost: 780 },
    { name: "Resma de Papel A4", sku: "ES-004", categoryId: escritorio.id, qty: 7, minQuantity: 10, price: 28, cost: 16 },
    { name: "Desinfetante 5L", sku: "LM-005", categoryId: limpeza.id, qty: 23, minQuantity: 8, price: 45, cost: 27 },
    { name: "Teclado Mecânico", sku: "TI-006", categoryId: informatica.id, qty: 4, minQuantity: 5, price: 320, cost: 190 },
    { name: "Mouse sem fio", sku: "TI-007", categoryId: informatica.id, qty: 12, minQuantity: 5, price: 180, cost: 95 },
  ]

  const products = {}
  for (const d of defs) {
    const product = await prisma.product.create({
      data: { name: d.name, sku: d.sku, categoryId: d.categoryId, quantity: 0, minQuantity: d.minQuantity, price: d.price },
    })
    products[d.sku] = { ...product, cost: d.cost, targetQty: d.qty }
  }

  console.log("Registrando entradas iniciais (geram lotes com custo)...")
  for (const sku of Object.keys(products)) {
    const p = products[sku]
    await createEntry(prisma, {
      productId: p.id,
      quantity: p.targetQty,
      unitCost: p.cost,
      reason: "Estoque inicial",
      userId: admin.id,
    })
  }

  console.log("Registrando baixas (consomem lotes em FIFO e apuram o custo)...")
  await createExit(prisma, { productId: products["NB-001"].id, quantity: 2, reason: "Entrega para o departamento de TI", userId: ana.id })
  await createExit(prisma, { productId: products["ES-004"].id, quantity: 5, reason: "Consumo administrativo", userId: bruno.id })
  await createExit(prisma, { productId: products["LM-005"].id, quantity: 3, reason: "Manutenção predial", userId: ana.id })
  await createExit(prisma, { productId: products["TI-006"].id, quantity: 1, reason: "Substituição por defeito", userId: admin.id })

  console.log("Gerando histórico de movimentações (gráficos)...")
  // Movimentações retroativas, apenas para dar profundidade às séries dos
  // gráficos. São registros históricos e não alteram o saldo atual dos lotes.
  for (let m = 5; m >= 1; m--) {
    const when = monthsAgo(m)
    await prisma.stockExit.create({
      data: { productId: products["NB-001"].id, quantity: 1 + (m % 3), reason: "Consumo do período", totalCost: (1 + (m % 3)) * products["NB-001"].cost, createdById: bruno.id, createdAt: when },
    })
    await prisma.stockEntry.create({
      data: { productId: products["ES-004"].id, quantity: 20, reason: "Reposição do período", unitCost: products["ES-004"].cost, createdById: ana.id, createdAt: when },
    })
  }

  console.log("Criando solicitações de compra...")
  await prisma.purchaseOrder.create({
    data: {
      supplier: "Dell Computadores", status: "pending", notes: "Reposição de notebooks e monitores", createdById: bruno.id,
      items: { create: [
        { productId: products["NB-001"].id, quantity: 5, unitCost: 2350 },
        { productId: products["MN-002"].id, quantity: 8, unitCost: 590 },
      ] },
    },
  })
  await prisma.purchaseOrder.create({
    data: {
      supplier: "Papelaria Central", status: "approved", notes: "Material de escritório", createdById: bruno.id,
      approvedById: admin.id, approvedAt: new Date(),
      items: { create: [{ productId: products["ES-004"].id, quantity: 50, unitCost: 15 }] },
    },
  })

  console.log("Criando um convite pendente de exemplo...")
  await prisma.invite.create({
    data: {
      email: "novo.colaborador@empresa.com", role: "viewer", token: "exemplo-token-de-convite-demonstracao",
      status: "pending", expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), invitedById: admin.id,
    },
  })

  console.log("Seed concluído com sucesso!")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
