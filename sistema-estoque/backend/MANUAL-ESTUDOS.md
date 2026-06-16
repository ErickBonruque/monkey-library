# Manual de Estudos — Backend do Sistema de Estoque

> Guia para apresentação. Cobre **arquitetura, bibliotecas, metodologia, cada arquivo,
> como o Swagger funciona com o Zod e como o front conversa com o back.**

---

## 1. Visão geral em uma frase

API **REST** em **Node.js** feita com **Fastify**, que persiste dados no **SQLite**
através do **Prisma ORM**, valida tudo com **Zod**, protege rotas com **JWT**, e
gera a documentação **Swagger/OpenAPI automaticamente a partir dos mesmos schemas Zod**.

```
[ Front-end Next.js :3000 ]  ──HTTP/JSON (axios)──►  [ API Fastify :3333 ]  ──►  [ Prisma ]  ──►  [ SQLite (dev.db) ]
        |                                                     |
   guarda o token JWT                              valida (Zod) + autentica (JWT)
   no localStorage                                 + gera /docs (Swagger)
```

---

## 2. Stack — bibliotecas e por que cada uma existe

| Biblioteca | Papel | Por que foi escolhida |
|---|---|---|
| **Fastify** (`fastify`) | Framework web/servidor HTTP | Mais rápido e moderno que o Express; tem sistema de schemas e plugins nativo |
| **Prisma** (`@prisma/client` + `prisma`) | ORM (acesso ao banco) | Escreve consultas em JS com tipagem; gera o banco a partir de um schema |
| **SQLite** | Banco de dados | Arquivo único (`dev.db`), zero configuração — ideal para trabalho acadêmico |
| **Zod** (`zod`) | Validação de dados de entrada | Define o "formato esperado" de cada requisição em código |
| **fastify-type-provider-zod** | Ponte Zod ↔ Fastify | Faz o Fastify validar com Zod **e** transformar os schemas em documentação |
| **@fastify/swagger** | Gera o documento OpenAPI | Cria o JSON da especificação da API |
| **@fastify/swagger-ui** | Interface visual `/docs` | Página web interativa para testar a API |
| **@fastify/jwt** | Autenticação | Assina e verifica tokens JWT |
| **bcryptjs** | Segurança de senhas | Faz o *hash* das senhas (nunca salva em texto puro) |
| **@fastify/cors** | Libera o front | Permite o Next.js (`:3000`) chamar a API (`:3333`) |
| **dotenv** | Configuração | Lê variáveis do arquivo `.env` |

> **Tipo de módulo:** `"type": "module"` no `package.json` → o projeto usa **ES Modules**
> (`import/export`), não `require`.

---

## 3. Metodologia / Arquitetura

O projeto segue uma **arquitetura em camadas** com **separação de responsabilidades**:

1. **Roteamento** (`src/routes/`) — define os endpoints e o que cada um faz.
2. **Validação** (`src/schemas.js`) — Zod garante que os dados que entram são válidos.
3. **Acesso a dados** (`src/lib/prisma.js` + Prisma) — fala com o banco.
4. **Serialização** (`src/lib/serializers.js`) — formata a resposta para o front.
5. **Modelagem** (`prisma/schema.prisma`) — descreve as tabelas e relações.

Padrões/práticas aplicados:
- **REST** — recursos (`/products`, `/categories`, `/exits`, `/users`) com verbos HTTP (GET, POST, PUT, DELETE) e *status codes* corretos (200, 201, 204, 400, 401, 403, 404, 409).
- **Plugin/encapsulamento do Fastify** — cada arquivo de rota é um plugin registrado com um `prefix`.
- **Schema-first / validação declarativa** — uma fonte de verdade (Zod) para validação **e** documentação.
- **Single source para o Prisma Client** — uma única instância reutilizada (evita abrir várias conexões).
- **Tratamento de erros centralizado** — um único `setErrorHandler`.
- **Transação atômica** — baixa de estoque + atualização de quantidade num `$transaction`.

---

## 4. Os arquivos, pasta por pasta

### Raiz do backend
- **`package.json`** — dependências e scripts (`dev`, `start`, `seed`, `db:migrate`, `db:reset`).
- **`.env`** — configuração real (porta, segredo JWT, URL do banco, CORS). **Não vai pro git.**
- **`.env.example`** — modelo do `.env` para outras pessoas copiarem.

### `prisma/` — banco de dados
- **`schema.prisma`** — o coração da modelagem. Define 4 tabelas (models):
  - `User` (id, name, email único, password, role, status, createdAt)
  - `Category` (id, name, description)
  - `Product` (id, name, sku único, quantity, minQuantity, price, categoryId)
  - `StockExit` (id, quantity, reason, productId, createdById) — as "baixas"
  - **Relações:** uma categoria tem vários produtos; um produto tem várias baixas; um usuário registra várias baixas. `onDelete: Cascade` na baixa: apagar o produto apaga as baixas dele.
  - IDs gerados com `@default(cuid())` (identificadores únicos em texto).
