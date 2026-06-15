# Back-end — Sistema de Estoque

API REST do Sistema de Estoque, desenvolvida conforme o material de apoio do
trabalho de Back-end (CC6PDSW). Responsável por atender o front-end Next.js
desenvolvido anteriormente.

## Tecnologias

- **Node.js** — runtime
- **Fastify** — framework HTTP
- **Prisma ORM** — acesso ao banco de dados
- **SQLite** — banco de dados (sem necessidade de servidor)
- **Zod** — validação das entradas
- **@fastify/jwt** + **bcryptjs** — autenticação e hash de senhas
- **@fastify/cors** — liberação de acesso para o front-end
- **@fastify/swagger** + **swagger-ui** — documentação OpenAPI interativa em `/docs`
- **dotenv** — variáveis de ambiente

## Como rodar

```bash
cd backend
npm install

# copie as variáveis de ambiente
cp .env.example .env

# cria o banco SQLite e gera o Prisma Client
npx prisma migrate dev

# popula o banco com dados de exemplo (inclui o admin padrão)
npm run seed

# inicia o servidor (http://localhost:3333)
npm run dev
```

### Usuário padrão

- **E-mail:** admin@admin.com
- **Senha:** 123456

## Variáveis de ambiente (`.env`)

| Variável      | Descrição                                   | Padrão                  |
| ------------- | ------------------------------------------- | ----------------------- |
| `DATABASE_URL`| String de conexão do SQLite                 | `file:./dev.db`         |
| `PORT`        | Porta do servidor                           | `3333`                  |
| `JWT_SECRET`  | Segredo para assinar os tokens JWT          | —                       |
| `CORS_ORIGIN` | Origem permitida (front-end)                | `http://localhost:3000` |

## Documentação interativa (Swagger)

Com o servidor rodando, a documentação OpenAPI fica disponível em:

```
http://localhost:3333/docs
```

A especificação é gerada automaticamente a partir dos schemas Zod das rotas
(via `@fastify/swagger` + `@fastify/swagger-ui` + `fastify-type-provider-zod`),
então a doc nunca fica defasada em relação à validação. Para testar rotas
protegidas na interface, faça login, clique em **Authorize** e cole o token JWT.
O JSON da spec fica em `http://localhost:3333/docs/json`.

## Endpoints

Todas as rotas têm o prefixo `/api`. Rotas protegidas exigem o header
`Authorization: Bearer <token>`.

| Método | Rota                  | Proteção | Descrição                          |
| ------ | --------------------- | -------- | ---------------------------------- |
| POST   | `/auth/login`         | Pública  | Autentica e retorna o token JWT    |
| POST   | `/auth/register`      | Pública  | Cria um usuário (papel `viewer`)   |
| GET    | `/products`           | Pública  | Lista produtos                     |
| POST   | `/products`           | Privada  | Cria produto                       |
| PUT    | `/products/:id`       | Privada  | Atualiza produto                   |
| DELETE | `/products/:id`       | Privada  | Remove produto                     |
| GET    | `/categories`         | Pública  | Lista categorias                   |
| POST   | `/categories`         | Privada  | Cria categoria                     |
| GET    | `/exits`              | Privada  | Lista baixas de estoque            |
| POST   | `/exits`              | Privada  | Registra baixa (abate o estoque)   |
| GET    | `/kpis`               | Privada  | Métricas do dashboard              |
| GET    | `/users`              | Privada  | Lista usuários                     |
| PUT    | `/users/:id`          | Privada  | Atualiza usuário                   |
| POST   | `/users/invite`       | Privada  | Convida (cadastra) usuário         |
| GET    | `/health`             | Pública  | Health check                       |

## Estrutura (arquitetura em camadas)

```
backend/
├── prisma/
│   ├── schema.prisma     # modelos do banco (User, Category, Product, StockExit)
│   └── seed.js           # dados iniciais
└── src/
    ├── server.js         # bootstrap do servidor
    ├── app.js            # configuração do Fastify (CORS, JWT, erros, rotas)
    ├── schemas.js        # validações Zod
    ├── lib/
    │   ├── prisma.js     # instância do Prisma Client
    │   └── serializers.js# conversão dos modelos para o formato do front-end
    └── routes/           # rotas separadas por entidade
```

## Decisões técnicas

- **SQLite + Prisma**: conforme recomendação do material de apoio, dispensa a
  instalação de um servidor de banco e simplifica a configuração do ambiente.
- **IDs em `cuid()`**: o front-end já trabalha com IDs do tipo `string`, então
  os modelos usam `cuid()` em vez de inteiros autoincrementais.
- **Autenticação JWT**: o token é gerado no login/registro e validado nas rotas
  privadas por um decorator `authenticate`. As senhas são armazenadas com hash
  `bcrypt`.
- **Validação com Zod**: toda entrada é validada antes de chegar ao banco;
  erros de validação retornam `400` com a lista de campos inválidos.
- **Baixa de estoque transacional**: ao registrar uma baixa, a criação do
  registro e o abatimento da quantidade do produto ocorrem em uma única
  transação (`prisma.$transaction`).
- **Serializers**: as respostas seguem exatamente o contrato esperado pelo
  front-end (ver `src/types/index.ts` do projeto Next.js), incluindo campos
  derivados como `categoryName`, `productName` e `createdBy`.
- **Escopo**: não foram implementadas funcionalidades fora do escopo mínimo
  (relatórios, envio de e-mails, convites por e-mail, integrações externas).
  O convite apenas cadastra o usuário com uma senha temporária.

## Integração com o front-end

No projeto Next.js, defina a URL da API no arquivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```
