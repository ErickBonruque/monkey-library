import { prisma } from "../lib/prisma.js"
import { entryCreateSchema } from "../schemas.js"
import { serializeEntry } from "../lib/serializers.js"

// Sinaliza, de dentro da transação, que o produto informado não existe.
class ProductNotFoundError extends Error {}

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

  // POST /api/entries  (protegido — admin ou manager) — registra entrada e soma à quantidade do produto
  app.post(
    "/",
    {
      onRequest: [app.authenticate, app.authorize(["admin", "manager"])],
      schema: {
        tags: ["Entries"],
        summary: "Registra uma entrada e repõe o estoque (transacional)",
        security: [{ bearerAuth: [] }],
        body: entryCreateSchema,
      },
    },
    async (request, reply) => {
      const { productId, quantity, reason } = request.body

      const userId = request.user.sub

      // Controle de concorrência: a entrada e a atualização do saldo correm
      // dentro de uma única transação. O incremento é aplicado de forma
      // condicional (só se o produto existir), garantindo consistência mesmo
      // sob movimentações simultâneas.
      try {
        const entry = await prisma.$transaction(async (tx) => {
          const updated = await tx.product.updateMany({
            where: { id: productId },
            data: { quantity: { increment: quantity } },
          })
          if (updated.count === 0) {
            throw new ProductNotFoundError()
          }
          return tx.stockEntry.create({
            data: { productId, quantity, reason, createdById: userId },
            include: { product: true, createdBy: true },
          })
        })

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
