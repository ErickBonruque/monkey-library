"use client"

import { useQuery } from "@tanstack/react-query"
import { DollarSign, TrendingUp, Wallet, Receipt, AlertTriangle, PackagePlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/shadcn/card"
import { Badge } from "@/components/shadcn/badge"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { estoqueService } from "@/services/estoque-service"

const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`

export default function FinanceiroPage() {
  const { data: kpis } = useQuery({ queryKey: ["kpis"], queryFn: () => estoqueService.getKPIs() })
  const { data: financial, isLoading } = useQuery({ queryKey: ["financial"], queryFn: () => estoqueService.getFinancial() })
  const { data: alerts } = useQuery({ queryKey: ["alerts"], queryFn: () => estoqueService.getAlerts() })

  const cards = [
    { label: "Custo do Estoque", value: financial ? brl(financial.totalStockCost) : "—", icon: Wallet, color: "text-amber-600", hint: "Soma dos lotes ao custo de compra" },
    { label: "Valor de Venda", value: financial ? brl(financial.totalStockPrice) : "—", icon: DollarSign, color: "text-green-600", hint: "Estoque avaliado ao preço de venda" },
    { label: "Lucro Potencial", value: financial ? brl(financial.potentialProfit) : "—", icon: TrendingUp, color: "text-blue-600", hint: "Venda menos custo do estoque atual" },
    { label: "CMV no Mês", value: kpis ? brl(kpis.cogsThisMonth) : "—", icon: Receipt, color: "text-red-600", hint: "Custo das baixas no mês corrente" },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Inteligência Financeira" description="Custos por lote, margem dos produtos e alertas de reposição." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, hint }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-7 w-28" /> : <p className="text-2xl font-bold">{value}</p>}
              <p className="text-xs text-muted-foreground mt-1">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Margem e valor por produto</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Custo médio</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Valor em estoque</TableHead>
                <TableHead>Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (financial?.products ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState title="Sem dados financeiros" /></TableCell></TableRow>
              ) : (
                (financial?.products ?? []).map((p) => (
                  <TableRow key={p.productId}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell>{brl(p.avgUnitCost)}</TableCell>
                    <TableCell>{brl(p.unitPrice)}</TableCell>
                    <TableCell>{brl(p.saleValue)}</TableCell>
                    <TableCell>
                      <Badge variant={p.margin >= 0 ? "default" : "destructive"}>
                        {p.marginPercent.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold">Alertas de reposição</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Produtos no nível mínimo (ou abaixo). A sugestão considera o consumo médio dos últimos 3 meses.
        </p>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Consumo/mês</TableHead>
                <TableHead>Sugestão de compra</TableHead>
                <TableHead>Severidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(alerts ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <p className="text-center py-8 text-muted-foreground">Nenhum produto em estoque crítico. 🎉</p>
                  </TableCell>
                </TableRow>
              ) : (
                (alerts ?? []).map((a) => (
                  <TableRow key={a.productId}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.quantity}</TableCell>
                    <TableCell>{a.minQuantity}</TableCell>
                    <TableCell>{a.avgMonthlyConsumption}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-medium">
                        <PackagePlus className="h-4 w-4 text-blue-600" />
                        {a.suggestedQuantity} un.
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.severity === "critical" ? "destructive" : "secondary"}>
                        {a.severity === "critical" ? "Crítico" : "Baixo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
