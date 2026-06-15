import { prisma } from "../lib/prisma.js"
import { exitCreateSchema } from "../schemas.js"
import { serializeExit } from "../lib/serializers.js"

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

  // POST /api/exits  (protegido) — registra baixa e abate a quantidade do produto
  app.post(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Exits"],
        summary: "Registra uma baixa e abate o estoque (transacional)",
        security: [{ bearerAuth: [] }],
        body: exitCreateSchema,
      },
    },
    async (request, reply) => {
      const { productId, quantity, reason } = request.body

      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) {
        return reply.status(404).send({ message: "Produto não encontrado" })
      }
      if (product.quantity < quantity) {
        return reply.status(400).send({ message: "Quantidade em estoque insuficiente" })
      }

      const userId = request.user.sub

      // Cria a baixa e atualiza o estoque de forma atômica.
      const [exit] = await prisma.$transaction([
        prisma.stockExit.create({
          data: { productId, quantity, reason, createdById: userId },
          include: { product: true, createdBy: true },
        }),
        prisma.product.update({
          where: { id: productId },
          data: { quantity: { decrement: quantity } },
        }),
      ])

      return reply.status(201).send(serializeExit(exit))
    }
  )
}
