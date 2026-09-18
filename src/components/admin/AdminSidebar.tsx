"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CalendarDays,
  ExternalLink,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react"

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ajustes", label: "Ajustes y SEO", icon: Settings },
  { href: "/admin/hero", label: "Hero", icon: ImageIcon },
  { href: "/admin/sobre-mi", label: "Sobre mí", icon: UserRound },
  { href: "/admin/servicios", label: "Servicios", icon: Layers },
  { href: "/admin/talleres", label: "Talleres", icon: CalendarDays },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
]

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  const current = NAV.find((item) => isActive(pathname, item.href))

  return (
    <>
      {/* Barra superior en mobile/tablet */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between bg-ink px-4 text-white lg:hidden">
        <Link href="/admin" className="font-serif text-lg font-light italic">
          Eduardo Montenegro
        </Link>
        <div className="flex items-center gap-3">
          {current && <span className="text-xs uppercase tracking-wider text-white/60">{current.label}</span>}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="admin-nav"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="flex h-10 w-10 items-center justify-center"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
        />
      )}

      <aside
        id="admin-nav"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 pb-6 pt-7">
          <Link href="/admin" className="block font-serif text-xl font-light italic">
            Eduardo Montenegro
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">Administración</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3" aria-label="Administración">
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-200 ${
                      active ? "bg-white text-ink" : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="space-y-0.5 border-t border-white/10 px-3 py-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
            Ver sitio
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Salir
          </button>
        </div>
      </aside>
    </>
  )
}
