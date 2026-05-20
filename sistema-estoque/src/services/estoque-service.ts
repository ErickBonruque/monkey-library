import type { Product, Category, StockExit, KPIData } from "@/types"
import { mockProducts, mockCategories, mockExits } from "@/mocks"

export const estoqueService = {
  async getProducts(): Promise<Product[]> {
    await new Promise((res) => setTimeout(res, 600))
    return [...mockProducts]
  },

  async createProduct(data: Omit<Product, "id" | "createdAt" | "categoryName">): Promise<Product> {
    await new Promise((res) => setTimeout(res, 500))
    const category = mockCategories.find((c) => c.id === data.categoryId)
    return {
      ...data,
      id: String(Date.now()),
      categoryName: category?.name ?? "",
      createdAt: new Date().toISOString(),
    }
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await new Promise((res) => setTimeout(res, 500))
    const product = mockProducts.find((p) => p.id === id)
    if (!product) throw new Error("Produto não encontrado")
    return { ...product, ...data }
  },

  async deleteProduct(id: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 400))
    console.log("Produto deletado:", id)
  },

  async getCategories(): Promise<Category[]> {
    await new Promise((res) => setTimeout(res, 400))
    return [...mockCategories]
  },

  async createCategory(data: Omit<Category, "id">): Promise<Category> {
    await new Promise((res) => setTimeout(res, 400))
    return { ...data, id: String(Date.now()) }
  },

  async getExits(): Promise<StockExit[]> {
    await new Promise((res) => setTimeout(res, 600))
    return [...mockExits]
  },

  async registerExit(data: Omit<StockExit, "id" | "createdAt" | "productName" | "createdBy">): Promise<StockExit> {
    await new Promise((res) => setTimeout(res, 500))
    const product = mockProducts.find((p) => p.id === data.productId)
    return {
      ...data,
      id: String(Date.now()),
      productName: product?.name ?? "",
      createdAt: new Date().toISOString(),
      createdBy: "Usuário Atual",
    }
  },

  async getKPIs(): Promise<KPIData> {
    await new Promise((res) => setTimeout(res, 500))
    const products = mockProducts
    const lowStock = products.filter((p) => p.quantity <= p.minQuantity)
    const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0)
    return {
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      exitsThisMonth: mockExits.length,
      totalValue,
    }
  },
}