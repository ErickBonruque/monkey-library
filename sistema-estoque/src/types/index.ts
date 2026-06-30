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
  totalCost: number
  createdAt: string
  createdBy: string
}

export interface StockEntry {
  id: string
  productId: string
  productName: string
  quantity: number
  reason: string
  unitCost: number
  createdAt: string
  createdBy: string
}

export interface KPIData {
  totalProducts: number
  lowStockCount: number
  exitsThisMonth: number
  totalValue: number
  stockValueAtCost: number
  stockValueAtPrice: number
  cogsThisMonth: number
}

export type Role = "admin" | "manager" | "viewer"

export interface Invite {
  id: string
  email: string
  role: Role
  status: "pending" | "accepted" | "revoked" | "expired"
  expiresAt: string
  createdAt: string
  acceptedAt: string | null
  invitedBy: string
}

export interface PurchaseOrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitCost: number
  subtotal: number
}

export interface PurchaseOrder {
  id: string
  supplier: string
  status: "pending" | "approved" | "received" | "cancelled"
  notes: string
  total: number
  itemsCount: number
  items: PurchaseOrderItem[]
  createdBy: string
  approvedBy: string | null
  createdAt: string
  approvedAt: string | null
  receivedAt: string | null
}

export interface FinancialProduct {
  productId: string
  name: string
  sku: string
  category: string
  quantity: number
  avgUnitCost: number
  unitPrice: number
  costValue: number
  saleValue: number
  margin: number
  marginPercent: number
}

export interface FinancialData {
  totalStockCost: number
  totalStockPrice: number
  potentialProfit: number
  topProductsByValue: FinancialProduct[]
  products: FinancialProduct[]
}

export interface ReorderAlert {
  productId: string
  name: string
  sku: string
  quantity: number
  minQuantity: number
  avgMonthlyConsumption: number
  suggestedQuantity: number
  severity: "critical" | "low"
}

export interface ChartsData {
  movementsByMonth: { month: string; baixas: number; entradas: number; custo: number }[]
  productsByCategory: { categoria: string; quantidade: number }[]
}