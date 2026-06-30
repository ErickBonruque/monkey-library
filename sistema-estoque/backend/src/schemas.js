import { z } from "zod"

// Validações de entrada da API usando Zod

// Parâmetro de rota :id (usado em PUT/DELETE).
export const idParamSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
})

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export const productCreateSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  sku: z.string().min(1, "SKU é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  quantity: z.coerce.number().int().min(0, "Quantidade não pode ser negativa"),
  minQuantity: z.coerce.number().int().min(1, "Quantidade mínima deve ser pelo menos 1"),
  price: z.coerce.number().min(0, "Preço não pode ser negativo"),
})

// Em atualizações todos os campos são opcionais.
export const productUpdateSchema = productCreateSchema.partial()

export const categoryCreateSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  description: z.string().min(5, "Descrição é obrigatória"),
})

export const exitCreateSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.coerce.number().int().min(1, "Quantidade deve ser pelo menos 1"),
  reason: z.string().min(5, "Motivo é obrigatório"),
})

export const entryCreateSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.coerce.number().int().min(1, "Quantidade deve ser pelo menos 1"),
  unitCost: z.coerce.number().min(0, "Custo não pode ser negativo"),
  reason: z.string().min(5, "Motivo é obrigatório"),
})

export const userUpdateSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(["admin", "manager", "viewer"]).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })

export const inviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["admin", "manager", "viewer"]),
})

// Parâmetro de rota :token (convites).
export const tokenParamSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
})

// Aceite de convite: o usuário define nome e senha; e-mail e papel vêm do convite.
export const acceptInviteSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

// Criação de uma solicitação de compra com seus itens.
export const purchaseCreateSchema = z.object({
  supplier: z.string().min(2, "Fornecedor é obrigatório"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Produto é obrigatório"),
        quantity: z.coerce.number().int().min(1, "Quantidade deve ser pelo menos 1"),
        unitCost: z.coerce.number().min(0, "Custo não pode ser negativo"),
      })
    )
    .min(1, "Inclua ao menos um item"),
})
