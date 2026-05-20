import { PackageOpen } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({
  title = "Nenhum item encontrado",
  description = "Tente ajustar os filtros ou adicione um novo item.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
      <PackageOpen className="h-12 w-12 opacity-40" />
      <p className="font-medium">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  )
}