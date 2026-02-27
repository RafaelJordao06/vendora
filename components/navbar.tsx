"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, PlusCircle, LogOut } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/purchases/new",
      label: "Nova Compra",
      icon: PlusCircle,
      active: pathname === "/dashboard/purchases/new",
    },
  ]

  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2 font-bold text-xl text-zinc-900">
            Vendora
          </Link>
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "transition-colors hover:text-foreground/80 flex items-center gap-2",
                  route.active ? "text-zinc-900" : "text-zinc-500"
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="md:hidden flex items-center gap-2 mr-2">
             {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                size="icon"
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="h-5 w-5" />
                  <span className="sr-only">{route.label}</span>
                </Link>
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
