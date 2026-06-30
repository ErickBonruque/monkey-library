import { prisma } from "../lib/prisma.js"
import { productCreateSchema, productUpdateSchema, idParamSchema } from "../schemas.js"
import { serializeProduct } from "../lib/serializers.js"

export async function productRoutes(app) {
  // GET /api/products  (público)
  app.get(
    "/",
    { schema: { tags: ["Products"], summary: "Lista todos os produtos" } },
    async () => {
      const products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
      })
      return products.map(serializeProduct)
    }
  )

  // POST /api/products  (protegido — admin ou manager)
  app.post(
    "/",
    {
      onRequest: [app.authenticate, app.authorize(["admin", "manager"])],
      schema: {
        tags: ["Products"],
        summary: "Cria um produto",
        security: [{ bearerAuth: [] }],
        body: productCreateSchema,
      },
    },
    async (request, reply) => {
      const data = request.body

      const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
      if (!category) {
        return reply.status(400).send({ message: "Categoria não encontrada" })
      }

      const product = await prisma.product.create({
        data,
        include: { category: true },
      })
      return reply.status(201).send(serializeProduct(product))
    }
  )

  // PUT /api/products/:id  (protegido — admin ou manager)
  app.put(
    "/:id",
    {
      onRequest: [app.authenticate, app.authorize(["admin", "manager"])],
      schema: {
        tags: ["Products"],
        summary: "Atualiza um produto",
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: productUpdateSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const data = request.body

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
    }
  )

  // DELETE /api/products/:id  (protegido — admin ou manager)
  app.delete(
    "/:id",
    {
      onRequest: [app.authenticate, app.authorize(["admin", "manager"])],
      schema: {
        tags: ["Products"],
        summary: "Remove um produto",
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const existing = await prisma.product.findUnique({ where: { id } })
      if (!existing) {
        return reply.status(404).send({ message: "Produto não encontrado" })
      }

      await prisma.product.delete({ where: { id } })
      return reply.status(204).send()
    }
  )
}
