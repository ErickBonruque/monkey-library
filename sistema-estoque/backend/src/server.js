import "dotenv/config"
import { buildApp } from "./app.js"

const app = buildApp()
const port = Number(process.env.PORT) || 3333

app
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`Servidor rodando em http://localhost:${port}`)
  })
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
