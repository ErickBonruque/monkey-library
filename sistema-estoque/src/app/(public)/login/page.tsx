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
import { loginSchema, type LoginFormData } from "@/schemas"

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  useEffect(() => {
    if (isAuthenticated) router.push("/admin")
  }, [isAuthenticated, router])

  if (isAuthenticated) return null

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data.email, data.password)
      toast.success("Login realizado com sucesso!")
      router.push("/admin")
    } catch {
      toast.error("Credenciais inválidas. Use admin@admin.com / 123456")
    }
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Entrar</h1>
        <p className="text-center text-muted-foreground mb-8">
          Acesse sua conta para gerenciar o estoque.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Login</CardTitle>
            <CardDescription>Insira suas credenciais para acessar o sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                    <Input {...field} id={field.name} type="email" placeholder="admin@admin.com" aria-invalid={fieldState.invalid} />
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
                    <Input {...field} id={field.name} type="password" placeholder="******" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/cadastro" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}