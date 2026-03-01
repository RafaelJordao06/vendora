import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: { id: true, userId: true },
    })

    if (!purchase) {
      return new NextResponse("Purchase not found", { status: 404 })
    }

    if (purchase.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await prisma.purchase.delete({
      where: { id: purchaseId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PURCHASE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
