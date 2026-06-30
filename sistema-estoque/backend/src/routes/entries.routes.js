import { prisma } from "../lib/prisma.js"
import { entryCreateSchema } from "../schemas.js"
import { serializeEntry } from "../lib/serializers.js"
import { createEntry, ProductNotFoundError } from "../lib/stock.js"

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

  // POST /api/entries  (protegido — admin ou manager) — registra entrada,
  // gera o lote com o custo informado e repõe o estoque.
  app.post(
    "/",
    {
      onRequest: [app.authenticate, app.authorize(["admin", "manager"])],
      schema: {
        tags: ["Entries"],
        summary: "Registra uma entrada (gera lote com custo) e repõe o estoque",
        security: [{ bearerAuth: [] }],
        body: entryCreateSchema,
      },
    },
    async (request, reply) => {
      const { productId, quantity, unitCost, reason } = request.body
      const userId = request.user.sub

      try {
        const entry = await prisma.$transaction((tx) =>
          createEntry(tx, { productId, quantity, unitCost, reason, userId })
        )
        return reply.status(201).send(serializeEntry(entry))
      } catch (err) {
        if (err instanceof ProductNotFoundError) {
          return reply.status(404).send({ message: "Produto não encontrado" })
        }
        throw err
      }
    }
  )
}
