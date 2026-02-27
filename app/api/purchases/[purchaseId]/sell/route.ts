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
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { saleAmount, saleDate } = body

    if (!saleAmount || !saleDate) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const purchase = await prisma.purchase.update({
      where: {
        id: purchaseId
      },
      data: {
        status: "VENDIDO",
        saleAmount,
        saleDate: new Date(saleDate)
      }
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error("[PURCHASE_SELL]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
