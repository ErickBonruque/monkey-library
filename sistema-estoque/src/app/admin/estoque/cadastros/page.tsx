"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Field, FieldLabel, FieldError } from "@/components/shadcn/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Badge } from "@/components/shadcn/badge"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { productSchema, categorySchema, type ProductFormData, type CategoryFormData } from "@/schemas"
import { estoqueService } from "@/services/estoque-service"

function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => estoqueService.getCategories() })
  const queryClient = useQueryClient()
  const { mutateAsync } = useMutation({
    mutationFn: (data: ProductFormData) => estoqueService.createProduct(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  })

  const { control, handleSubmit, formState: { isSubmitting } } =
    useForm<ProductFormData>({ resolver: zodResolver(productSchema) as never, defaultValues: { name: "", sku: "", categoryId: "", quantity: 0, minQuantity: 1, price: 0 } })

  const onError = () => {}

  async function onSubmit(data: ProductFormData) {
    await mutateAsync(data)
    toast.success("Produto cadastrado!")
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Controller name="name" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />

        <Controller name="sku" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>SKU</FieldLabel>
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )} />
      </div>

      <Controller name="categoryId" control={control} render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>Categoria</FieldLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger aria-invalid={fieldState.invalid}><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {(categories ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )} />

      <div className="grid grid-cols-3 gap-3">
        <Controller name="quantity" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Quantidade</FieldLabel>
            <Input {...field} id={field.name} type="number" onChange={(e) => field.onChange(Number(e.target.value))} aria-invalid={fieldState.invalid} />
          </Field>
        )} />
        <Controller name="minQuantity" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Qtd. Mín.</FieldLabel>
            <Input {...field} id={field.name} type="number" onChange={(e) => field.onChange(Number(e.target.value))} aria-invalid={fieldState.invalid} />
          </Field>
        )} />
        <Controller name="price" control={control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Preço (R$)</FieldLabel>
            <Input {...field} id={field.name} type="number" step="0.01" onChange={(e) => field.onChange(Number(e.target.value))} aria-invalid={fieldState.invalid} />
          </Field>
        )} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Salvar produto"}
      </Button>
    </form>
  )
}

function CategoryForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const { mutateAsync } = useMutation({
    mutationFn: (data: CategoryFormData) => estoqueService.createCategory(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  })
  const { control, handleSubmit, formState: { isSubmitting } } =
    useForm<CategoryFormData>({ resolver: zodResolver(categorySchema), defaultValues: { name: "", description: "" } })

  async function onSubmit(data: CategoryFormData) {
    await mutateAsync(data)
    toast.success("Categoria cadastrada!")
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      <Controller name="name" control={control} render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
          <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )} />

      <Controller name="description" control={control} render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
          <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )} />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Salvar categoria"}
      </Button>
    </form>
  )
}

export default function CadastrosPage() {
  const [productOpen, setProductOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  const { data: products, isLoading: loadingProducts } = useQuery({ queryKey: ["products"], queryFn: () => estoqueService.getProducts() })
  const { data: categories, isLoading: loadingCategories } = useQuery({ queryKey: ["categories"], queryFn: () => estoqueService.getCategories() })
  const queryClient = useQueryClient()

  const deleteProduct = useMutation({
    mutationFn: (id: string) => estoqueService.deleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); toast.success("Produto removido!") },
  })

  return (
    <div>
      <PageHeader title="Cadastros" description="Gerencie produtos e categorias." />
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-end mb-3">
            <Dialog open={productOpen} onOpenChange={setProductOpen}>
              <DialogTrigger><Button size="sm"><Plus className="h-4 w-4 mr-1" />Novo produto</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo Produto</DialogTitle></DialogHeader>
                <ProductForm onSuccess={() => setProductOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Qtd.</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingProducts ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                  ))
                ) : (products ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={6}><EmptyState title="Nenhum produto cadastrado" /></TableCell></TableRow>
                ) : (
                  (products ?? []).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{p.categoryName}</TableCell>
                      <TableCell>
                        <Badge variant={p.quantity <= p.minQuantity ? "destructive" : "default"}>{p.quantity}</Badge>
                      </TableCell>
                      <TableCell>R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteProduct.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="flex justify-end mb-3">
            <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
              <DialogTrigger><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova categoria</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
                <CategoryForm onSuccess={() => setCategoryOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCategories ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 2 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                  ))
                ) : (categories ?? []).length === 0 ? (
                  <TableRow><TableCell colSpan={2}><EmptyState title="Nenhuma categoria cadastrada" /></TableCell></TableRow>
                ) : (
                  (categories ?? []).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.description}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}