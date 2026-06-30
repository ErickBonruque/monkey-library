"use client"

import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar"
import { Badge } from "@/components/shadcn/badge"
import { roleLabels } from "@/lib/permissions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu"
import { LogOut, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const initials = user?.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?"

  function handleLogout() {
    logout()
    router.push("/login")
  }

  return (
    <header className="h-16 bg-background border-b flex items-center justify-end px-6 gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
          {user && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {roleLabels[user.role]}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}