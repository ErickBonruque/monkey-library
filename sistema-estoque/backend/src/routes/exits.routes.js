import { prisma } from "../lib/prisma.js"
import { exitCreateSchema } from "../schemas.js"
import { serializeExit } from "../lib/serializers.js"

// Erros sinalizados de dentro da transação para serem tratados na resposta.
class ProductNotFoundError extends Error {}
class InsufficientStockError extends Error {}

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

  // POST /api/exits  (protegido — admin ou manager) — registra baixa e abate a quantidade do produto
  app.post(
    "/",
    {
      onRequest: [app.authenticate, app.authorize(["admin", "manager"])],
      schema: {
        tags: ["Exits"],
        summary: "Registra uma baixa e abate o estoque (transacional)",
        security: [{ bearerAuth: [] }],
        body: exitCreateSchema,
      },
    },
    async (request, reply) => {
      const { productId, quantity, reason } = request.body

      const userId = request.user.sub

      // Controle de concorrência: em vez de checar o saldo e depois abater
      // (sujeito a condição de corrida quando há baixas simultâneas), o abate
      // é feito por um UPDATE condicional atômico — só decrementa se ainda
      // houver saldo suficiente. Se nenhuma linha for afetada, ou o produto
      // não existe, ou o estoque é insuficiente. Tudo dentro de uma transação.
      try {
        const exit = await prisma.$transaction(async (tx) => {
          const updated = await tx.product.updateMany({
            where: { id: productId, quantity: { gte: quantity } },
            data: { quantity: { decrement: quantity } },
          })

          if (updated.count === 0) {
            const product = await tx.product.findUnique({ where: { id: productId } })
            throw product ? new InsufficientStockError() : new ProductNotFoundError()
          }

          return tx.stockExit.create({
            data: { productId, quantity, reason, createdById: userId },
            include: { product: true, createdBy: true },
          })
        })

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
