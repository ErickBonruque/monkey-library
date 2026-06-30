"use client"

import { ShieldAlert } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { Role } from "@/types"

// Restringe o conteúdo a determinados papéis. A proteção efetiva é feita na API;
// este guard apenas evita exibir telas que o usuário não tem permissão de usar.
export function RoleGuard({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { user } = useAuth()

  if (user && !allow.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Acesso restrito</h2>
        <p className="text-muted-foreground max-w-sm mt-1">
          Você não tem permissão para acessar esta página. Fale com um administrador caso precise
          deste acesso.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
