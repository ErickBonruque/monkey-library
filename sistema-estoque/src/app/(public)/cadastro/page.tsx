"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Field, FieldLabel, FieldError } from "@/components/shadcn/field"
import { useAuth } from "@/hooks/use-auth"
import { registerSchema, type RegisterFormData } from "@/schemas"

export default function CadastroPage() {
  const { register: registerUser, isAuthenticated } = useAuth()
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (isAuthenticated) router.push("/admin")
  }, [isAuthenticated, router])

  if (isAuthenticated) return null

  async function onSubmit(data: RegisterFormData) {
    try {
      await registerUser(data.name, data.email, data.password)
      toast.success("Conta criada com sucesso!")
      router.push("/admin")
    } catch {
      toast.error("Erro ao criar conta. Tente novamente.")
    }
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Criar conta</h1>
        <p className="text-center text-muted-foreground mb-8">
          Registre-se para começar a usar o sistema.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cadastro</CardTitle>
            <CardDescription>Preencha os dados abaixo para criar sua conta.</CardDescription>
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
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                    <Input {...field} id={field.name} type="email" placeholder="seu@email.com" aria-invalid={fieldState.invalid} />
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
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}