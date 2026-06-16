"use client"

import { createContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { AuthUser } from "@/types"
import { authService } from "@/services/auth-service"

interface AuthContextData {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

const STORAGE_KEY_TOKEN = "@SistemaEstoque:token"
const STORAGE_KEY_USER = "@SistemaEstoque:user"

function loadStoredAuth(): { user: AuthUser | null; token: string | null } {
  if (typeof window === "undefined") return { user: null, token: null }
  try {
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN)
    const storedUser = localStorage.getItem(STORAGE_KEY_USER)
    if (storedToken && storedUser) {
      return { token: storedToken, user: JSON.parse(storedUser) as AuthUser }
    }
  } catch {
    // localStorage not available during SSR or parsing error
  }
  return { user: null, token: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<{ user: AuthUser | null; token: string | null }>({
    user: null,
    token: null,
  })
  // Starts true so the first client render matches the server (no user) and
  // consumers can wait for hydration before deciding on auth-gated UI.
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setAuth(loadStoredAuth())
    setIsLoading(false)
  }, [])

  const isAuthenticated = !!auth.user

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedUser, token: newToken } = await authService.login(email, password)
    localStorage.setItem(STORAGE_KEY_TOKEN, newToken)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(loggedUser))
    setAuth({ user: loggedUser, token: newToken })
  }, [])

  const registerUser = useCallback(async (name: string, email: string, password: string) => {
    const { user: newUser, token: newToken } = await authService.register(name, email, password)
    localStorage.setItem(STORAGE_KEY_TOKEN, newToken)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser))
    setAuth({ user: newUser, token: newToken })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_USER)
    setAuth({ user: null, token: null })
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...auth, isAuthenticated, isLoading, login, register: registerUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}