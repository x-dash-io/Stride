import { prisma } from '@/lib/prisma'
import { ok, err, Result } from '@/lib/types/result'

export interface InventoryCheckResult {
  available: boolean
  availableStock: number
  inventoryId?: string
}

export interface ReserveInventoryInput {
  variantId: string
  quantity: number
  orderId: string
}

export async function checkInventory(variantId: string, quantity: number): Promise<Result<InventoryCheckResult, string>> {
  const inventory = await prisma.inventory.findFirst({
    where: { variantId, quantityOnHand: { gte: quantity } },
  })

  if (!inventory) {
    const allInventory = await prisma.inventory.findMany({ where: { variantId } })
    const totalOnHand = allInventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)
    return ok({ available: false, availableStock: totalOnHand })
  }

  return ok({ available: true, availableStock: inventory.quantityOnHand, inventoryId: inventory.id })
}

export async function reserveInventory(input: ReserveInventoryInput): Promise<Result<{ success: true }, string>> {
  const inventory = await prisma.inventory.findFirst({
    where: { variantId: input.variantId, quantityOnHand: { gte: input.quantity } },
  })

  if (!inventory) {
    return err('Insufficient stock for reservation')
  }

  await prisma.inventory.update({
    where: { id: inventory.id },
    data: { quantityReserved: { increment: input.quantity } },
  })

  return ok({ success: true })
}

export async function releaseInventory(variantId: string, quantity: number): Promise<Result<{ success: true }, string>> {
  const inventory = await prisma.inventory.findFirst({
    where: { variantId, quantityReserved: { gte: quantity } },
  })

  if (!inventory) {
    return err('No reserved inventory to release')
  }

  await prisma.inventory.update({
    where: { id: inventory.id },
    data: { quantityReserved: { decrement: quantity } },
  })

  return ok({ success: true })
}

export async function confirmInventorySale(variantId: string, quantity: number): Promise<Result<{ success: true }, string>> {
  const inventory = await prisma.inventory.findFirst({
    where: { variantId, quantityOnHand: { gte: quantity }, quantityReserved: { gte: quantity } },
  })

  if (!inventory) {
    return err('Insufficient stock for sale confirmation')
  }

  await prisma.inventory.update({
    where: { id: inventory.id },
    data: {
      quantityOnHand: { decrement: quantity },
      quantityReserved: { decrement: quantity },
    },
  })

  return ok({ success: true })
}

export async function getLowStockVariants(threshold?: number): Promise<Result<any[], string>> {
  const variants = await prisma.productVariant.findMany({
    where: {
      isActive: true,
      inventory: {
        some: { quantityOnHand: { lte: threshold ?? 5 } },
      },
    },
    include: {
      product: { select: { name: true } },
      inventory: true,
    },
  })

  return ok(variants)
}

export async function getAvailableStock(variantId: string): Promise<number> {
  const inventories = await prisma.inventory.findMany({ where: { variantId } })
  return inventories.reduce((sum, inv) => sum + inv.quantityOnHand, 0)
}