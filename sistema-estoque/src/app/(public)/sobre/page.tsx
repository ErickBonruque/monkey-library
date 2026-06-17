import { Package2 } from "lucide-react"

export default function SobrePage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex justify-center mb-6">
          <Package2 className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-center">Sobre o Sistema</h1>
        <div className="mt-8 space-y-6 text-muted-foreground">
          <p>
            O <strong className="text-foreground">Sistema de Estoque</strong> é uma aplicação de gerenciamento
            de estoque desenvolvida como trabalho acadêmico, com o objetivo de demonstrar
            práticas modernas de desenvolvimento full-stack.
          </p>
          <p>
            A aplicação permite o cadastro e controle de produtos, registro de entradas e baixas,
            visualização de métricas através de gráficos interativos, gestão de usuários
            e convites para novos colaboradores. É composta por um <strong className="text-foreground">front-end</strong> em
            Next.js e uma <strong className="text-foreground">API REST</strong> própria que conversam por HTTP.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Tecnologias — Front-end</h2>
          <p className="text-sm">Camada de interface: o que o usuário vê e interage no navegador.</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-foreground">Next.js / React</strong> — Framework para construção das telas e rotas</li>
            <li><strong className="text-foreground">TypeScript</strong> — Tipagem estática para mais segurança no código</li>
            <li><strong className="text-foreground">Shadcn UI</strong> — Biblioteca de componentes de interface</li>
            <li><strong className="text-foreground">Tailwind CSS</strong> — Estilização utility-first</li>
            <li><strong className="text-foreground">React Query</strong> — Busca, cache e sincronização dos dados da API</li>
            <li><strong className="text-foreground">Axios</strong> — Cliente HTTP que consome a API</li>
            <li><strong className="text-foreground">React Hook Form</strong> — Gerenciamento de formulários</li>
            <li><strong className="text-foreground">Recharts</strong> — Gráficos interativos do dashboard</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">Tecnologias — Back-end</h2>
          <p className="text-sm">Camada de servidor: regras de negócio, autenticação e acesso ao banco de dados.</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-foreground">Node.js</strong> — Ambiente de execução do JavaScript no servidor</li>
            <li><strong className="text-foreground">Fastify</strong> — Framework web que organiza as rotas da API REST</li>
            <li><strong className="text-foreground">Prisma</strong> — ORM que faz a ponte entre o código e o banco de dados</li>
            <li><strong className="text-foreground">SQLite</strong> — Banco de dados relacional em arquivo único</li>
            <li><strong className="text-foreground">Zod</strong> — Validação dos dados recebidos nas requisições</li>
            <li><strong className="text-foreground">JWT</strong> — Autenticação por token nas rotas protegidas</li>
            <li><strong className="text-foreground">bcrypt</strong> — Criptografia (hash) das senhas dos usuários</li>
            <li><strong className="text-foreground">Swagger</strong> — Documentação interativa da API gerada automaticamente</li>
          </ul>
        </div>
      </div>
    </div>
  )
}