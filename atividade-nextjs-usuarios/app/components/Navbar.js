import Link from "next/link";

// Navbar com links para navegação sem reload (usando o componente Link do Next)
export default function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/usuarios">Usuários</Link>
      <Link href="/sobre">Sobre</Link>
    </nav>
  );
}
