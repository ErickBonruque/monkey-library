import type { User, Product, Category, StockExit } from "@/types"

export const mockUsers: User[] = [
  { id: "1", name: "Ana Silva", email: "ana@empresa.com", role: "admin", status: "active", createdAt: "2024-01-10" },
  { id: "2", name: "Bruno Lima", email: "bruno@empresa.com", role: "manager", status: "active", createdAt: "2024-02-15" },
  { id: "3", name: "Carla Santos", email: "carla@empresa.com", role: "viewer", status: "inactive", createdAt: "2024-03-20" },
  { id: "4", name: "Diego Costa", email: "diego@empresa.com", role: "manager", status: "active", createdAt: "2024-04-05" },
]

export const mockCategories: Category[] = [
  { id: "1", name: "Eletrônicos", description: "Equipamentos e dispositivos eletrônicos" },
  { id: "2", name: "Escritório", description: "Materiais e móveis de escritório" },
  { id: "3", name: "Limpeza", description: "Produtos de limpeza e higiene" },
  { id: "4", name: "Informática", description: "Periféricos e acessórios de TI" },
]

export const mockProducts: Product[] = [
  { id: "1", name: "Notebook Dell Inspiron", sku: "NB-001", categoryId: "1", categoryName: "Eletrônicos", quantity: 15, minQuantity: 5, price: 3500, createdAt: "2024-01-15" },
  { id: "2", name: "Monitor LG 24\"", sku: "MN-002", categoryId: "1", categoryName: "Eletrônicos", quantity: 3, minQuantity: 5, price: 950, createdAt: "2024-01-20" },
  { id: "3", name: "Cadeira Ergonômica", sku: "MV-003", categoryId: "2", categoryName: "Escritório", quantity: 8, minQuantity: 3, price: 1200, createdAt: "2024-02-01" },
  { id: "4", name: "Resma de Papel A4", sku: "ES-004", categoryId: "2", categoryName: "Escritório", quantity: 2, minQuantity: 10, price: 28, createdAt: "2024-02-10" },
  { id: "5", name: "Desinfetante 5L", sku: "LM-005", categoryId: "3", categoryName: "Limpeza", quantity: 20, minQuantity: 8, price: 45, createdAt: "2024-03-01" },
  { id: "6", name: "Teclado Mecânico", sku: "TI-006", categoryId: "4", categoryName: "Informática", quantity: 4, minQuantity: 5, price: 320, createdAt: "2024-03-15" },
  { id: "7", name: "Mouse sem fio", sku: "TI-007", categoryId: "4", categoryName: "Informática", quantity: 12, minQuantity: 5, price: 180, createdAt: "2024-03-20" },
]

export const mockExits: StockExit[] = [
  { id: "1", productId: "1", productName: "Notebook Dell Inspiron", quantity: 2, reason: "Entrega para departamento TI", createdAt: "2024-05-01", createdBy: "Ana Silva" },
  { id: "2", productId: "4", productName: "Resma de Papel A4", quantity: 5, reason: "Consumo administrativo", createdAt: "2024-05-05", createdBy: "Bruno Lima" },
  { id: "3", productId: "5", productName: "Desinfetante 5L", quantity: 3, reason: "Manutenção predial", createdAt: "2024-05-10", createdBy: "Ana Silva" },
  { id: "4", productId: "6", productName: "Teclado Mecânico", quantity: 1, reason: "Substituição por defeito", createdAt: "2024-05-12", createdBy: "Diego Costa" },
  { id: "5", productId: "3", productName: "Cadeira Ergonômica", quantity: 2, reason: "Novas contratações", createdAt: "2024-05-15", createdBy: "Bruno Lima" },
]

export const mockExitsByMonth = [
  { month: "Jan", baixas: 4 },
  { month: "Fev", baixas: 7 },
  { month: "Mar", baixas: 5 },
  { month: "Abr", baixas: 9 },
  { month: "Mai", baixas: 5 },
  { month: "Jun", baixas: 3 },
]

export const mockProductsByCategory = [
  { categoria: "Eletrônicos", quantidade: 2 },
  { categoria: "Escritório", quantidade: 2 },
  { categoria: "Limpeza", quantidade: 1 },
  { categoria: "Informática", quantidade: 2 },
]