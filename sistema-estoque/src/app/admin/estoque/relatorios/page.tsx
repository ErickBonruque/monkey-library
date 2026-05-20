"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Input } from "@/components/shadcn/input"
import { Badge } from "@/components/shadcn/badge"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table"
import { estoqueService } from "@/services/estoque-service"
import { useDebounce } from "@/hooks/use-debounce"

export default function RelatoriosPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => estoqueService.getProducts(),
  })

  const filtered = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  return (
    <div>
      <PageHeader title="Relatórios" description="Relatório de inventário com filtros de busca." />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto, SKU ou categoria..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar no relatório"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Qtd. Mín.</TableHead>
              <TableHead>Preço Unit.</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <EmptyState title="Nenhum produto encontrado" />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.categoryName}</TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell>{p.minQuantity}</TableCell>
                  <TableCell>R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>R$ {(p.quantity * p.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    {p.quantity <= p.minQuantity ? (
                      <Badge variant="destructive">Baixo</Badge>
                    ) : (
                      <Badge variant="default">OK</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(p.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}