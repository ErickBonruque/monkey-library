import { prisma } from "../lib/prisma.js"
import { productCreateSchema, productUpdateSchema } from "../schemas.js"
import { serializeProduct } from "../lib/serializers.js"

export async function productRoutes(app) {
  // GET /api/products  (público)
  app.get("/", async () => {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    })
    return products.map(serializeProduct)
  })

  // POST /api/products  (protegido)
  app.post("/", { onRequest: [app.authenticate] }, async (request, reply) => {
    const data = productCreateSchema.parse(request.body)

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
    if (!category) {
      return reply.status(400).send({ message: "Categoria não encontrada" })
    }

    const product = await prisma.product.create({
      data,
      include: { category: true },
    })
    return reply.status(201).send(serializeProduct(product))
  })

  // PUT /api/products/:id  (protegido)
  app.put("/:id", { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params
    const data = productUpdateSchema.parse(request.body)

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return reply.status(404).send({ message: "Produto não encontrado" })
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
      if (!category) {
        return reply.status(400).send({ message: "Categoria não encontrada" })
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    })
    return reply.send(serializeProduct(product))
  })

  // DELETE /api/products/:id  (protegido)
  app.delete("/:id", { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return reply.status(404).send({ message: "Produto não encontrado" })
    }

    await prisma.product.delete({ where: { id } })
    return reply.status(204).send()
  })
}
