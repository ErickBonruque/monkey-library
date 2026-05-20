# Sistema de Estoque

Aplicação web de gerenciamento de estoque desenvolvida com Next.js 16 (App Router), React 19 e TypeScript. O projeto simula um sistema corporativo com área pública, autenticação e painel administrativo completo.

---

## Índice

- [Tecnologias](#tecnologias)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Arquitetura de Rotas](#arquitetura-de-rotas)
- [Sistema de Layouts](#sistema-de-layouts)
- [Autenticação](#autenticação)
- [Serviços e Dados Mock](#serviços-e-dados-mock)
- [Validação de Formulários](#validação-de-formulários)
- [Componentes](#componentes)
- [Hooks](#hooks)
- [Tipos](#tipos)
- [Como rodar](#como-rodar)

---

## Tecnologias

### Core

| Pacote | Versão | Função |
|---|---|---|
| `next` | 16.2.6 | Framework React com App Router e SSR |
| `react` / `react-dom` | 19.2.4 | Biblioteca base de UI |
| `typescript` | ^5 | Tipagem estática |

### Estilização

| Pacote | Versão | Função |
|---|---|---|
| `tailwindcss` | ^4 | Utilitários CSS |
| `@tailwindcss/postcss` | ^4 | Integração PostCSS |
| `tw-animate-css` | ^1.4.0 | Animações via classes Tailwind |
| `class-variance-authority` | ^0.7.1 | Variantes de componentes com CVA |
| `clsx` + `tailwind-merge` | ^2.1.1 / ^3.6.0 | Composição segura de classes CSS |

### Componentes UI

| Pacote | Versão | Função |
|---|---|---|
| `shadcn` | ^4.7.0 | CLI de componentes baseados em Radix UI |
| `@base-ui/react` | ^1.4.1 | Primitivos acessíveis sem estilo |
| `lucide-react` | ^1.16.0 | Biblioteca de ícones SVG |
| `recharts` | ^3.8.0 | Gráficos declarativos (barras, pizza) |
| `sonner` | ^2.0.7 | Toast notifications |
| `next-themes` | ^0.4.6 | Suporte a tema claro/escuro |

### Gerenciamento de Estado e Dados

| Pacote | Versão | Função |
|---|---|---|
| `@tanstack/react-query` | ^5.100.11 | Cache, sincronização e estado assíncrono |
| `axios` | ^1.16.1 | Cliente HTTP com interceptors |

### Formulários e Validação

| Pacote | Versão | Função |
|---|---|---|
| `react-hook-form` | ^7.76.0 | Gerenciamento de formulários performático |
| `@hookform/resolvers` | ^5.2.2 | Integração do RHF com validadores externos |
| `zod` | ^4.4.3 | Validação de esquemas com inferência de tipos |

### Utilitários

| Pacote | Versão | Função |
|---|---|---|
| `date-fns` | ^4.2.1 | Formatação e manipulação de datas |

---

## Estrutura de Pastas

```
sistema-estoque/
├── public/                          # Assets estáticos
│   └── *.svg
│
└── src/
    ├── app/                         # App Router — roteamento por pastas
    │   ├── layout.tsx               # Layout raiz (HTML, providers globais)
    │   ├── globals.css              # CSS global e tokens Tailwind
    │   ├── not-found.tsx            # Página 404
    │   │
    │   ├── (public)/                # Route group público (sem prefixo na URL)
    │   │   ├── layout.tsx           # Header + Footer públicos
    │   │   ├── page.tsx             # / → Landing page
    │   │   ├── login/page.tsx       # /login
    │   │   ├── cadastro/page.tsx    # /cadastro
    │   │   ├── sobre/page.tsx       # /sobre
    │   │   └── contato/page.tsx     # /contato
    │   │
    │   └── admin/                   # Área protegida
    │       ├── layout.tsx           # AuthGuard + Sidebar + Header
    │       ├── page.tsx             # /admin → Dashboard com KPIs
    │       ├── usuarios/page.tsx    # /admin/usuarios
    │       ├── convidar/page.tsx    # /admin/convidar
    │       └── estoque/
    │           ├── layout.tsx       # Sub-navegação por abas
    │           ├── page.tsx         # /admin/estoque → Listagem
    │           ├── baixas/page.tsx  # /admin/estoque/baixas
    │           ├── cadastros/page.tsx   # /admin/estoque/cadastros
    │           ├── metricas/page.tsx    # /admin/estoque/metricas
    │           └── relatorios/page.tsx  # /admin/estoque/relatorios
    │
    ├── components/
    │   ├── auth/
    │   │   └── auth-guard.tsx       # Proteção de rotas no cliente
    │   ├── layout/
    │   │   ├── public-header.tsx    # Cabeçalho público (responsivo, hamburguer)
    │   │   ├── public-footer.tsx    # Rodapé público
    │   │   ├── admin-sidebar.tsx    # Sidebar colapsável do painel
    │   │   └── admin-header.tsx     # Header do admin (avatar + dropdown logout)
    │   ├── shadcn/                  # Componentes shadcn/ui customizados
    │   │   ├── avatar.tsx
    │   │   ├── badge.tsx
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── chart.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── field.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── select.tsx
    │   │   ├── separator.tsx
    │   │   ├── sheet.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── sonner.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   └── textarea.tsx
    │   └── shared/
    │       ├── empty-state.tsx      # Estado vazio genérico
    │       └── page-header.tsx      # Cabeçalho de página interno
    │
    ├── contexts/
    │   └── auth-context.tsx         # Context de autenticação global
    │
    ├── hooks/
    │   ├── use-auth.ts              # Atalho para o AuthContext
    │   └── use-debounce.ts          # Debounce genérico para inputs
    │
    ├── lib/
    │   ├── api.ts                   # Instância Axios + interceptors
    │   ├── query-client.tsx         # Provider do TanStack Query
    │   └── utils.ts                 # Função cn() (clsx + tailwind-merge)
    │
    ├── mocks/
    │   └── index.ts                 # Dados simulados de usuários, produtos, etc.
    │
    ├── schemas/
    │   └── index.ts                 # Esquemas Zod e tipos inferidos
    │
    ├── services/
    │   ├── auth-service.ts          # Login e cadastro (mock com delay)
    │   ├── estoque-service.ts       # CRUD de produtos, categorias, baixas e KPIs
    │   └── user-service.ts          # Listagem e gestão de usuários
    │
    └── types/
        └── index.ts                 # Interfaces TypeScript globais
```

---

## Arquitetura de Rotas

O projeto usa o **App Router** do Next.js, onde cada pasta dentro de `src/app/` representa um segmento de URL e cada `page.tsx` dentro dela é a página renderizada naquele endereço.

### Área Pública — `(public)`

O nome entre parênteses é um **Route Group**: agrupa as rotas sob um layout comum sem adicionar nada à URL.

| URL | Arquivo | Descrição |
|---|---|---|
| `/` | `(public)/page.tsx` | Landing page com hero, funcionalidades e CTA |
| `/login` | `(public)/login/page.tsx` | Formulário de login com validação Zod |
| `/cadastro` | `(public)/cadastro/page.tsx` | Formulário de registro com confirmação de senha |
| `/sobre` | `(public)/sobre/page.tsx` | Página institucional |
| `/contato` | `(public)/contato/page.tsx` | Formulário de contato |

### Área Administrativa — `admin`

Todas as rotas abaixo são protegidas pelo `AuthGuard`.

| URL | Arquivo | Descrição |
|---|---|---|
| `/admin` | `admin/page.tsx` | Dashboard com 4 cards de KPI |
| `/admin/usuarios` | `admin/usuarios/page.tsx` | Tabela de usuários com filtro e edição de papel |
| `/admin/convidar` | `admin/convidar/page.tsx` | Formulário para convidar novo usuário |
| `/admin/estoque` | `admin/estoque/page.tsx` | Listagem de produtos com busca e filtro |
| `/admin/estoque/baixas` | `admin/estoque/baixas/page.tsx` | Registro e histórico de saídas de estoque |
| `/admin/estoque/cadastros` | `admin/estoque/cadastros/page.tsx` | Cadastro de produtos e categorias |
| `/admin/estoque/metricas` | `admin/estoque/metricas/page.tsx` | Gráfico de baixas por mês e por categoria |
| `/admin/estoque/relatorios` | `admin/estoque/relatorios/page.tsx` | Relatório consolidado com alertas de estoque mínimo |

---

## Sistema de Layouts

O Next.js App Router empilha layouts de fora para dentro. Cada `layout.tsx` envolve todos os `page.tsx` do mesmo nível e dos níveis abaixo, mantendo-se na tela enquanto apenas o conteúdo interno troca — sem reload de página.

### Camada 1 — Layout Raiz (`src/app/layout.tsx`)

Envolve **toda** a aplicação. Configura:
- Fonte Geist (Google Fonts via `next/font`)
- Tag `<html>` com `lang="pt-BR"`
- `<Providers>` → instância do TanStack Query disponível globalmente
- `<AuthProvider>` → estado de autenticação disponível globalmente
- `<Toaster>` → notificações toast no canto superior direito

### Camada 2a — Layout Público (`src/app/(public)/layout.tsx`)

Aplicado às rotas `/`, `/login`, `/cadastro`, `/sobre`, `/contato`.

```
PublicHeader
  └── <main> (conteúdo da page.tsx)
PublicFooter
```

**PublicHeader** — sticky no topo, com:
- Logo + nome da aplicação
- Links de navegação (Home, Sobre, Contato) com destaque da rota ativa
- Botões "Entrar" e "Cadastrar" (ou "Painel" se já autenticado)
- Menu hamburguer responsivo para mobile

### Camada 2b — Layout Admin (`src/app/admin/layout.tsx`)

Aplicado a todas as rotas `/admin/*`.

```
AuthGuard (verifica autenticação)
  └── div.flex.h-screen
        ├── AdminSidebar
        └── div.flex-col
              ├── AdminHeader
              └── <main> (conteúdo da page.tsx)
```

**AdminSidebar** — barra lateral colapsável com:
- Links: Dashboard, Usuários, Convidar, Estoque
- Ícones da biblioteca `lucide-react`
- Botão para recolher/expandir a sidebar
- Destaque visual da rota ativa

**AdminHeader** — barra superior com:
- Avatar com iniciais geradas automaticamente do nome do usuário
- Nome do usuário
- Dropdown com opção de logout

### Camada 3 — Layout de Estoque (`src/app/admin/estoque/layout.tsx`)

Sub-layout aplicado apenas dentro de `/admin/estoque/*`. Renderiza uma navegação por abas horizontais:

```
[Visualização] [Baixas] [Cadastros] [Métricas] [Relatórios]
─────────────────────────────────────────────────────────────
conteúdo da page.tsx ativa
```

---

## Autenticação

A autenticação roda inteiramente no cliente (browser), usando **Context API + localStorage**.

### Fluxo de Login

1. Usuário preenche o formulário em `/login` (validado pelo Zod + React Hook Form)
2. O componente chama `login(email, password)` do `useAuth()`
3. O `AuthContext` delega ao `authService.login()`, que simula uma requisição com delay de 800ms
4. Se as credenciais estiverem corretas, o serviço retorna `{ user, token }`
5. O contexto salva ambos no `localStorage` e atualiza o estado React
6. O componente redireciona para `/admin`

**Credenciais de acesso para teste:**
```
E-mail:  admin@admin.com
Senha:   123456
```

### Proteção de Rotas — `AuthGuard`

O componente `AuthGuard` envolve todo o layout `/admin`. Ao renderizar, ele lê `isAuthenticated` do contexto:
- **Autenticado** → renderiza os filhos normalmente
- **Não autenticado** → chama `router.push("/login")` e retorna `null`

### Fluxo de Logout

1. Usuário clica em "Sair" no dropdown do `AdminHeader`
2. `logout()` remove o token e o usuário do `localStorage` e zera o estado
3. O componente redireciona para `/login`

### Persistência de Sessão

Ao carregar a aplicação, `AuthProvider` executa `loadStoredAuth()`, que lê o `localStorage` e restaura a sessão anterior — evitando que o usuário precise logar novamente ao reabrir o browser.

### Cliente HTTP — `src/lib/api.ts`

Instância Axios configurada com dois interceptors:

- **Request interceptor** — lê o token do `localStorage` e injeta o header `Authorization: Bearer <token>` em todas as requisições
- **Response interceptor** — se receber status `401`, limpa o `localStorage` e redireciona para `/login` automaticamente

---

## Serviços e Dados Mock

Como o projeto não possui back-end real, todos os serviços simulam requisições com `setTimeout` para reproduzir o comportamento de uma API REST.

### `authService` (`src/services/auth-service.ts`)

| Método | Delay | Comportamento |
|---|---|---|
| `login(email, password)` | 800ms | Aceita `admin@admin.com` / `123456`. Lança erro para outras credenciais |
| `register(name, email, password)` | 800ms | Sempre retorna sucesso com papel `viewer` |

### `estoqueService` (`src/services/estoque-service.ts`)

| Método | Delay | Descrição |
|---|---|---|
| `getProducts()` | 600ms | Retorna cópia dos produtos mock |
| `createProduct(data)` | 500ms | Cria produto e resolve o nome da categoria |
| `updateProduct(id, data)` | 500ms | Mescla dados no produto existente |
| `deleteProduct(id)` | 400ms | Simula exclusão (sem persistência) |
| `getCategories()` | 400ms | Retorna cópia das categorias mock |
| `createCategory(data)` | 400ms | Cria categoria com ID baseado em timestamp |
| `getExits()` | 600ms | Retorna cópia das baixas mock |
| `registerExit(data)` | 500ms | Registra saída resolvendo o nome do produto |
| `getKPIs()` | 500ms | Calcula KPIs em tempo real a partir dos mocks |

### `userService` (`src/services/user-service.ts`)

| Método | Delay | Descrição |
|---|---|---|
| `getAll()` | 600ms | Retorna todos os usuários |
| `update(id, data)` | 500ms | Atualiza campos do usuário |
| `invite(email, role)` | 700ms | Simula envio de convite |

### Dados Mock (`src/mocks/index.ts`)

| Constante | Conteúdo |
|---|---|
| `mockUsers` | 4 usuários (admin, manager, viewer) |
| `mockCategories` | 4 categorias (Eletrônicos, Escritório, Limpeza, Informática) |
| `mockProducts` | 7 produtos com SKU, quantidade, mínimo e preço |
| `mockExits` | 5 registros de baixa com motivo e responsável |
| `mockExitsByMonth` | Dados de Jan–Jun para o gráfico de barras |
| `mockProductsByCategory` | Distribuição por categoria para o gráfico de pizza |

---

## Validação de Formulários

Todos os formulários usam **React Hook Form** integrado ao **Zod** via `@hookform/resolvers/zod`.

### Esquemas (`src/schemas/index.ts`)

| Schema | Campos | Regras principais |
|---|---|---|
| `loginSchema` | email, password | email válido; senha mínimo 6 caracteres |
| `registerSchema` | name, email, password, confirmPassword | nome mínimo 2 chars; senhas devem coincidir (`.refine()`) |
| `contactSchema` | name, email, message | mensagem mínimo 10 caracteres |
| `productSchema` | name, sku, categoryId, quantity, minQuantity, price | `z.coerce.number()` converte strings de input para número |
| `categorySchema` | name, description | descrição mínimo 5 caracteres |
| `stockExitSchema` | productId, quantity, reason | quantidade mínima 1; motivo mínimo 5 chars |
| `inviteSchema` | email, role | role restrito a `"admin" \| "manager" \| "viewer"` via `z.enum()` |

Cada schema exporta também o tipo TypeScript inferido (`LoginFormData`, `ProductFormData`, etc.) via `z.infer<typeof schema>`.

---

## Componentes

### Layout Público

**`PublicHeader`**
- Sticky no topo (`position: sticky; top: 0; z-index: 40`)
- Detecta rota ativa com `usePathname()` para destacar o link correto
- Menu mobile colapsável com estado `open` local
- Verifica `isAuthenticated` para exibir "Painel" ou "Entrar/Cadastrar"

**`PublicFooter`**
- Rodapé simples com copyright

### Layout Administrativo

**`AdminSidebar`**
- Largura alternada: `w-60` (expandida) ou `w-16` (recolhida)
- Transição CSS suave com `transition-all`
- Ícones de `lucide-react`: `LayoutDashboard`, `Users`, `UserPlus`, `Package2`
- Destaque de rota ativa com fundo `bg-primary text-primary-foreground`
- Botão de colapso com ícone `ChevronDown` rotacionado

**`AdminHeader`**
- Avatar com iniciais geradas automaticamente do nome do usuário
- `DropdownMenu` (shadcn) com opção de logout
- Ao clicar em "Sair": chama `logout()` e redireciona para `/login`

**`AuthGuard`**
- Lê `isAuthenticated` e `isLoading` do `useAuth()`
- Durante loading: exibe spinner centralizado (`Loader2` animado)
- Se não autenticado: redireciona para `/login` e retorna `null`

### Componentes Compartilhados

**`EmptyState`** — estado vazio reutilizável com ícone, título e descrição

**`PageHeader`** — cabeçalho interno de página com título e slot para ações (botões)

### Componentes shadcn/ui

Todos ficam em `src/components/shadcn/` e são gerados/customizados via CLI do shadcn:

| Componente | Uso no projeto |
|---|---|
| `Button` | Ações primárias, formulários, navegação |
| `Card` | Cards de KPI, formulários, listagens |
| `Input` | Campos de formulário |
| `Label` | Rótulos acessíveis dos campos |
| `Select` | Seleção de categoria, papel do usuário |
| `Textarea` | Campo de mensagem no formulário de contato |
| `Table` | Listagem de produtos, usuários e baixas |
| `Dialog` | Modais de criação/edição |
| `DropdownMenu` | Menu de logout no header admin |
| `Badge` | Status de usuários e alertas de estoque |
| `Avatar` | Avatar do usuário no header admin |
| `Skeleton` | Loading placeholder nas listas |
| `Tabs` | Alternância de conteúdo em cadastros |
| `Sheet` | Painel lateral mobile |
| `Separator` | Divisórias visuais |
| `Chart` | Wrapper dos gráficos Recharts |
| `Sonner` | Container das notificações toast |
| `Field` | Agrupamento de label + input + erro |

---

## Hooks

### `useAuth` (`src/hooks/use-auth.ts`)

Atalho para `useContext(AuthContext)`. Lança erro se usado fora do `AuthProvider`. Expõe:

```typescript
{
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}
```

### `useDebounce` (`src/hooks/use-debounce.ts`)

Hook genérico que atrasa a atualização de um valor por `delay` ms (padrão: 300ms). Usado nos campos de busca para evitar requisições a cada tecla digitada.

```typescript
const debouncedSearch = useDebounce(searchTerm, 300)
```

---

## Tipos

Definidos em `src/types/index.ts`:

```typescript
// Usuário completo (listagens administrativas)
interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "viewer"
  status: "active" | "inactive"
  createdAt: string
}

// Usuário autenticado (guardado no contexto)
interface AuthUser {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "viewer"
}

interface Category {
  id: string
  name: string
  description: string
}

interface Product {
  id: string
  name: string
  sku: string          // Código único do produto
  categoryId: string
  categoryName: string
  quantity: number     // Quantidade atual
  minQuantity: number  // Threshold de alerta de estoque baixo
  price: number
  createdAt: string
}

interface StockExit {
  id: string
  productId: string
  productName: string
  quantity: number
  reason: string
  createdAt: string
  createdBy: string
}

// KPIs do dashboard
interface KPIData {
  totalProducts: number
  lowStockCount: number    // Produtos abaixo do minQuantity
  exitsThisMonth: number
  totalValue: number       // Soma de (quantity * price) de todos os produtos
}
```

---

## Como rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm start
```

A aplicação estará disponível em `http://localhost:3000`.

**Login de acesso:**
```
E-mail:  admin@admin.com
Senha:   123456
```
