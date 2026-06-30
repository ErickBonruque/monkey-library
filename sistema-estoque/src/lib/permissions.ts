import type { Role } from "@/types"

// Regras de autorização do front-end. Espelham o controle de acesso por papéis
// aplicado no back-end (a proteção real é feita na API; aqui apenas adaptamos a
// interface, ocultando ações que o usuário não pode executar).
//
// - admin:   gestão completa do sistema e dos usuários
// - manager: controle de estoque, compras e relatórios
// - viewer:  acesso apenas para consulta

export const isAdmin = (role?: Role) => role === "admin"

// Pode executar operações de escrita no estoque (entradas, baixas, cadastros,
// criar/receber compras).
export const canManageStock = (role?: Role) => role === "admin" || role === "manager"

// A aprovação de compras é um passo de governança restrito a administradores.
export const canApprovePurchase = (role?: Role) => role === "admin"

// Gestão de usuários e convites é exclusiva de administradores.
export const canManageUsers = (role?: Role) => role === "admin"

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  manager: "Gerente",
  viewer: "Visualizador",
}
