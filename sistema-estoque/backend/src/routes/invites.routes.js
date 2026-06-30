import { randomBytes } from "node:crypto"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/prisma.js"
import { inviteSchema, acceptInviteSchema, tokenParamSchema } from "../schemas.js"
import { serializeInvite, serializeAuthUser } from "../lib/serializers.js"
import { sendMail, buildInviteEmail } from "../lib/mailer.js"

// Validade do convite: 3 dias.
const INVITE_TTL_MS = 3 * 24 * 60 * 60 * 1000

function frontendBaseUrl() {
  return (
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN?.split(",")[0] ||
    "http://localhost:3000"
  )
}

export async function inviteRoutes(app) {
  // Listagem e criação são restritas a administradores.

  // GET /api/invites  (admin) — lista os convites enviados
  app.get(
    "/",
    {
      onRequest: [app.authenticate, app.authorize(["admin"])],
      schema: {
        tags: ["Invites"],
        summary: "Lista os convites enviados",
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const invites = await prisma.invite.findMany({
        include: { invitedBy: true },
        orderBy: { createdAt: "desc" },
      })
      // Marca como expirados (apenas na exibição) os convites vencidos.
      const now = Date.now()
      return invites.map((invite) =>
        serializeInvite({
          ...invite,
          status:
            invite.status === "pending" && invite.expiresAt.getTime() < now
              ? "expired"
              : invite.status,
        })
      )
    }
  )

  // POST /api/invites  (admin) — cria o convite, gera token e envia o e-mail
  app.post(
    "/",
    {
      onRequest: [app.authenticate, app.authorize(["admin"])],
      schema: {
        tags: ["Invites"],
        summary: "Convida um usuário por e-mail (gera token e envia o link)",
        security: [{ bearerAuth: [] }],
        body: inviteSchema,
      },
    },
    async (request, reply) => {
      const { email, role } = request.body

      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return reply.status(409).send({ message: "Já existe um usuário com este e-mail" })
      }

      // Revoga convites pendentes anteriores para o mesmo e-mail.
      await prisma.invite.updateMany({
        where: { email, status: "pending" },
        data: { status: "revoked" },
      })

      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + INVITE_TTL_MS)

      const invite = await prisma.invite.create({
        data: { email, role, token, expiresAt, invitedById: request.user.sub },
        include: { invitedBy: true },
      })

      const acceptUrl = `${frontendBaseUrl()}/convite/${token}`
      let previewUrl = null
      try {
        const result = await sendMail({
          to: email,
          subject: "Convite para o Sistema de Estoque",
          html: buildInviteEmail({ acceptUrl, role, expiresAt }),
        })
        previewUrl = result.previewUrl
      } catch (err) {
        // O convite continua válido mesmo se o envio falhar; o link é retornado.
        request.log.error({ err }, "Falha ao enviar e-mail de convite")
      }

      // previewUrl: link do Ethereal para visualizar o e-mail enviado.
      // acceptUrl: link direto de cadastro (útil para validação do trabalho).
      return reply.status(201).send({ ...serializeInvite(invite), previewUrl, acceptUrl })
    }
  )

  // POST /api/invites/:id/resend  (admin) — reenvia o e-mail do convite
  app.post(
    "/:id/resend",
    {
      onRequest: [app.authenticate, app.authorize(["admin"])],
      schema: {
        tags: ["Invites"],
        summary: "Reenvia o e-mail de um convite pendente",
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const invite = await prisma.invite.findUnique({ where: { id: request.params.id } })
      if (!invite) return reply.status(404).send({ message: "Convite não encontrado" })
      if (invite.status !== "pending") {
        return reply.status(400).send({ message: "Convite não está mais pendente" })
      }

      const acceptUrl = `${frontendBaseUrl()}/convite/${invite.token}`
      const { previewUrl } = await sendMail({
        to: invite.email,
        subject: "Convite para o Sistema de Estoque",
        html: buildInviteEmail({ acceptUrl, role: invite.role, expiresAt: invite.expiresAt }),
      })
      return reply.send({ previewUrl, acceptUrl })
    }
  )

  // GET /api/invites/token/:token  (público) — valida o token e retorna os
  // dados do convite para a tela de cadastro.
  app.get(
    "/token/:token",
    {
      schema: {
        tags: ["Invites"],
        summary: "Valida um token de convite e retorna seus dados",
        params: tokenParamSchema,
      },
    },
    async (request, reply) => {
      const invite = await prisma.invite.findUnique({ where: { token: request.params.token } })
      if (!invite || invite.status === "revoked") {
        return reply.status(404).send({ message: "Convite inválido" })
      }
      if (invite.status === "accepted") {
        return reply.status(409).send({ message: "Este convite já foi utilizado" })
      }
      if (invite.expiresAt.getTime() < Date.now()) {
        return reply.status(410).send({ message: "Este convite expirou" })
      }
      return reply.send({ email: invite.email, role: invite.role, expiresAt: invite.expiresAt.toISOString() })
    }
  )

  // POST /api/invites/token/:token/accept  (público) — conclui o cadastro,
  // criando o usuário com o papel previamente definido no convite.
  app.post(
    "/token/:token/accept",
    {
      schema: {
        tags: ["Invites"],
        summary: "Aceita o convite e cria o usuário com o papel definido",
        params: tokenParamSchema,
        body: acceptInviteSchema,
      },
    },
    async (request, reply) => {
      const { name, password } = request.body
      const invite = await prisma.invite.findUnique({ where: { token: request.params.token } })

      if (!invite || invite.status === "revoked") {
        return reply.status(404).send({ message: "Convite inválido" })
      }
      if (invite.status === "accepted") {
        return reply.status(409).send({ message: "Este convite já foi utilizado" })
      }
      if (invite.expiresAt.getTime() < Date.now()) {
        return reply.status(410).send({ message: "Este convite expirou" })
      }

      const existingUser = await prisma.user.findUnique({ where: { email: invite.email } })
      if (existingUser) {
        return reply.status(409).send({ message: "Já existe um usuário com este e-mail" })
      }

      const hashed = await bcrypt.hash(password, 8)

      // Cria o usuário e marca o convite como aceito de forma atômica.
      const [user] = await prisma.$transaction([
        prisma.user.create({
          data: { name, email: invite.email, password: hashed, role: invite.role, status: "active" },
        }),
        prisma.invite.update({
          where: { id: invite.id },
          data: { status: "accepted", acceptedAt: new Date() },
        }),
      ])

      const token = app.jwt.sign(
        { sub: user.id, name: user.name, role: user.role },
        { expiresIn: "7d" }
      )

      return reply.status(201).send({ user: serializeAuthUser(user), token })
    }
  )
}
