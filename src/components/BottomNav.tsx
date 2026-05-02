"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, User } from "lucide-react"

interface BottomNavProps {
  isAuthenticated: boolean
}

export default function BottomNav({ isAuthenticated }: BottomNavProps) {
  const pathname = usePathname()

  const links = [
    { href: "/", icon: Home, label: "Inicio" },
    {
      href: isAuthenticated ? "/planes/nuevo" : "/auth/login",
      icon: Plus,
      label: "Crear",
      isPrimary: true,
    },
    {
      href: isAuthenticated ? "/perfil" : "/auth/login",
      icon: User,
      label: "Perfil",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 safe-bottom">
      <div className="flex items-center justify-around px-4 py-2">
        {links.map(({ href, icon: Icon, label, isPrimary }) => {
          const isActive = pathname === href

          if (isPrimary) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center -mt-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-[#ff6b52]/40"
                  style={{ background: "linear-gradient(135deg, #ff8a72 0%, #ff6b52 60%, #ae311e 100%)" }}>
                  <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs text-gray-500 mt-1 font-semibold">{label}</span>
              </Link>
            )
          }

          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 px-4 py-1">
              <Icon
                className={`w-6 h-6 ${isActive ? "text-[#ff6b52]" : "text-gray-400"}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs font-semibold ${isActive ? "text-[#ff6b52]" : "text-gray-400"}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
