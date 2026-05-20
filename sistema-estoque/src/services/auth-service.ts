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
    await new Promise((res) => setTimeout(res, 800))

    if (email === "admin@admin.com" && password === "123456") {
      return {
        user: { id: "1", name: "Admin User", email, role: "admin" },
        token: "mock-jwt-token-admin-xyz",
      }
    }
    throw new Error("Credenciais inválidas")
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    await new Promise((res) => setTimeout(res, 800))
    return {
      user: { id: "2", name, email, role: "viewer" },
      token: "mock-jwt-token-new-user-xyz",
    }
  },
}