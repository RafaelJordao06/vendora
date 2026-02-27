import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Status } from "@prisma/client"
import { PurchaseActions } from "@/components/purchase-actions"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Package, TrendingUp, DollarSign, ShoppingCart, ArrowRight } from "lucide-react"

async function getStats(userId: string) {
  const purchases = await prisma.purchase.findMany({
    where: {
      OR: [
        { userId: userId },
        { participants: { some: { id: userId } } }
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
      createdAt: "desc",
    },
  })

  const totalInvested = purchases.reduce((acc, curr) => acc + curr.totalAmount, 0)
  
  const soldItems = purchases.filter((p) => p.status === Status.VENDIDO)
  const totalSold = soldItems.reduce((acc, curr) => acc + (curr.saleAmount || 0), 0)
  
  let totalProfit = 0

  soldItems.forEach((item) => {
    if (item.saleAmount) {
      const profit = item.saleAmount - item.totalAmount
      totalProfit += profit
    }
  })

  return {
    purchases,
    stats: {
      totalInvested,
      totalSold,
      totalProfit,
      purchaseCount: purchases.length,
    },
  }
}

function StatCard({ title, value, className = "" }: { 
  title: string
  value: string
  className?: string
}) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma compra ainda</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        Comece cadastrando sua primeira compra para acompanhar seus investimentos.
      </p>
      <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
        <Link href="/dashboard/purchases/new">
          Criar Primeira Compra
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id || ""
  
  const { purchases, stats } = await getStats(userId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral das suas compras e investimentos</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 px-6 h-11 rounded-xl shadow-lg shadow-indigo-600/20">
          <Link href="/dashboard/purchases/new">
            <Package className="w-5 h-5 mr-2" />
            Nova Compra
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Investido" value={formatCurrency(stats.totalInvested)} />
        <StatCard title="Total Vendido" value={formatCurrency(stats.totalSold)} />
        <StatCard 
          title="Lucro Total" 
          value={formatCurrency(stats.totalProfit)} 
          className={stats.totalProfit >= 0 ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}
        />
        <StatCard title="Total de Compras" value={stats.purchaseCount.toString()} />
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Compras Recentes</h2>
        </div>
        
        {purchases.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Produto</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden md:table-cell">Dono</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Participantes</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Valor</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.map((purchase) => {
                  const isOwner = purchase.userId === userId
                  return (
                    <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{purchase.name}</div>
                        {purchase.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{purchase.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-gray-900">{purchase.user.name || purchase.user.email}</div>
                        {isOwner && (
                          <Badge variant="secondary" className="text-xs mt-1 bg-indigo-100 text-indigo-700">Dono</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {purchase.participants.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {purchase.participants.map((p) => (
                              <Badge key={p.id} variant="outline" className="text-xs">
                                {p.name || p.email}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={purchase.status === "COMPRADO" ? "default" : "secondary"}
                          className={purchase.status === "COMPRADO" 
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100" 
                            : "bg-green-100 text-green-700 hover:bg-green-100"
                          }
                        >
                          {purchase.status === "COMPRADO" ? "Comprado" : "Vendido"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(purchase.totalAmount)}</div>
                        {purchase.status === "VENDIDO" && purchase.saleAmount && (
                          <div className="text-xs text-green-600">
                            Vendido: {formatCurrency(purchase.saleAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PurchaseActions purchase={purchase} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
