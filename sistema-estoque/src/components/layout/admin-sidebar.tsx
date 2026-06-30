"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, Users, UserPlus, Package2, ShoppingCart, ChevronDown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import type { Role } from "@/types"

// `roles` define quais papéis enxergam cada item. Ausente = todos os papéis.
const navItems: {
  href: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  roles?: Role[]
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/admin/estoque", label: "Estoque", icon: Package2 },
  { href: "/admin/compras", label: "Compras", icon: ShoppingCart },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, roles: ["admin"] },
  { href: "/admin/convidar", label: "Convidar", icon: UserPlus, roles: ["admin"] },
]

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const { user } = useAuth()

  const visibleItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  )

  return (
    <aside
      className={`${sidebarOpen ? "w-60" : "w-16"} transition-all bg-background border-r flex flex-col shrink-0`}
    >
      <div className="h-16 flex items-center px-4 border-b gap-2">
        <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
          <Package2 className="h-6 w-6 shrink-0 text-primary" />
          {sidebarOpen && <span className="font-bold whitespace-nowrap">SistemaEstoque</span>}
        </Link>
      </div>

      <nav className="flex-1 py-4 px-2 flex flex-col gap-1">
        {visibleItems.map(({ href, label, icon: Icon, end }) => {
          const isActive = end ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`}
          />
          {sidebarOpen && <span>Recolher</span>}
        </button>
      </div>
    </aside>
  )
}
