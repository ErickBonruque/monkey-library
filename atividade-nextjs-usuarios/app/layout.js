import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata = {
  title: "Atividade Next.js - Usuários",
  description: "Atividade prática de Next.js com useState, useEffect e roteamento",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <Navbar />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
