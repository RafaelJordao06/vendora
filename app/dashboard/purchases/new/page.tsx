"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Package, 
  DollarSign, 
  User, 
  FileText, 
  ArrowLeft,
  Loader2,
  Users,
  Check
} from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  totalAmount: z.string().refine((val) => {
    const num = parseFloat(val.replace(',', '.'))
    return !isNaN(num) && num > 0
  }, "Valor deve ser maior que 0"),
  rafaelInvest: z.string().refine((val) => {
    const num = parseFloat(val.replace(',', '.'))
    return !isNaN(num) && num >= 0
  }, "Valor inválido"),
  socioInvest: z.string().optional(),
})

interface UserList {
  id: string
  name: string | null
  email: string
}

export default function NewPurchasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hasPartner, setHasPartner] = useState(false)
  const [users, setUsers] = useState<UserList[]>([])
  const [selectedPartner, setSelectedPartner] = useState<string>("")
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      totalAmount: "",
      rafaelInvest: "",
      socioInvest: "",
    },
  })

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true)
      setUsersError("")

      const response = await fetch("/api/users")

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sua sessão expirou. Faça login novamente para listar os sócios.")
        }
        throw new Error("Não foi possível carregar os sócios agora.")
      }

      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      const message = error instanceof Error ? error.message : "Falha ao carregar sócios."
      setUsersError(message)
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (hasPartner) {
      fetchUsers()
    }
  }, [hasPartner, fetchUsers])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const totalAmount = parseFloat(values.totalAmount.replace(',', '.'))
      const rafaelInvest = parseFloat(values.rafaelInvest.replace(',', '.'))
      const socioInvest = hasPartner ? parseFloat((values.socioInvest || "0").replace(',', '.')) : 0
      
      // Validate sum
      if (Math.abs((rafaelInvest + socioInvest) - totalAmount) > 0.01) {
        alert("A soma dos investimentos deve ser igual ao valor total!")
        setLoading(false)
        return
      }
      
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          totalAmount,
          rafaelInvest,
          socioInvest,
          partnerId: selectedPartner || null,
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

            {/* Pergunta: Tem Sócio? */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="hasPartner" 
                  checked={hasPartner}
                  onCheckedChange={(checked: boolean) => {
                    setHasPartner(checked)
                    if (!checked) {
                      form.setValue("socioInvest", "")
                      setSelectedPartner("")
                    }
                  }}
                />
                <label htmlFor="hasPartner" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Tem sócio/partner nesta compra?
                </label>
              </div>
            </div>

            {/* Selecionar Sócio */}
            {hasPartner && (
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Selecione o sócio:</label>
                {usersLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando sócios...
                  </div>
                ) : usersError ? (
                  <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-700">{usersError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fetchUsers}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum usuário disponível para parceria no momento.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedPartner(user.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPartner === user.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedPartner === user.id
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}>
                          {selectedPartner === user.id ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Users className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{user.name || "Sem nome"}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Valor Total Pago</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    {...form.register("totalAmount")} 
                    placeholder="0,00" 
                    className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                {form.formState.errors.totalAmount && (
                  <p className="text-sm text-red-500">{form.formState.errors.totalAmount.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sua Parte</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    {...form.register("rafaelInvest")} 
                    placeholder="0,00" 
                    className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {hasPartner && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Parte do Sócio/Partner</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      {...form.register("socioInvest")} 
                      placeholder="0,00" 
                      className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>
              )}
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
              <div className="flex justify-between">
                <span className="text-gray-500">Tem Sócio?</span>
                <span className="font-medium text-gray-900">{hasPartner ? "Sim" : "Não"}</span>
              </div>
              {hasPartner && selectedPartner && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Sócio:</span>
                  <span className="font-medium text-gray-900">
                    {users.find(u => u.id === selectedPartner)?.name || users.find(u => u.id === selectedPartner)?.email}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Button 
                type="submit" 
                disabled={loading || (hasPartner && !selectedPartner)}
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
