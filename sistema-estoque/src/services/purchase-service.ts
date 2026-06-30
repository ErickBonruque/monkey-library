import { api } from "@/lib/api"
import type { PurchaseOrder } from "@/types"
import type { PurchaseFormData as PurchaseInput } from "@/schemas"

export const purchaseService = {
  async getAll(): Promise<PurchaseOrder[]> {
    const { data } = await api.get<PurchaseOrder[]>("/purchases")
    return data
  },

  async create(input: PurchaseInput): Promise<PurchaseOrder> {
    const { data } = await api.post<PurchaseOrder>("/purchases", input)
    return data
  },

  async approve(id: string): Promise<PurchaseOrder> {
    const { data } = await api.post<PurchaseOrder>(`/purchases/${id}/approve`)
    return data
  },

  async receive(id: string): Promise<PurchaseOrder> {
    const { data } = await api.post<PurchaseOrder>(`/purchases/${id}/receive`)
    return data
  },

  async cancel(id: string): Promise<PurchaseOrder> {
    const { data } = await api.post<PurchaseOrder>(`/purchases/${id}/cancel`)
    return data
  },
}
