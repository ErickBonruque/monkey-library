import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/query-client"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/shadcn/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Sistema de Estoque",
  description: "Sistema de gerenciamento de estoque",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <Providers>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}