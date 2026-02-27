"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Package, Mail, Lock, User, Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
})

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      router.push("/login")
    } catch (error: any) {
      setError(error.message || "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Pattern */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Comece hoje mesmo
          </h2>
          <p className="text-indigo-100 text-lg">
            Crie sua conta e tenha controle total sobre suas compras e investimentos.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendora</h1>
              <p className="text-sm text-gray-500">Sistema de Controle</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Criar conta</h2>
            <p className="text-gray-500 mt-2">Preencha os dados para começar</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...form.register("name")}
                  placeholder="Seu nome"
                  className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...form.register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...form.register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-500">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
              Entre
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
