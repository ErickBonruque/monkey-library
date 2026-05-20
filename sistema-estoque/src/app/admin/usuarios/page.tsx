"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Input } from "@/components/shadcn/input"
import { Badge } from "@/components/shadcn/badge"
import { Skeleton } from "@/components/shadcn/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table"
import { EmptyState } from "@/components/shared/empty-state"
import { userService } from "@/services/user-service"
import { useDebounce } from "@/hooks/use-debounce"

const roleLabels: Record<string, string> = { admin: "Admin", manager: "Gerente", viewer: "Visualizador" }
const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  manager: "secondary",
  viewer: "outline",
}

export default function UsuariosPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  })

  const filtered = (users ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  return (
    <div>
      <PageHeader title="Gerenciamento de Usuários" description="Visualize e gerencie os usuários do sistema." />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar usuários"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState title="Nenhum usuário encontrado" />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[user.role]}>{roleLabels[user.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.createdAt}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}