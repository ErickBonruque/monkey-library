import Fastify from "fastify"
import cors from "@fastify/cors"
import jwt from "@fastify/jwt"
import swagger from "@fastify/swagger"
import swaggerUI from "@fastify/swagger-ui"
import { ZodError } from "zod"
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  hasZodFastifySchemaValidationErrors,
} from "fastify-type-provider-zod"

import { authRoutes } from "./routes/auth.routes.js"
import { productRoutes } from "./routes/products.routes.js"
import { categoryRoutes } from "./routes/categories.routes.js"
import { exitRoutes } from "./routes/exits.routes.js"
import { kpiRoutes } from "./routes/kpis.routes.js"
import { userRoutes } from "./routes/users.routes.js"

export function buildApp() {
  const app = Fastify({ logger: true })

  // Integra o Zod ao ciclo de validação/serialização do Fastify. Assim os
  // mesmos schemas usados nas rotas também alimentam a documentação Swagger.
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // CORS: libera o front-end Next.js a consumir a API.
  app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
  })

  // Autenticação via JWT.
  app.register(jwt, {
    secret: process.env.JWT_SECRET || "fallback-secret",
  })

  // Documentação OpenAPI gerada a partir dos schemas Zod das rotas.
  app.register(swagger, {
    openapi: {
      info: {
        title: "Sistema de Estoque — API REST",
        description:
          "API do Sistema de Estoque (Fastify + Prisma + SQLite). " +
          "Rotas protegidas exigem o header Authorization: Bearer <token>.",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:3333", description: "Servidor local" }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      tags: [
        { name: "Auth", description: "Autenticação e registro" },
        { name: "Products", description: "Produtos do estoque" },
        { name: "Categories", description: "Categorias de produtos" },
        { name: "Exits", description: "Baixas (saídas) de estoque" },
        { name: "KPIs", description: "Métricas do dashboard" },
        { name: "Users", description: "Gestão de usuários" },
      ],
    },
    transform: jsonSchemaTransform,
  })

  // Interface visual interativa em http://localhost:3333/docs
  app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true },
  })

  // Decorator usado nas rotas protegidas: valida o token Bearer.
  app.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.status(401).send({ message: "Não autorizado" })
    }
  })

  // Tratamento centralizado de erros (validação -> 400).
  app.setErrorHandler((error, request, reply) => {
    // Erros de validação dos schemas Zod acoplados às rotas.
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({
        message: "Erro de validação",
        issues: error.validation.map((e) => ({
          field: e.params?.issue?.path?.join(".") || e.instancePath || "",
          message: e.params?.issue?.message ?? e.message,
        })),
      })
    }
    // Erros de validação Zod lançados manualmente (defensivo).
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
  app.get("/api/health", { schema: { tags: ["KPIs"], summary: "Health check" } }, async () => ({
    status: "ok",
  }))

  // Registro das rotas da aplicação sob o prefixo /api.
  app.register(authRoutes, { prefix: "/api/auth" })
  app.register(productRoutes, { prefix: "/api/products" })
  app.register(categoryRoutes, { prefix: "/api/categories" })
  app.register(exitRoutes, { prefix: "/api/exits" })
  app.register(kpiRoutes, { prefix: "/api/kpis" })
  app.register(userRoutes, { prefix: "/api/users" })

  return app
}
