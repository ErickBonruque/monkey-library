import { api } from "@/lib/api"
import type { User } from "@/types"

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get<User[]>("/users")
    return data
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const { data: user } = await api.put<User>(`/users/${id}`, data)
    return user
  },

  async invite(email: string, role: User["role"]): Promise<void> {
    await api.post("/users/invite", { email, role })
  },
}
