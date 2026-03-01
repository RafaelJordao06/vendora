import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { formatCurrency, formatDate } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SearchParams = {
  startDate?: string
  endDate?: string
  period?: "monthly" | "custom"
  partner?: "all" | "with" | "without"
}

type ReportsPageProps = {
  searchParams: Promise<SearchParams>
}

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map(Number)
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1))
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const params = await searchParams

  const now = new Date()
  const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const selectedPartner = params.partner ?? "all"

  const startDate = params.startDate
    ? new Date(`${params.startDate}T00:00:00`)
    : defaultStartDate

  const endDate = params.endDate
    ? new Date(`${params.endDate}T23:59:59.999`)
    : new Date(defaultEndDate.setHours(23, 59, 59, 999))

  const partnerFilter =
    selectedPartner === "with"
      ? { participants: { some: {} } }
      : selectedPartner === "without"
      ? { participants: { none: {} } }
      : {}

  const sales = await prisma.purchase.findMany({
    where: {
      status: "VENDIDO",
      saleDate: {
        gte: startDate,
        lte: endDate,
      },
      OR: [{ userId: session.user.id }, { participants: { some: { id: session.user.id } } }],
      ...partnerFilter,
    },
    select: {
      id: true,
      name: true,
      totalAmount: true,
      saleAmount: true,
      saleDate: true,
      participants: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      saleDate: "desc",
    },
  })

  const monthlyTotals = sales.reduce<Record<string, number>>((acc, sale) => {
    if (!sale.saleDate || !sale.saleAmount) return acc

    const key = `${sale.saleDate.getFullYear()}-${String(sale.saleDate.getMonth() + 1).padStart(2, "0")}`
    acc[key] = (acc[key] || 0) + sale.saleAmount
    return acc
  }, {})

  const totalSales = sales.reduce((sum, sale) => sum + (sale.saleAmount ?? 0), 0)
  const totalInvested = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalProfit = totalSales - totalInvested

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatório de Vendas</h1>
        <p className="text-gray-500 mt-1">
          Acompanhe vendas por período, data e participação de sócios.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4" method="GET">
            <div className="space-y-1">
              <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                Data inicial
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={params.startDate ?? defaultStartDate.toISOString().slice(0, 10)}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                Data final
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={params.endDate ?? defaultEndDate.toISOString().slice(0, 10)}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="partner" className="text-sm font-medium text-gray-700">
                Sócio
              </label>
              <select
                id="partner"
                name="partner"
                defaultValue={selectedPartner}
                className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <option value="all">Todos</option>
                <option value="with">Com sócio</option>
                <option value="without">Sem sócio</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                Aplicar filtros
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total vendido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total investido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lucro no período</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(totalProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendas por mês</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(monthlyTotals).length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma venda no período selecionado.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(monthlyTotals)
                .sort(([a], [b]) => (a > b ? -1 : 1))
                .map(([monthKey, amount]) => (
                  <li
                    key={monthKey}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                  >
                    <span className="capitalize text-gray-700">{formatMonthLabel(monthKey)}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento das vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma venda encontrada com esses filtros.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compra</TableHead>
                  <TableHead>Data da venda</TableHead>
                  <TableHead>Investimento</TableHead>
                  <TableHead>Venda</TableHead>
                  <TableHead>Lucro</TableHead>
                  <TableHead>Sócio(s)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => {
                  const saleAmount = sale.saleAmount ?? 0
                  const profit = saleAmount - sale.totalAmount

                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.name}</TableCell>
                      <TableCell>{sale.saleDate ? formatDate(sale.saleDate) : "-"}</TableCell>
                      <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                      <TableCell>{formatCurrency(saleAmount)}</TableCell>
                      <TableCell className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(profit)}
                      </TableCell>
                      <TableCell>
                        {sale.participants.length > 0
                          ? sale.participants.map((participant) => participant.name || participant.email).join(", ")
                          : "Sem sócio"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
