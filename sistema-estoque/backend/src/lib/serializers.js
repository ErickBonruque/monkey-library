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
    totalCost: exit.totalCost ?? 0,
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
    unitCost: entry.unitCost ?? 0,
    createdAt: entry.createdAt.toISOString(),
    createdBy: entry.createdBy?.name ?? "Sistema",
  }
}

// Convite de usuário. O token não é exposto na listagem administrativa.
export function serializeInvite(invite) {
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
    acceptedAt: invite.acceptedAt ? invite.acceptedAt.toISOString() : null,
    invitedBy: invite.invitedBy?.name ?? "Sistema",
  }
}

// Espera uma compra com items (e cada item com product) e usuários incluídos.
export function serializePurchaseOrder(order) {
  const items = (order.items ?? []).map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product?.name ?? "",
    quantity: item.quantity,
    unitCost: item.unitCost,
    subtotal: item.quantity * item.unitCost,
  }))
  return {
    id: order.id,
    supplier: order.supplier,
    status: order.status,
    notes: order.notes ?? "",
    total: items.reduce((sum, i) => sum + i.subtotal, 0),
    itemsCount: items.length,
    items,
    createdBy: order.createdBy?.name ?? "Sistema",
    approvedBy: order.approvedBy?.name ?? null,
    createdAt: order.createdAt.toISOString(),
    approvedAt: order.approvedAt ? order.approvedAt.toISOString() : null,
    receivedAt: order.receivedAt ? order.receivedAt.toISOString() : null,
  }
}
