import bcrypt from "bcryptjs"
import { prisma } from "../lib/prisma.js"
import { loginSchema, registerSchema } from "../schemas.js"
import { serializeAuthUser } from "../lib/serializers.js"

export async function authRoutes(app) {
  // POST /api/auth/login
  app.post(
    "/login",
    {
      // Limite reforçado: protege contra tentativas de força bruta no login.
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: {
        tags: ["Auth"],
        summary: "Autentica o usuário e retorna o token JWT",
        body: loginSchema,
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return reply.status(401).send({ message: "Credenciais inválidas" })
      }
      if (user.status === "inactive") {
        return reply.status(403).send({ message: "Usuário inativo" })
      }

      const token = app.jwt.sign(
        { sub: user.id, name: user.name, role: user.role },
        { expiresIn: "7d" }
      )

      return reply.send({ user: serializeAuthUser(user), token })
    }
  )

  // POST /api/auth/register
  app.post(
    "/register",
    {
      schema: {
        tags: ["Auth"],
        summary: "Cria um usuário (papel viewer) e retorna o token JWT",
        body: registerSchema,
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return reply.status(409).send({ message: "E-mail já cadastrado" })
      }

      const hashed = await bcrypt.hash(password, 8)
      const user = await prisma.user.create({
        data: { name, email, password: hashed, role: "viewer", status: "active" },
      })

      const token = app.jwt.sign(
        { sub: user.id, name: user.name, role: user.role },
        { expiresIn: "7d" }
      )

      return reply.status(201).send({ user: serializeAuthUser(user), token })
    }
  )
}
