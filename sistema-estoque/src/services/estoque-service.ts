import { api } from "@/lib/api"
import type { Product, Category, StockExit, KPIData } from "@/types"

export const estoqueService = {
  async getProducts(): Promise<Product[]> {
    const { data } = await api.get<Product[]>("/products")
    return data
  },

  async createProduct(data: Omit<Product, "id" | "createdAt" | "categoryName">): Promise<Product> {
    const { data: product } = await api.post<Product>("/products", data)
    return product
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const { data: product } = await api.put<Product>(`/products/${id}`, data)
    return product
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>("/categories")
    return data
  },

  async createCategory(data: Omit<Category, "id">): Promise<Category> {
    const { data: category } = await api.post<Category>("/categories", data)
    return category
  },

  async getExits(): Promise<StockExit[]> {
    const { data } = await api.get<StockExit[]>("/exits")
    return data
  },

  async registerExit(
    data: Omit<StockExit, "id" | "createdAt" | "productName" | "createdBy">
  ): Promise<StockExit> {
    const { data: exit } = await api.post<StockExit>("/exits", data)
    return exit
  },

  async getKPIs(): Promise<KPIData> {
    const { data } = await api.get<KPIData>("/kpis")
    return data
  },
}
