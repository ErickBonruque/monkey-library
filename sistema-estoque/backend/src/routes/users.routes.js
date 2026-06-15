import bcrypt from "bcryptjs"
import { prisma } from "../lib/prisma.js"
import { userUpdateSchema, inviteSchema, idParamSchema } from "../schemas.js"
import { serializeUser } from "../lib/serializers.js"

export async function userRoutes(app) {
  // Todas as rotas de usuários são protegidas.
  app.addHook("onRequest", app.authenticate)

  // GET /api/users
  app.get(
    "/",
    {
      schema: {
        tags: ["Users"],
        summary: "Lista os usuários",
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } })
      return users.map(serializeUser)
    }
  )

  // PUT /api/users/:id
  app.put(
    "/:id",
    {
      schema: {
        tags: ["Users"],
        summary: "Atualiza um usuário",
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: userUpdateSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const data = request.body

      const existing = await prisma.user.findUnique({ where: { id } })
      if (!existing) {
        return reply.status(404).send({ message: "Usuário não encontrado" })
      }

      const user = await prisma.user.update({ where: { id }, data })
      return reply.send(serializeUser(user))
    }
  )

  // POST /api/users/invite
  // Não há envio de e-mail (fora do escopo). Cria o usuário convidado
  // com uma senha temporária e status ativo.
  app.post(
    "/invite",
    {
      schema: {
        tags: ["Users"],
        summary: "Convida (cadastra) um usuário com senha temporária",
        security: [{ bearerAuth: [] }],
        body: inviteSchema,
      },
    },
    async (request, reply) => {
      const { email, role } = request.body

      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return reply.status(409).send({ message: "E-mail já cadastrado" })
      }

      const tempPassword = await bcrypt.hash("changeme123", 8)
      const user = await prisma.user.create({
        data: {
          name: email.split("@")[0],
          email,
          password: tempPassword,
          role,
          status: "active",
        },
      })

      return reply.status(201).send(serializeUser(user))
    }
  )
}
