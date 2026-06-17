import { prisma } from "../lib/prisma.js"
import { categoryCreateSchema, idParamSchema } from "../schemas.js"
import { serializeCategory } from "../lib/serializers.js"

export async function categoryRoutes(app) {
  // GET /api/categories  (público)
  app.get(
    "/",
    { schema: { tags: ["Categories"], summary: "Lista todas as categorias" } },
    async () => {
      const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
      return categories.map(serializeCategory)
    }
  )

  // POST /api/categories  (protegido)
  app.post(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Categories"],
        summary: "Cria uma categoria",
        security: [{ bearerAuth: [] }],
        body: categoryCreateSchema,
      },
    },
    async (request, reply) => {
      const data = request.body
      const category = await prisma.category.create({ data })
      return reply.status(201).send(serializeCategory(category))
    }
  )

  // DELETE /api/categories/:id  (protegido) — só remove se não houver produtos
  app.delete(
    "/:id",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Categories"],
        summary: "Remove uma categoria (apenas se não tiver produtos)",
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const existing = await prisma.category.findUnique({ where: { id } })
      if (!existing) {
        return reply.status(404).send({ message: "Categoria não encontrada" })
      }

      const productCount = await prisma.product.count({ where: { categoryId: id } })
      if (productCount > 0) {
        return reply.status(400).send({
          message: "Não é possível remover: a categoria possui produtos vinculados",
        })
      }

      await prisma.category.delete({ where: { id } })
      return reply.status(204).send()
    }
  )
}
