import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  try {
    const { purchaseId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const purchaseExists = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: {
        id: true,
        userId: true,
        participants: { select: { id: true } },
      },
    })

    if (!purchaseExists) {
      return new NextResponse("Purchase not found", { status: 404 })
    }

    const canManageSale =
      purchaseExists.userId === session.user.id ||
      purchaseExists.participants.some((participant) => participant.id === session.user.id)

    if (!canManageSale) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const body = await req.json()
    const { saleAmount, saleDate } = body

    if (!saleAmount || !saleDate) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const purchase = await prisma.purchase.update({
      where: {
        id: purchaseId,
      },
      data: {
        status: "VENDIDO",
        saleAmount,
        saleDate: new Date(saleDate),
      },
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error("[PURCHASE_SELL]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  try {
    const { purchaseId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const purchaseExists = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: {
        id: true,
        userId: true,
        participants: { select: { id: true } },
      },
    })

    if (!purchaseExists) {
      return new NextResponse("Purchase not found", { status: 404 })
    }

    const canManageSale =
      purchaseExists.userId === session.user.id ||
      purchaseExists.participants.some((participant) => participant.id === session.user.id)

    if (!canManageSale) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const purchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: "COMPRADO",
        saleAmount: null,
        saleDate: null,
      },
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error("[PURCHASE_SALE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
