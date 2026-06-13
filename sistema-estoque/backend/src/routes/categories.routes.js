import { prisma } from "../lib/prisma.js"
import { categoryCreateSchema } from "../schemas.js"
import { serializeCategory } from "../lib/serializers.js"

export async function categoryRoutes(app) {
  // GET /api/categories  (público)
  app.get("/", async () => {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
    return categories.map(serializeCategory)
  })

  // POST /api/categories  (protegido)
  app.post("/", { onRequest: [app.authenticate] }, async (request, reply) => {
    const data = categoryCreateSchema.parse(request.body)
    const category = await prisma.category.create({ data })
    return reply.status(201).send(serializeCategory(category))
  })
}
