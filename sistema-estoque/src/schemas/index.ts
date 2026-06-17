import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  message: z.string().min(10, "Mensagem deve ter no mínimo 10 caracteres"),
})

export const productSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  sku: z.string().min(1, "SKU é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  quantity: z.coerce.number().min(0, "Quantidade não pode ser negativa"),
  minQuantity: z.coerce.number().min(1, "Quantidade mínima deve ser pelo menos 1"),
  price: z.coerce.number().min(0, "Preço não pode ser negativo"),
})

export const categorySchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  description: z.string().min(5, "Descrição é obrigatória"),
})

export const stockExitSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1"),
  reason: z.string().min(5, "Motivo é obrigatório"),
})

export const stockEntrySchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1"),
  reason: z.string().min(5, "Motivo é obrigatório"),
})

export const inviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["admin", "manager", "viewer"]),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type StockExitFormData = z.infer<typeof stockExitSchema>
export type StockEntryFormData = z.infer<typeof stockEntrySchema>
export type InviteFormData = z.infer<typeof inviteSchema>