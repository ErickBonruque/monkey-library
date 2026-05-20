"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Package2, Menu, X } from "lucide-react"
import { Button } from "@/components/shadcn/button"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
]

export function PublicHeader() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Package2 className="h-6 w-6 text-primary" />
          SistemaEstoque
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <Link href="/admin">
              <Button size="sm">Painel</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link href="/cadastro">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3 bg-background">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "text-sm font-medium",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 border-t">
            {isAuthenticated ? (
              <Link href="/admin" onClick={() => setOpen(false)} className={cn("flex-1")}>
                <Button size="sm" className="w-full">Painel</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Entrar</Button>
                </Link>
                <Link href="/cadastro" onClick={() => setOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full">Cadastrar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}