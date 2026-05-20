"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card"
import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Textarea } from "@/components/shadcn/textarea"
import { Field, FieldLabel, FieldError } from "@/components/shadcn/field"
import { contactSchema, type ContactFormData } from "@/schemas"

export default function ContatoPage() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  })

  function onSubmit(data: ContactFormData) {
    toast.success(`Mensagem enviada por ${data.name}!`)
    reset()
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-2">Contato</h1>
        <p className="text-center text-muted-foreground mb-8">
          Envie sua mensagem e entraremos em contato.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Formulário de contato</CardTitle>
            <CardDescription>Preencha os campos abaixo para nos enviar uma mensagem.</CardDescription>
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
                name="message"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Mensagem</FieldLabel>
                    <Textarea {...field} id={field.name} placeholder="Escreva sua mensagem..." rows={5} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Enviando..." : "Enviar mensagem"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}