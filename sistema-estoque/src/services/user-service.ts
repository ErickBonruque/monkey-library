import type { User } from "@/types"
import { mockUsers } from "@/mocks"

export const userService = {
  async getAll(): Promise<User[]> {
    await new Promise((res) => setTimeout(res, 600))
    return [...mockUsers]
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    await new Promise((res) => setTimeout(res, 500))
    const user = mockUsers.find((u) => u.id === id)
    if (!user) throw new Error("Usuário não encontrado")
    return { ...user, ...data }
  },

  async invite(email: string, role: User["role"]): Promise<void> {
    await new Promise((res) => setTimeout(res, 700))
    console.log("Convite enviado para", email, "com papel", role)
  },
}