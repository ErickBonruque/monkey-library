"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select"
import { Field, FieldLabel, FieldError } from "@/components/shadcn/field"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table"
import { Skeleton } from "@/components/shadcn/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { stockExitSchema, type StockExitFormData } from "@/schemas"
import { estoqueService } from "@/services/estoque-service"
import { useAuth } from "@/hooks/use-auth"
import { canManageStock } from "@/lib/permissions"

export default function BaixasPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canManage = canManageStock(user?.role)
  const [selectedProduct, setSelectedProduct] = useState("")

  const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => estoqueService.getProducts() })
  const { data: exits, isLoading } = useQuery({ queryKey: ["exits"], queryFn: () => estoqueService.getExits() })

  const { mutateAsync } = useMutation({
    mutationFn: (data: StockExitFormData) => estoqueService.registerExit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exits"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<StockExitFormData>({
    resolver: zodResolver(stockExitSchema) as never,
    defaultValues: { productId: "", quantity: 1, reason: "" },
  })

  async function onSubmit(data: StockExitFormData) {
    await mutateAsync(data)
    toast.success("Baixa registrada com sucesso!")
    reset()
    setSelectedProduct("")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Baixas de Estoque" description="Registre saídas de produtos." />

      {canManage && (
      <Card className="max-w-xl">
        <CardHeader><CardTitle className="text-base">Nova baixa</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Controller
              name="productId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Produto</FieldLabel>
                  <Select value={selectedProduct} onValueChange={(v) => { if (v) { setSelectedProduct(v); field.onChange(v) } }}>
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {(products ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} (est: {p.quantity})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="quantity"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Quantidade</FieldLabel>
                  <Input {...field} id={field.name} type="number" min={1} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="reason"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Motivo</FieldLabel>
                  <Input {...field} id={field.name} placeholder="Ex: Entrega ao departamento X" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar baixa"}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Histórico de Baixas</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Custo (CMV)</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (exits ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={6}><p className="text-center py-8 text-muted-foreground">Nenhuma baixa registrada.</p></TableCell></TableRow>
              ) : (
                (exits ?? []).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.productName}</TableCell>
                    <TableCell>{e.quantity}</TableCell>
                    <TableCell>R$ {e.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{e.reason}</TableCell>
                    <TableCell>{e.createdBy}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(e.createdAt), "dd/MM/yyyy", { locale: ptBR })}
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