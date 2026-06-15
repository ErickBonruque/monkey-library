import { prisma } from "../lib/prisma.js"
import { categoryCreateSchema } from "../schemas.js"
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
}
