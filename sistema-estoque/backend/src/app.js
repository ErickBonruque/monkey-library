import Fastify from "fastify"
import cors from "@fastify/cors"
import jwt from "@fastify/jwt"
import { ZodError } from "zod"

import { authRoutes } from "./routes/auth.routes.js"
import { productRoutes } from "./routes/products.routes.js"
import { categoryRoutes } from "./routes/categories.routes.js"
import { exitRoutes } from "./routes/exits.routes.js"
import { kpiRoutes } from "./routes/kpis.routes.js"
import { userRoutes } from "./routes/users.routes.js"

export function buildApp() {
  const app = Fastify({ logger: true })

  // CORS: libera o front-end Next.js a consumir a API.
  app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
  })

  // Autenticação via JWT.
  app.register(jwt, {
    secret: process.env.JWT_SECRET || "fallback-secret",
  })

  // Decorator usado nas rotas protegidas: valida o token Bearer.
  app.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.status(401).send({ message: "Não autorizado" })
    }
  })

  // Tratamento centralizado de erros (validação Zod -> 400).
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Erro de validação",
        issues: error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      })
    }
    request.log.error(error)
    const status = error.statusCode ?? 500
    return reply.status(status).send({
      message: status === 500 ? "Erro interno do servidor" : error.message,
    })
  })

  // Rota de health check.
  app.get("/api/health", async () => ({ status: "ok" }))

  // Registro das rotas da aplicação sob o prefixo /api.
  app.register(authRoutes, { prefix: "/api/auth" })
  app.register(productRoutes, { prefix: "/api/products" })
  app.register(categoryRoutes, { prefix: "/api/categories" })
  app.register(exitRoutes, { prefix: "/api/exits" })
  app.register(kpiRoutes, { prefix: "/api/kpis" })
  app.register(userRoutes, { prefix: "/api/users" })

  return app
}
