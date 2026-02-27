"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/format"
import { Check, Loader2, DollarSign, Calendar, TrendingUp } from "lucide-react"

interface PurchaseWithParticipants {
  id: string
  name: string
  totalAmount: number
  rafaelInvest: number
  socioInvest: number
  status: string
  saleAmount: number | null
  saleDate: Date | null
  participants: {
    id: string
    name: string | null
    email: string
  }[]
}

interface PurchaseActionsProps {
  purchase: PurchaseWithParticipants
}

export function PurchaseActions({ purchase }: PurchaseActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saleAmount, setSaleAmount] = useState<string>("")
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split("T")[0])

  const numericSaleAmount = parseFloat(saleAmount)
  const profit = isNaN(numericSaleAmount) ? 0 : numericSaleAmount - purchase.totalAmount
  
  const percentRafael = purchase.totalAmount > 0 ? purchase.rafaelInvest / purchase.totalAmount : 0
  const percentSocio = purchase.totalAmount > 0 ? purchase.socioInvest / purchase.totalAmount : 0

  const profitRafael = profit * percentRafael
  const profitSocio = profit * percentSocio

  const totalRafael = purchase.rafaelInvest + profitRafael
  const totalSocio = purchase.socioInvest + profitSocio

  // Get the first participant's name or email
  const partnerName = purchase.participants.length > 0 
    ? (purchase.participants[0].name || purchase.participants[0].email)
    : "Sócio"

  const onSell = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/purchases/${purchase.id}/sell`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          saleAmount: numericSaleAmount,
          saleDate: saleDate,
        }),
      })

      if (!response.ok) {
        throw new Error("Algo deu errado")
      }

      router.refresh()
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (purchase.status === "VENDIDO") {
    return (
      <Button variant="ghost" size="sm" disabled className="text-green-600">
        <Check className="mr-2 h-4 w-4" />
        Vendido
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300">
          <TrendingUp className="w-4 h-4 mr-2" />
          Registrar Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Registrar Venda</DialogTitle>
          <DialogDescription>
            Informe os detalhes da venda de <strong>{purchase.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Sale Amount */}
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Valor da Venda
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Sale Date */}
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Data da Venda
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="date"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Preview */}
          {saleAmount && !isNaN(numericSaleAmount) && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600">Lucro</span>
                <span className={`text-xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(profit)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Rafael ({Math.round(percentRafael * 100)}%)</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalRafael)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{partnerName} ({Math.round(percentSocio * 100)}%)</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalSocio)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
            Cancelar
          </Button>
          <Button 
            onClick={onSell} 
            disabled={loading || !saleAmount || isNaN(numericSaleAmount)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
