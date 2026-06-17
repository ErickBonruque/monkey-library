import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Limpando dados existentes...")
  await prisma.stockEntry.deleteMany()
  await prisma.stockExit.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log("Criando usuários...")
  // Usuário admin padrão (mesmas credenciais usadas pelo front-end).
  const adminPassword = await bcrypt.hash("123456", 8)
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@admin.com",
      password: adminPassword,
      role: "admin",
      status: "active",
    },
  })

  const defaultPassword = await bcrypt.hash("123456", 8)
  const [ana, bruno] = await Promise.all([
    prisma.user.create({
      data: { name: "Ana Silva", email: "ana@empresa.com", password: defaultPassword, role: "admin", status: "active" },
    }),
    prisma.user.create({
      data: { name: "Bruno Lima", email: "bruno@empresa.com", password: defaultPassword, role: "manager", status: "active" },
    }),
    prisma.user.create({
      data: { name: "Carla Santos", email: "carla@empresa.com", password: defaultPassword, role: "viewer", status: "inactive" },
    }),
    prisma.user.create({
      data: { name: "Diego Costa", email: "diego@empresa.com", password: defaultPassword, role: "manager", status: "active" },
    }),
  ])

  console.log("Criando categorias...")
  const [eletronicos, escritorio, limpeza, informatica] = await Promise.all([
    prisma.category.create({ data: { name: "Eletrônicos", description: "Equipamentos e dispositivos eletrônicos" } }),
    prisma.category.create({ data: { name: "Escritório", description: "Materiais e móveis de escritório" } }),
    prisma.category.create({ data: { name: "Limpeza", description: "Produtos de limpeza e higiene" } }),
    prisma.category.create({ data: { name: "Informática", description: "Periféricos e acessórios de TI" } }),
  ])

  console.log("Criando produtos...")
  const [notebook, , , papel, desinfetante, teclado] = await Promise.all([
    prisma.product.create({ data: { name: "Notebook Dell Inspiron", sku: "NB-001", categoryId: eletronicos.id, quantity: 15, minQuantity: 5, price: 3500 } }),
    prisma.product.create({ data: { name: 'Monitor LG 24"', sku: "MN-002", categoryId: eletronicos.id, quantity: 3, minQuantity: 5, price: 950 } }),
    prisma.product.create({ data: { name: "Cadeira Ergonômica", sku: "MV-003", categoryId: escritorio.id, quantity: 8, minQuantity: 3, price: 1200 } }),
    prisma.product.create({ data: { name: "Resma de Papel A4", sku: "ES-004", categoryId: escritorio.id, quantity: 2, minQuantity: 10, price: 28 } }),
    prisma.product.create({ data: { name: "Desinfetante 5L", sku: "LM-005", categoryId: limpeza.id, quantity: 20, minQuantity: 8, price: 45 } }),
    prisma.product.create({ data: { name: "Teclado Mecânico", sku: "TI-006", categoryId: informatica.id, quantity: 4, minQuantity: 5, price: 320 } }),
    prisma.product.create({ data: { name: "Mouse sem fio", sku: "TI-007", categoryId: informatica.id, quantity: 12, minQuantity: 5, price: 180 } }),
  ])

  console.log("Criando baixas de estoque...")
  await Promise.all([
    prisma.stockExit.create({ data: { productId: notebook.id, quantity: 2, reason: "Entrega para departamento TI", createdById: ana.id } }),
    prisma.stockExit.create({ data: { productId: papel.id, quantity: 5, reason: "Consumo administrativo", createdById: bruno.id } }),
    prisma.stockExit.create({ data: { productId: desinfetante.id, quantity: 3, reason: "Manutenção predial", createdById: ana.id } }),
    prisma.stockExit.create({ data: { productId: teclado.id, quantity: 1, reason: "Substituição por defeito", createdById: admin.id } }),
  ])

  console.log("Criando entradas de estoque...")
  await Promise.all([
    prisma.stockEntry.create({ data: { productId: notebook.id, quantity: 10, reason: "Compra do fornecedor Dell", createdById: ana.id } }),
    prisma.stockEntry.create({ data: { productId: papel.id, quantity: 50, reason: "Reposição de material de escritório", createdById: bruno.id } }),
    prisma.stockEntry.create({ data: { productId: teclado.id, quantity: 8, reason: "Compra para reposição de estoque", createdById: admin.id } }),
  ])

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