- **`migrations/`** — histórico de alterações do banco (SQL gerado pelo Prisma). Permite recriar o banco do zero de forma versionada.
- **`seed.js`** — popula o banco com dados iniciais: usuário **admin@admin.com / 123456**, outros usuários, 4 categorias, 7 produtos e algumas baixas. As senhas entram já com *hash* (bcrypt).
- **`dev.db`** — o arquivo do banco SQLite em si.

### `src/` — código da aplicação
- **`server.js`** — ponto de entrada. Carrega o `.env`, chama `buildApp()` e sobe o servidor na porta 3333.
- **`app.js`** — onde o Fastify é montado e configurado: registra CORS, JWT, Swagger, o validador Zod, o tratador de erros, o decorator `authenticate` e todas as rotas. **É o arquivo mais importante para explicar.**
- **`schemas.js`** — todos os schemas Zod de validação (login, registro, produto, categoria, baixa, usuário, convite, param `:id`).
- **`lib/prisma.js`** — cria e exporta a instância única do Prisma Client.
- **`lib/serializers.js`** — funções que convertem o objeto do banco no formato que o front espera (ex.: data vira string ISO; produto ganha `categoryName`; nunca devolve a senha).
- **`routes/`** — um arquivo por recurso:
  - `auth.routes.js` — `POST /login`, `POST /register`
  - `products.routes.js` — CRUD de produtos
  - `categories.routes.js` — listar/criar categorias
  - `exits.routes.js` — listar/registrar baixas (com transação)
  - `kpis.routes.js` — métricas do dashboard
  - `users.routes.js` — listar/atualizar/convidar usuários

---

## 5. ⭐ Como o Swagger funciona com o Zod (o ponto central)

A ideia-chave: **uma única definição (o schema Zod) serve para DUAS coisas ao mesmo tempo** —
validar a requisição **e** gerar a documentação. Não há documentação escrita à mão e
desatualizada: ela nasce do próprio código.

### O passo a passo (tudo acontece no `app.js`)

**1) Liga o Zod ao motor de validação do Fastify:**
```js
app.setValidatorCompiler(validatorCompiler)   // valida a entrada usando Zod
app.setSerializerCompiler(serializerCompiler) // serializa a saída usando Zod
```
A partir daqui, quando uma rota declara `schema: { body: loginSchema }`, o Fastify
usa o Zod para validar automaticamente — se vier inválido, nem entra no handler.

**2) Registra o Swagger com o "tradutor":**
```js
app.register(swagger, {
  openapi: { info, servers, components, tags },
  transform: jsonSchemaTransform,   // ← converte Zod → JSON Schema (formato do OpenAPI)
})
```
O `jsonSchemaTransform` (da lib `fastify-type-provider-zod`) pega cada schema Zod das
rotas e o traduz para **JSON Schema**, que é a linguagem que o OpenAPI/Swagger entende.

**3) Registra a interface visual:**
```js
app.register(swaggerUI, { routePrefix: "/docs" })  // página em http://localhost:3333/docs
```

### O resultado prático

Quando você escreve numa rota:
```js
app.post("/login", {
  schema: {
    tags: ["Auth"],
    summary: "Autentica o usuário e retorna o token JWT",
    body: loginSchema,   // ← o MESMO schema Zod
  },
}, handler)
```
Acontece tudo isto, de graça:
- ✅ O Fastify **valida** o corpo da requisição com o `loginSchema`.
- ✅ O Swagger **documenta** essa rota com os campos, tipos e mensagens.
- ✅ A página `/docs` mostra a rota, agrupada pela tag "Auth", pronta para testar.

> **Frase para a banca:** *"A documentação é gerada a partir dos schemas de validação,
> então código e documentação nunca ficam fora de sincronia — é a abordagem schema-first."*

### O cadeado 🔒 no Swagger (JWT)
No `app.js` é declarado um *security scheme* `bearerAuth` (tipo HTTP Bearer / JWT).
Cada rota protegida adiciona `security: [{ bearerAuth: [] }]` no schema → o Swagger
mostra o cadeado e um botão **Authorize** para colar o token e testar rotas protegidas.

---

## 6. Como funciona a autenticação (JWT)

1. Usuário envia email+senha em `POST /api/auth/login`.
2. O backend busca o usuário, compara a senha com `bcrypt.compare` (contra o *hash* salvo).
3. Se bater, gera um **token JWT** assinado com o `JWT_SECRET`, válido por 7 dias,
   contendo `{ sub: id, name, role }`.
4. O front guarda esse token no `localStorage` e o envia em **toda** requisição no header
   `Authorization: Bearer <token>`.
5. Rotas protegidas usam `onRequest: [app.authenticate]`. Esse decorator chama
   `request.jwtVerify()`; se o token for inválido/ausente → responde **401 Não autorizado**.

