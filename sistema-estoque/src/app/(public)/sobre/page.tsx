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
            práticas modernas de desenvolvimento front-end.
          </p>
          <p>
            A aplicação permite o cadastro e controle de produtos, registro de baixas,
            visualização de métricas através de gráficos interativos, gestão de usuários
            e convites para novos colaboradores.
          </p>
          <h2 className="text-xl font-semibold text-foreground">Tecnologias Utilizadas</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-foreground">Next.js</strong> — Framework React com App Router</li>
            <li><strong className="text-foreground">TypeScript</strong> — Tipagem estática</li>
            <li><strong className="text-foreground">Shadcn UI</strong> — Componentes de interface</li>
            <li><strong className="text-foreground">React Hook Form</strong> — Gerenciamento de formulários</li>
            <li><strong className="text-foreground">Zod</strong> — Validação de schemas</li>
            <li><strong className="text-foreground">React Query</strong> — Gerenciamento de estado servidor</li>
            <li><strong className="text-foreground">Recharts</strong> — Gráficos interativos</li>
            <li><strong className="text-foreground">Tailwind CSS</strong> — Estilização utility-first</li>
          </ul>
        </div>
      </div>
    </div>
  )
}