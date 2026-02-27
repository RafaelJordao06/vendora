"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Package, 
  DollarSign, 
  User, 
  FileText, 
  ArrowLeft,
  Loader2
} from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  totalAmount: z.coerce.number().min(0.01, "Valor deve ser positivo"),
  rafaelInvest: z.coerce.number().min(0, "Investimento deve ser positivo"),
  socioInvest: z.coerce.number().min(0, "Investimento deve ser positivo"),
}).refine((data) => {
  const totalInvest = data.rafaelInvest + data.socioInvest
  return Math.abs(totalInvest - data.totalAmount) < 0.01
}, {
  message: "A soma dos investimentos deve ser igual ao valor total",
  path: ["totalAmount"],
})

export default function NewPurchasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      totalAmount: 0,
      rafaelInvest: 0,
      socioInvest: 0,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao criar compra")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Compra</h1>
          <p className="text-gray-500 mt-1">Cadastre uma nova compra</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Detalhes do Produto</h2>
                <p className="text-sm text-gray-500">Informações básicas do produto</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome do Produto</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    {...form.register("name")} 
                    placeholder="Ex: iPhone 15 Pro Max" 
                    className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Descrição (Opcional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea 
                    {...form.register("description")}
                    placeholder="Observações sobre o produto..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none h-24"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Investimentos</h2>
                <p className="text-sm text-gray-500">Valores pagos por cada participante</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Valor Total Pago</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...form.register("totalAmount")} 
                    placeholder="0,00" 
                    className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                {form.formState.errors.totalAmount && (
                  <p className="text-sm text-red-500">{form.formState.errors.totalAmount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sua Parte</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...form.register("rafaelInvest")} 
                    placeholder="0,00" 
                    className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Parte do Sócio/Partner</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...form.register("socioInvest")} 
                    placeholder="0,00" 
                    className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>Importante:</strong> A soma dos investimentos deve ser igual ao valor total pago.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Submit */}
        <div className="space-y-6">
          {/* Submit */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Produto</span>
                <span className="font-medium text-gray-900">{form.watch("name") || "---"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valor Total</span>
                <span className="font-medium text-gray-900">
                  {form.watch("totalAmount") ? `R$ ${form.watch("totalAmount")}` : "---"}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 mr-2" />
                    Criar Compra
                  </>
                )}
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