> **Senha nunca é salva em texto puro** — só o hash bcrypt. E a API nunca devolve a senha
> (os serializers omitem o campo).

**Rotas públicas vs protegidas:**
- Públicas: `GET /products`, `GET /categories`, `login`, `register`, `health`.
- Protegidas (precisam de token): criar/editar/excluir produtos e categorias, todas as
  baixas (`/exits`), KPIs e tudo de `/users`.

---

## 7. Fluxo completo de uma requisição (exemplo: registrar uma baixa)

```
1. Front: estoqueService.registerExit() → axios POST /api/exits  (com Bearer token)
2. CORS deixa passar (origem :3000 permitida)
3. onRequest: app.authenticate → verifica o JWT (senão 401)
4. Validação Zod: exitCreateSchema confere productId, quantity, reason (senão 400)
5. Handler: confere se o produto existe (404) e se há estoque suficiente (400)
6. Prisma $transaction (atômico):
     - cria o StockExit
     - decrementa a quantidade do Product
7. serializeExit() formata a resposta
8. Responde 201 Created com a baixa criada → front atualiza a tela
```

O `$transaction` garante que **ou as duas operações acontecem, ou nenhuma** — nunca
registra a baixa sem abater o estoque (consistência).

---

## 8. Conexão Front-end ↔ Back-end

- **`src/lib/api.ts` (front)** — cria o cliente **axios** apontando para
  `NEXT_PUBLIC_API_URL` (`http://localhost:3333/api`). Dois *interceptors*:
  - **Request:** injeta automaticamente o `Authorization: Bearer <token>` em toda chamada.
  - **Response:** se receber **401**, limpa o token e redireciona para `/login`.
- **`src/services/`** — funções que chamam os endpoints (`estoqueService.getProducts()`, etc.).
- **`src/contexts/auth-context.tsx`** — guarda usuário+token, faz login/logout e persiste no `localStorage`.
- **CORS no back** — `@fastify/cors` libera a origem `http://localhost:3000` para o navegador aceitar as respostas.

---

## 9. Perguntas que o professor pode fazer (com respostas)

- **Por que Fastify e não Express?** Mais performático, suporte nativo a schemas/validação e plugins, e integração direta com geração de OpenAPI.
- **O que é um ORM / por que Prisma?** Camada que traduz objetos JS ↔ tabelas SQL. Evita escrever SQL na mão, dá tipagem e *migrations* versionadas.
- **Como as senhas estão protegidas?** Hash com bcrypt (mão única + *salt*); a senha nunca é armazenada nem retornada em texto.
- **O que é JWT?** Um token assinado que carrega a identidade do usuário; o servidor valida a assinatura sem precisar de sessão no banco (autenticação *stateless*).
- **Como a documentação é gerada?** A partir dos schemas Zod das rotas, traduzidos para OpenAPI pelo `jsonSchemaTransform` — schema-first.
- **O que é uma migration?** Um arquivo SQL versionado que descreve uma mudança na estrutura do banco; permite recriar/evoluir o schema de forma reproduzível.
- **Por que a baixa usa transação?** Para manter consistência: criar a baixa e abater a quantidade têm que acontecer juntas.
- **O que são os serializers?** Funções que controlam exatamente o que sai na resposta (formato de data, esconder senha, achatar `categoryName`).

---

## 10. Roteiro de demonstração ao vivo (sugestão)

1. **Subir tudo:** `./start.sh` (sobe API :3333 e front :3000).
2. **Abrir o Swagger:** `http://localhost:3333/docs` — mostre as tags e as rotas.
3. **Fazer login pelo Swagger:** rode `POST /api/auth/login` com `admin@admin.com` / `123456`,
   copie o `token`, clique em **Authorize** e cole. Mostre o cadeado abrindo.
4. **Testar uma rota protegida:** rode `GET /api/kpis` autenticado → 200.
   Remova o token e rode de novo → **401** (mostra a segurança funcionando).
5. **Mostrar a validação:** envie um produto sem `name` → **400 Erro de validação** com a mensagem do Zod.
6. **Abrir o front (`:3000`):** faça login, navegue pelo estoque, registre uma baixa
   e mostre o estoque diminuindo — provando a conexão front ↔ back ↔ banco.

---

## Glossário rápido

- **REST** — estilo de API baseado em recursos + verbos HTTP.
- **Endpoint** — uma URL+verbo (ex.: `POST /api/products`).
- **Schema** — descrição do formato esperado dos dados.
- **OpenAPI/Swagger** — padrão para descrever APIs; Swagger UI é a página interativa.
- **JWT** — JSON Web Token, token de autenticação assinado.
- **Hash** — transformação de mão única (usada em senhas).
- **ORM** — Object-Relational Mapping (Prisma).
- **Migration** — alteração versionada da estrutura do banco.
- **Serializer** — formata o objeto antes de enviar na resposta.
- **CORS** — política que autoriza o navegador a chamar outra origem.
