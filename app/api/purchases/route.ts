import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, description, totalAmount, rafaelInvest, socioInvest, status, images, partnerId } = body

    if (!name || totalAmount === undefined || rafaelInvest === undefined) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const socioValue = socioInvest || 0

    // Validate total amount
    if (Math.abs((rafaelInvest + socioValue) - totalAmount) > 0.01) {
      return new NextResponse("Investments must equal total amount", { status: 400 })
    }

    const purchase = await prisma.purchase.create({
      data: {
        name,
        description,
        totalAmount,
        rafaelInvest,
        socioInvest: socioValue,
        status: status || "COMPRADO",
        userId: session.user.id,
        images: images && images.length > 0 ? {
          createMany: {
            data: images.map((image: { url: string }) => image)
          }
        } : undefined,
        participants: partnerId ? {
          connect: { id: partnerId }
        } : undefined
      },
      include: {
        participants: true,
        images: true
      }
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error("[PURCHASES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Buscar compras onde o usuário é dono OU participante
    const purchases = await prisma.purchase.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { participants: { some: { id: session.user.id } } }
        ]
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error("[PURCHASES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
