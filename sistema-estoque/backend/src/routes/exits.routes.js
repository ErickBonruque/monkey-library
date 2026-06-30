import { prisma } from "../lib/prisma.js"
import { exitCreateSchema } from "../schemas.js"
import { serializeExit } from "../lib/serializers.js"
import { createExit, ProductNotFoundError, InsufficientStockError } from "../lib/stock.js"

export async function exitRoutes(app) {
  // GET /api/exits  (protegido — dado operacional do estoque)
  app.get(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Exits"],
        summary: "Lista as baixas de estoque",
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const exits = await prisma.stockExit.findMany({
        include: { product: true, createdBy: true },
        orderBy: { createdAt: "desc" },
      })
      return exits.map(serializeExit)
    }
  )

  // POST /api/exits  (protegido — admin ou manager) — registra baixa, consome
  // os lotes em FIFO e apura o custo (CMV) da movimentação.
  app.post(
    "/",
    {
      onRequest: [app.authenticate, app.authorize(["admin", "manager"])],
      schema: {
        tags: ["Exits"],
        summary: "Registra uma baixa, consome lotes (FIFO) e calcula o custo",
        security: [{ bearerAuth: [] }],
        body: exitCreateSchema,
      },
    },
    async (request, reply) => {
      const { productId, quantity, reason } = request.body
      const userId = request.user.sub

      try {
        const exit = await prisma.$transaction((tx) =>
          createExit(tx, { productId, quantity, reason, userId })
        )
        return reply.status(201).send(serializeExit(exit))
      } catch (err) {
        if (err instanceof ProductNotFoundError) {
          return reply.status(404).send({ message: "Produto não encontrado" })
        }
        if (err instanceof InsufficientStockError) {
          return reply.status(400).send({ message: "Quantidade em estoque insuficiente" })
        }
        throw err
      }
    }
  )
}
