import { api } from "@/lib/api"
import type {
  Product,
  Category,
  StockExit,
  StockEntry,
  KPIData,
  ChartsData,
  FinancialData,
  ReorderAlert,
} from "@/types"

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

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },

  async getExits(): Promise<StockExit[]> {
    const { data } = await api.get<StockExit[]>("/exits")
    return data
  },

  // O custo (totalCost) é apurado no servidor a partir dos lotes (FIFO).
  async registerExit(data: {
    productId: string
    quantity: number
    reason: string
  }): Promise<StockExit> {
    const { data: exit } = await api.post<StockExit>("/exits", data)
    return exit
  },

  async getEntries(): Promise<StockEntry[]> {
    const { data } = await api.get<StockEntry[]>("/entries")
    return data
  },

  async registerEntry(data: {
    productId: string
    quantity: number
    unitCost: number
    reason: string
  }): Promise<StockEntry> {
    const { data: entry } = await api.post<StockEntry>("/entries", data)
    return entry
  },

  async getKPIs(): Promise<KPIData> {
    const { data } = await api.get<KPIData>("/kpis")
    return data
  },

  async getCharts(): Promise<ChartsData> {
    const { data } = await api.get<ChartsData>("/kpis/charts")
    return data
  },

  async getFinancial(): Promise<FinancialData> {
    const { data } = await api.get<FinancialData>("/kpis/financial")
    return data
  },

  async getAlerts(): Promise<ReorderAlert[]> {
    const { data } = await api.get<ReorderAlert[]>("/kpis/alerts")
    return data
  },
}
