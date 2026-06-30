// Camada de domínio do estoque com custeio por lote (FIFO).
//
// Toda entrada gera um lote (StockBatch) carregando o custo unitário daquela
// reposição. Toda baixa consome os lotes na ordem de chegada (mais antigo
// primeiro) e apura o custo da mercadoria vendida (CMV) somando o custo de cada
// parcela consumida. Estas funções recebem um client de transação (`tx`) para
// que entrada/baixa e atualização de saldo sejam sempre atômicas.

// Erros de domínio sinalizados de dentro da transação e traduzidos em respostas
// HTTP pelas rotas.
export class ProductNotFoundError extends Error {}
export class InsufficientStockError extends Error {}

const movementInclude = { product: true, createdBy: true }

// Registra uma entrada: incrementa o saldo, cria o lote com o custo informado.
export async function createEntry(tx, { productId, quantity, unitCost, reason, userId, purchaseOrderId = null }) {
  // Incremento condicional e atômico — só aplica se o produto existir.
  const updated = await tx.product.updateMany({
    where: { id: productId },
    data: { quantity: { increment: quantity } },
  })
  if (updated.count === 0) {
    throw new ProductNotFoundError()
  }

  const entry = await tx.stockEntry.create({
    data: { productId, quantity, unitCost, reason, createdById: userId, purchaseOrderId },
    include: movementInclude,
  })

  await tx.stockBatch.create({
    data: {
      productId,
      quantity,
      initialQuantity: quantity,
      unitCost,
      entryId: entry.id,
    },
  })

  return entry
}

// Registra uma baixa: abate o saldo (de forma condicional/atômica), consome os
// lotes em FIFO e calcula o custo total (CMV) da movimentação.
export async function createExit(tx, { productId, quantity, reason, userId }) {
  // Controle de concorrência: abate o saldo apenas se ainda houver quantidade
  // suficiente. Se nada for afetado, ou o produto não existe ou falta estoque.
  const decremented = await tx.product.updateMany({
    where: { id: productId, quantity: { gte: quantity } },
    data: { quantity: { decrement: quantity } },
  })
  if (decremented.count === 0) {
    const product = await tx.product.findUnique({ where: { id: productId } })
    throw product ? new InsufficientStockError() : new ProductNotFoundError()
  }

  // Consome os lotes do mais antigo ao mais novo (FIFO).
  const batches = await tx.stockBatch.findMany({
    where: { productId, quantity: { gt: 0 } },
    orderBy: { createdAt: "asc" },
  })

  let remaining = quantity
  let totalCost = 0
  const consumptions = []

  for (const batch of batches) {
    if (remaining <= 0) break
    const taken = Math.min(remaining, batch.quantity)
    totalCost += taken * batch.unitCost
    consumptions.push({ batchId: batch.id, quantity: taken, unitCost: batch.unitCost })
    remaining -= taken
    await tx.stockBatch.update({
      where: { id: batch.id },
      data: { quantity: { decrement: taken } },
    })
  }

  // Defesa: se os lotes não cobrirem a quantidade (saldo dessincronizado),
  // aborta a transação para não gerar baixa inconsistente.
  if (remaining > 0) {
    throw new InsufficientStockError()
  }

  return tx.stockExit.create({
    data: {
      productId,
      quantity,
      reason,
      totalCost,
      createdById: userId,
      consumptions: { create: consumptions },
    },
    include: movementInclude,
  })
}
