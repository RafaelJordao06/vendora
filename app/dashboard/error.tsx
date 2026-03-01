"use client"

import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isDatabaseConfigError =
    error.message.includes("datasource") ||
    error.message.includes("DATABASE_URL") ||
    error.message.includes("Prisma")

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-6 md:p-8">
      <h2 className="text-lg font-semibold text-red-800">Não foi possível carregar o dashboard</h2>
      <p className="mt-2 text-sm text-red-700">
        {isDatabaseConfigError
          ? "Verifique se a variável DATABASE_URL está configurada corretamente no ambiente."
          : "Ocorreu um erro inesperado ao carregar os dados. Tente novamente."}
      </p>
      <Button onClick={reset} className="mt-4" variant="secondary">
        Tentar novamente
      </Button>
    </div>
  )
}
