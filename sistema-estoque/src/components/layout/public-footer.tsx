export function PublicFooter() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        © {new Date().getFullYear()} SistemaEstoque — Trabalho de Faculdade
      </div>
    </footer>
  )
}