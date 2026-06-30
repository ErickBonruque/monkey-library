"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { isAxiosError } from "axios"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Mail, Send } from "lucide-react"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Badge } from "@/components/shadcn/badge"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select"
import { Field, FieldLabel, FieldError } from "@/components/shadcn/field"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { RoleGuard } from "@/components/auth/role-guard"
import { inviteSchema, type InviteFormData } from "@/schemas"
import { inviteService } from "@/services/invite-service"
import { roleLabels } from "@/lib/permissions"
import type { Invite } from "@/types"

const statusLabels: Record<Invite["status"], string> = {
  pending: "Pendente",
  accepted: "Aceito",
  revoked: "Revogado",
  expired: "Expirado",
}
const statusVariant: Record<Invite["status"], "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  accepted: "default",
  revoked: "outline",
  expired: "destructive",
}

// Quando em modo Ethereal (sem SMTP real), o back-end devolve a URL de
// pré-visualização do e-mail. Exibimos num toast para comprovar o envio.
function showInviteResult(previewUrl: string | null, acceptUrl: string) {
  if (previewUrl) {
    toast.success("Convite enviado!", {
      description: "Abra a pré-visualização do e-mail (Ethereal).",
      action: { label: "Ver e-mail", onClick: () => window.open(previewUrl, "_blank") },
      duration: 10000,
    })
  } else {
    toast.success("Convite enviado!", {
      description: "Link de cadastro gerado.",
      action: { label: "Abrir link", onClick: () => window.open(acceptUrl, "_blank") },
      duration: 10000,
    })
  }
}

function InviteContent() {
  const queryClient = useQueryClient()
  const { data: invites, isLoading } = useQuery({
    queryKey: ["invites"],
    queryFn: () => inviteService.getAll(),
  })

  const createInvite = useMutation({
    mutationFn: (data: InviteFormData) => inviteService.create(data.email, data.role),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["invites"] })
      showInviteResult(result.previewUrl, result.acceptUrl)
    },
    onError: (error) => {
      const message = isAxiosError(error) ? error.response?.data?.message : undefined
      toast.error(message ?? "Não foi possível enviar o convite.")
    },
  })

  const resendInvite = useMutation({
    mutationFn: (id: string) => inviteService.resend(id),
    onSuccess: (result) => showInviteResult(result.previewUrl, result.acceptUrl),
    onError: () => toast.error("Não foi possível reenviar o convite."),
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "viewer" },
  })

  async function onSubmit(data: InviteFormData) {
    await createInvite.mutateAsync(data)
    reset()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convidar Usuário"
        description="Envie um convite por e-mail. O usuário define a senha pelo link e já entra com o papel escolhido."
      />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Novo convite</CardTitle>
          <CardDescription>
            O sistema envia um e-mail com um link de cadastro válido por 3 dias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                  <Input {...field} id={field.name} type="email" placeholder="usuario@empresa.com" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Papel</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              <Mail className="h-4 w-4 mr-1" />
              {isSubmitting ? "Enviando..." : "Enviar convite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Convites enviados</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (invites ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={5}><EmptyState title="Nenhum convite enviado" /></TableCell></TableRow>
              ) : (
                (invites ?? []).map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell><Badge variant="outline">{roleLabels[invite.role]}</Badge></TableCell>
                    <TableCell><Badge variant={statusVariant[invite.status]}>{statusLabels[invite.status]}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(invite.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {invite.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Reenviar e-mail"
                          disabled={resendInvite.isPending}
                          onClick={() => resendInvite.mutate(invite.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
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

export default function InviteUserPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <InviteContent />
    </RoleGuard>
  )
}
