import { api } from "@/lib/api"
import type { Invite, Role, AuthUser } from "@/types"

interface CreateInviteResponse extends Invite {
  previewUrl: string | null
  acceptUrl: string
}

interface InviteInfo {
  email: string
  role: Role
  expiresAt: string
}

interface AcceptInviteResponse {
  user: AuthUser
  token: string
}

export const inviteService = {
  async getAll(): Promise<Invite[]> {
    const { data } = await api.get<Invite[]>("/invites")
    return data
  },

  async create(email: string, role: Role): Promise<CreateInviteResponse> {
    const { data } = await api.post<CreateInviteResponse>("/invites", { email, role })
    return data
  },

  async resend(id: string): Promise<{ previewUrl: string | null; acceptUrl: string }> {
    const { data } = await api.post(`/invites/${id}/resend`)
    return data
  },

  // Públicos (sem autenticação) — usados na página de aceite do convite.
  async validate(token: string): Promise<InviteInfo> {
    const { data } = await api.get<InviteInfo>(`/invites/token/${token}`)
    return data
  },

  async accept(token: string, name: string, password: string): Promise<AcceptInviteResponse> {
    const { data } = await api.post<AcceptInviteResponse>(`/invites/token/${token}/accept`, {
      name,
      password,
    })
    return data
  },
}
