import { prisma } from "../lib/prisma.js"
import { purchaseCreateSchema, idParamSchema } from "../schemas.js"
import { serializePurchaseOrder } from "../lib/serializers.js"
import { createEntry } from "../lib/stock.js"

const orderInclude = {
  items: { include: { product: true } },
  createdBy: true,
  approvedBy: true,
}

export async function purchaseRoutes(app) {
  // GET /api/purchases  (protegido) — lista as solicitações de compra
  app.get(
    "/",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Purchases"],
        summary: "Lista as solicitações de compra",
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const orders = await prisma.purchaseOrder.findMany({
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      })
      return orders.map(serializePurchaseOrder)
    }
  )

  // POST /api/purchases  (admin/manager) — cria a solicitação (status pending)
  app.post(
    "/",
    {
      onRequest: [app.authenticate, app.authorize(["admin", "manager"])],
      schema: {
        tags: ["Purchases"],
        summary: "Cria uma solicitação de compra",
        security: [{ bearerAuth: [] }],
        body: purchaseCreateSchema,
      },
    },
    async (request, reply) => {
      const { supplier, notes, items } = request.body

      // Garante que todos os produtos existem antes de criar a solicitação.
      const productIds = [...new Set(items.map((i) => i.productId))]
      const found = await prisma.product.count({ where: { id: { in: productIds } } })
      if (found !== productIds.length) {
        return reply.status(400).send({ message: "Há produtos inválidos na solicitação" })
      }

      const order = await prisma.purchaseOrder.create({
        data: {
          supplier,
          notes,
          createdById: request.user.sub,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitCost: i.unitCost,
            })),
          },
        },
        include: orderInclude,
      })
      return reply.status(201).send(serializePurchaseOrder(order))
    }
  )

  // POST /api/purchases/:id/approve  (admin) — aprova a solicitação.
  // A aprovação é um passo de governança restrito a administradores.
  app.post(
    "/:id/approve",
    {
      onRequest: [app.authenticate, app.authorize(["admin"])],
      schema: {
        tags: ["Purchases"],
        summary: "Aprova uma solicitação de compra (apenas admin)",
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
      },
    },
    async (request, reply) => {
      const order = await prisma.purchaseOrder.findUnique({ where: { id: request.params.id } })
      if (!order) return reply.status(404).send({ message: "Compra não encontrada" })
      if (order.status !== "pending") {
        return reply.status(400).send({ message: "Apenas compras pendentes podem ser aprovadas" })
      }

      const updated = await prisma.purchaseOrder.update({
        where: { id: order.id },
        data: { status: "approved", approvedAt: new Date(), approvedById: request.user.sub },
        include: orderInclude,
      })
      return reply.send(serializePurchaseOrder(updated))
    }
  )

  // POST /api/purchases/:id/receive  (admin/manager) — registra o recebimento:
  // gera as entradas (lotes com custo) de cada item e atualiza o estoque.
  app.post(
    "/:id/receive",
    {
      onRequest: [app.authenticate, app.authorize(["admin", "manager"])],
      schema: {
        tags: ["Purchases"],
        summary: "Recebe a compra: gera entradas/lotes e repõe o estoque",
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user.sub
      const order = await prisma.purchaseOrder.findUnique({
        where: { id: request.params.id },
        include: { items: true },
      })
      if (!order) return reply.status(404).send({ message: "Compra não encontrada" })
      if (order.status !== "approved") {
        return reply.status(400).send({ message: "Apenas compras aprovadas podem ser recebidas" })
      }

      const updated = await prisma.$transaction(async (tx) => {
        // Cada item recebido vira uma entrada com seu custo (gera um lote).
        for (const item of order.items) {
          await createEntry(tx, {
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            reason: `Recebimento da compra ${order.id} — ${order.supplier}`,
            userId,
            purchaseOrderId: order.id,
          })
        }
        return tx.purchaseOrder.update({
          where: { id: order.id },
          data: { status: "received", receivedAt: new Date() },
          include: orderInclude,
        })
      })

      return reply.send(serializePurchaseOrder(updated))
    }
  )

  // POST /api/purchases/:id/cancel  (admin/manager) — cancela enquanto não recebida
  app.post(
    "/:id/cancel",
    {
      onRequest: [app.authenticate, app.authorize(["admin", "manager"])],
      schema: {
        tags: ["Purchases"],
        summary: "Cancela uma compra ainda não recebida",
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
      },
    },
    async (request, reply) => {
      const order = await prisma.purchaseOrder.findUnique({ where: { id: request.params.id } })
      if (!order) return reply.status(404).send({ message: "Compra não encontrada" })
      if (order.status === "received") {
        return reply.status(400).send({ message: "Compra já recebida não pode ser cancelada" })
      }
      if (order.status === "cancelled") {
        return reply.status(400).send({ message: "Compra já está cancelada" })
      }

      const updated = await prisma.purchaseOrder.update({
        where: { id: order.id },
        data: { status: "cancelled" },
        include: orderInclude,
      })
      return reply.send(serializePurchaseOrder(updated))
    }
  )
}
