// Funções que convertem os modelos do Prisma para o formato esperado
// pelo front-end (ver src/types/index.ts do projeto Next.js).

export function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  }
}

// Versão reduzida usada no login/registro (AuthUser).
export function serializeAuthUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

export function serializeCategory(category) {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
  }
}

// Espera um produto com a categoria incluída (include: { category: true }).
export function serializeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? "",
    quantity: product.quantity,
    minQuantity: product.minQuantity,
    price: product.price,
    createdAt: product.createdAt.toISOString(),
  }
}

// Espera uma baixa com product e createdBy incluídos.
export function serializeExit(exit) {
  return {
    id: exit.id,
    productId: exit.productId,
    productName: exit.product?.name ?? "",
    quantity: exit.quantity,
    reason: exit.reason,
    createdAt: exit.createdAt.toISOString(),
    createdBy: exit.createdBy?.name ?? "Sistema",
  }
}

// Espera uma entrada com product e createdBy incluídos.
export function serializeEntry(entry) {
  return {
    id: entry.id,
    productId: entry.productId,
    productName: entry.product?.name ?? "",
    quantity: entry.quantity,
    reason: entry.reason,
    createdAt: entry.createdAt.toISOString(),
    createdBy: entry.createdBy?.name ?? "Sistema",
  }
}
