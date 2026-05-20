"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, AlertTriangle } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Input } from "@/components/shadcn/input"
import { Badge } from "@/components/shadcn/badge"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table"
import { estoqueService } from "@/services/estoque-service"
import { useDebounce } from "@/hooks/use-debounce"

export default function VisualizacaoPage() {
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
      <PageHeader title="Visualização do Estoque" description="Visão geral de todos os produtos cadastrados." />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto, SKU ou categoria..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar produtos"
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
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="Nenhum produto encontrado" />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.minQuantity}</TableCell>
                  <TableCell>R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    {product.quantity <= product.minQuantity ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Baixo
                      </Badge>
                    ) : (
                      <Badge variant="default">OK</Badge>
                    )}
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