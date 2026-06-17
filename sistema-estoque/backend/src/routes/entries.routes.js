import { prisma } from "../lib/prisma.js"
import { entryCreateSchema } from "../schemas.js"
import { serializeEntry } from "../lib/serializers.js"

export async function entryRoutes(app) {
  // GET /api/entries  (protegido — dado operacional do estoque)
  app.get(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Entries"],
        summary: "Lista as entradas (reposições) de estoque",
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const entries = await prisma.stockEntry.findMany({
        include: { product: true, createdBy: true },
        orderBy: { createdAt: "desc" },
      })
      return entries.map(serializeEntry)
    }
  )

  // POST /api/entries  (protegido) — registra entrada e soma à quantidade do produto
  app.post(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Entries"],
        summary: "Registra uma entrada e repõe o estoque (transacional)",
        security: [{ bearerAuth: [] }],
        body: entryCreateSchema,
      },
    },
    async (request, reply) => {
      const { productId, quantity, reason } = request.body

      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) {
        return reply.status(404).send({ message: "Produto não encontrado" })
      }

      const userId = request.user.sub

      // Cria a entrada e atualiza o estoque de forma atômica.
      const [entry] = await prisma.$transaction([
        prisma.stockEntry.create({
          data: { productId, quantity, reason, createdById: userId },
          include: { product: true, createdBy: true },
        }),
        prisma.product.update({
          where: { id: productId },
          data: { quantity: { increment: quantity } },
        }),
      ])

      return reply.status(201).send(serializeEntry(entry))
    }
  )
}
