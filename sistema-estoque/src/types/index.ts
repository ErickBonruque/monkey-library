export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "viewer"
  status: "active" | "inactive"
  createdAt: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "viewer"
}

export interface Category {
  id: string
  name: string
  description: string
}

export interface Product {
  id: string
  name: string
  sku: string
  categoryId: string
  categoryName: string
  quantity: number
  minQuantity: number
  price: number
  createdAt: string
}

export interface StockExit {
  id: string
  productId: string
  productName: string
  quantity: number
  reason: string
  createdAt: string
  createdBy: string
}

export interface StockEntry {
  id: string
  productId: string
  productName: string
  quantity: number
  reason: string
  createdAt: string
  createdBy: string
}

export interface KPIData {
  totalProducts: number
  lowStockCount: number
  exitsThisMonth: number
  totalValue: number
}