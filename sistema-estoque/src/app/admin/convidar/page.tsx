"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select"
import { Field, FieldLabel, FieldError } from "@/components/shadcn/field"
import { PageHeader } from "@/components/shared/page-header"
import { inviteSchema, type InviteFormData } from "@/schemas"
import { userService } from "@/services/user-service"

export default function InviteUserPage() {
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
    await userService.invite(data.email, data.role)
    toast.success(`Convite enviado para ${data.email}!`)
    reset()
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Convidar Usuário" description="Envie um convite para um novo colaborador." />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novo convite</CardTitle>
          <CardDescription>O usuário receberá um e-mail com instruções de acesso.</CardDescription>
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
              {isSubmitting ? "Enviando..." : "Enviar convite"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}