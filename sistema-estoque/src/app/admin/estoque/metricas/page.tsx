"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Package, AlertTriangle, TrendingDown, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Skeleton } from "@/components/shadcn/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { estoqueService } from "@/services/estoque-service"
import { mockExitsByMonth, mockProductsByCategory } from "@/mocks"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/shadcn/chart"

const exitsChartConfig = { baixas: { label: "Baixas", color: "var(--chart-1)" } } satisfies ChartConfig
const categoriesChartConfig = { quantidade: { label: "Produtos", color: "var(--chart-2)" } } satisfies ChartConfig

export default function MetricasPage() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["kpis"],
    queryFn: () => estoqueService.getKPIs(),
  })

  const kpiCards = [
    { label: "Total de Produtos", value: kpis?.totalProducts ?? 0, icon: Package, color: "text-blue-600" },
    { label: "Estoque Baixo", value: kpis?.lowStockCount ?? 0, icon: AlertTriangle, color: "text-amber-600" },
    { label: "Baixas no Mês", value: kpis?.exitsThisMonth ?? 0, icon: TrendingDown, color: "text-red-600" },
    {
      label: "Valor Total",
      value: kpis ? `R$ ${kpis.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—",
      icon: DollarSign,
      color: "text-green-600",
    },
  ]

  return (
    <div>
      <PageHeader
        title="Métricas"
        description={`Indicadores de desempenho — ${format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-7 w-24" /> : <p className="text-2xl font-bold">{value}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Baixas por Mês</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={exitsChartConfig} className="min-h-[220px] w-full">
              <LineChart data={mockExitsByMonth} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="baixas" stroke="var(--color-baixas)" strokeWidth={2} dot />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Produtos por Categoria</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={categoriesChartConfig} className="min-h-[220px] w-full">
              <BarChart data={mockProductsByCategory} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quantidade" fill="var(--color-quantidade)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}