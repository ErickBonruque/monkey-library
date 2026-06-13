import { api } from "@/lib/api"
import type { AuthUser } from "@/types"

interface LoginResponse {
  user: AuthUser
  token: string
}

interface RegisterResponse {
  user: AuthUser
  token: string
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password })
    return data
  },

  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>("/auth/register", { name, email, password })
    return data
  },
}
