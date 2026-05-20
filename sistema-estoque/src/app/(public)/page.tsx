import Link from "next/link"
import { Package2, BarChart3, Users, ShieldCheck } from "lucide-react"
import { Button } from "@/components/shadcn/button"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Package2 className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Sistema de Estoque
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Gerencie seu estoque de forma eficiente. Controle produtos, acompanhe baixas,
            visualize métricas e mantenha tudo organizado em um só lugar.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button size="lg" variant="outline">Criar conta</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Funcionalidades</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Package2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Controle de Produtos</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Cadastre produtos, categorias e acompanhe quantidades e estoque mínimo em tempo real.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <BarChart3 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Métricas e Relatórios</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Visualize gráficos de saídas, produtos por categoria e indicadores de desempenho.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Gestão de Usuários</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Convide colaboradores, gerencie papéis e mantenha o controle de quem acessa o sistema.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Seguro e Confiável</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Controle de acesso por autenticação, gestão de permissões por papel
            e registro completo de todas as movimentações de estoque.
          </p>
        </div>
      </section>
    </div>
  )
}