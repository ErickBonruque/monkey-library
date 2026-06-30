"use client"

import { use, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { isAxiosError } from "axios"
import { Loader2, ShieldX } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Badge } from "@/components/shadcn/badge"
import { Field, FieldLabel, FieldError } from "@/components/shadcn/field"
import { useAuth } from "@/hooks/use-auth"
import { acceptInviteSchema, type AcceptInviteFormData } from "@/schemas"
import { inviteService } from "@/services/invite-service"
import { roleLabels } from "@/lib/permissions"

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { setSession, isAuthenticated } = useAuth()
  const router = useRouter()

  const { data: invite, isLoading, error } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => inviteService.validate(token),
    retry: false,
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { name: "", password: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (isAuthenticated) router.push("/admin")
  }, [isAuthenticated, router])

  async function onSubmit(data: AcceptInviteFormData) {
    try {
      const { user, token: jwt } = await inviteService.accept(token, data.name, data.password)
      setSession(user, jwt)
      toast.success("Cadastro concluído! Bem-vindo(a).")
      router.push("/admin")
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      toast.error(message ?? "Não foi possível concluir o cadastro.")
    }
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Aceitar convite</h1>
        <p className="text-center text-muted-foreground mb-8">
          Conclua seu cadastro para acessar o Sistema de Estoque.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error || !invite ? (
          <Card>
            <CardContent className="flex flex-col items-center text-center py-10">
              <ShieldX className="h-10 w-10 text-destructive mb-3" />
              <h2 className="font-semibold">Convite inválido ou expirado</h2>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                Este link de convite não é mais válido. Peça a um administrador para enviar um novo.
              </p>
              <Link href="/login" className="text-primary hover:underline text-sm mt-4">
                Ir para o login
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados de acesso</CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <span>{invite.email}</span>
                <Badge variant="secondary">{roleLabels[invite.role]}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                      <Input {...field} id={field.name} placeholder="Seu nome" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                      <Input {...field} id={field.name} type="password" placeholder="Mínimo 6 caracteres" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Confirmar senha</FieldLabel>
                      <Input {...field} id={field.name} type="password" placeholder="Repita a senha" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Concluindo..." : "Concluir cadastro"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
