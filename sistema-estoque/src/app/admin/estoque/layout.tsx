"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const subNav = [
  { href: "/admin/estoque", label: "Visualização", end: true },
  { href: "/admin/estoque/entradas", label: "Entradas" },
  { href: "/admin/estoque/baixas", label: "Baixas" },
  { href: "/admin/estoque/cadastros", label: "Cadastros" },
  { href: "/admin/estoque/metricas", label: "Métricas" },
  { href: "/admin/estoque/financeiro", label: "Financeiro" },
  { href: "/admin/estoque/relatorios", label: "Relatórios" },
]

export default function EstoqueLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <nav className="flex gap-1 border-b pb-0 overflow-x-auto">
        {subNav.map(({ href, label, end }) => {
          const isActive = end ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      {children}
    </div>
  )
}