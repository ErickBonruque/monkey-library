"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { isAxiosError } from "axios"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Plus, Trash2, Check, PackageCheck, X, Eye } from "lucide-react"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Badge } from "@/components/shadcn/badge"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Textarea } from "@/components/shadcn/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select"
import { Field, FieldLabel, FieldError } from "@/components/shadcn/field"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/dialog"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { purchaseSchema, type PurchaseFormData } from "@/schemas"
import { purchaseService } from "@/services/purchase-service"
import { estoqueService } from "@/services/estoque-service"
import { useAuth } from "@/hooks/use-auth"
import { canManageStock, canApprovePurchase } from "@/lib/permissions"
import type { PurchaseOrder } from "@/types"

const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`

const statusLabels: Record<PurchaseOrder["status"], string> = {
  pending: "Pendente",
  approved: "Aprovada",
  received: "Recebida",
  cancelled: "Cancelada",
}
const statusVariant: Record<PurchaseOrder["status"], "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  received: "outline",
  cancelled: "destructive",
}

function NewPurchaseForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => estoqueService.getProducts() })

  const { mutateAsync } = useMutation({
    mutationFn: (data: PurchaseFormData) => purchaseService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] }),
  })

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema) as never,
    defaultValues: { supplier: "", notes: "", items: [{ productId: "", quantity: 1, unitCost: 0 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const items = watch("items")
  const total = (items ?? []).reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitCost) || 0), 0)

  async function onSubmit(data: PurchaseFormData) {
    await mutateAsync(data)
    toast.success("Solicitação de compra criada!")
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Controller
        name="supplier"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Fornecedor</FieldLabel>
            <Input {...field} id={field.name} placeholder="Ex: Dell Computadores" aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="space-y-3">
        <FieldLabel>Itens</FieldLabel>
        {fields.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[1fr_80px_110px_auto] gap-2 items-start">
            <Controller
              name={`items.${index}.productId`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}><SelectValue placeholder="Produto" /></SelectTrigger>
                    <SelectContent>
                      {(products ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name={`items.${index}.quantity`}
              control={control}
              render={({ field }) => (
                <Input {...field} type="number" min={1} placeholder="Qtd" aria-label="Quantidade" />
              )}
            />
            <Controller
              name={`items.${index}.unitCost`}
              control={control}
              render={({ field }) => (
                <Input {...field} type="number" min={0} step="0.01" placeholder="Custo un." aria-label="Custo unitário" />
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1, unitCost: 0 })}>
          <Plus className="h-4 w-4 mr-1" />Adicionar item
        </Button>
      </div>

      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Observações</FieldLabel>
            <Textarea {...field} id={field.name} placeholder="Observações da compra (opcional)" />
          </Field>
        )}
      />

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-sm text-muted-foreground">Total estimado</span>
        <span className="font-semibold">{brl(total)}</span>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Criar solicitação"}
      </Button>
    </form>
  )
}

function PurchaseDetails({ order }: { order: PurchaseOrder }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-muted-foreground">Fornecedor:</span> {order.supplier}</div>
        <div><span className="text-muted-foreground">Status:</span> {statusLabels[order.status]}</div>
        <div><span className="text-muted-foreground">Criado por:</span> {order.createdBy}</div>
        <div><span className="text-muted-foreground">Aprovado por:</span> {order.approvedBy ?? "—"}</div>
      </div>
      {order.notes && <p className="text-sm text-muted-foreground">{order.notes}</p>}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Custo un.</TableHead>
              <TableHead>Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.productName}</TableCell>
                <TableCell>{i.quantity}</TableCell>
                <TableCell>{brl(i.unitCost)}</TableCell>
                <TableCell>{brl(i.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end font-semibold">Total: {brl(order.total)}</div>
    </div>
  )
}

export default function ComprasPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canManage = canManageStock(user?.role)
  const canApprove = canApprovePurchase(user?.role)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailsOrder, setDetailsOrder] = useState<PurchaseOrder | null>(null)

  const { data: orders, isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => purchaseService.getAll(),
  })

  const action = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "approve" | "receive" | "cancel" }) =>
      purchaseService[type](id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      if (variables.type === "receive") {
        queryClient.invalidateQueries({ queryKey: ["entries"] })
        queryClient.invalidateQueries({ queryKey: ["kpis"] })
      }
      const labels = { approve: "aprovada", receive: "recebida", cancel: "cancelada" }
      toast.success(`Compra ${labels[variables.type]}!`)
    },
    onError: (error) => {
      const message = isAxiosError(error) ? error.response?.data?.message : undefined
      toast.error(message ?? "Não foi possível concluir a ação.")
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Compras" description="Solicite, aprove e receba reposições de estoque." />
        {canManage && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button size="sm" />}><Plus className="h-4 w-4 mr-1" />Nova compra</DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Nova solicitação de compra</DialogTitle></DialogHeader>
              <NewPurchaseForm onSuccess={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado por</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (orders ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="Nenhuma compra registrada" /></TableCell></TableRow>
            ) : (
              (orders ?? []).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.supplier}</TableCell>
                  <TableCell>{order.itemsCount}</TableCell>
                  <TableCell>{brl(order.total)}</TableCell>
                  <TableCell><Badge variant={statusVariant[order.status]}>{statusLabels[order.status]}</Badge></TableCell>
                  <TableCell>{order.createdBy}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(order.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Ver itens" onClick={() => setDetailsOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === "pending" && canApprove && (
                        <Button variant="ghost" size="icon" title="Aprovar" disabled={action.isPending}
                          onClick={() => action.mutate({ id: order.id, type: "approve" })}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {order.status === "approved" && canManage && (
                        <Button variant="ghost" size="icon" title="Receber" disabled={action.isPending}
                          onClick={() => action.mutate({ id: order.id, type: "receive" })}>
                          <PackageCheck className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {(order.status === "pending" || order.status === "approved") && canManage && (
                        <Button variant="ghost" size="icon" title="Cancelar" disabled={action.isPending}
                          onClick={() => action.mutate({ id: order.id, type: "cancel" })}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detailsOrder} onOpenChange={(open) => !open && setDetailsOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Detalhes da compra</DialogTitle></DialogHeader>
          {detailsOrder && <PurchaseDetails order={detailsOrder} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
