"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Taller } from "@/lib/talleres"

export default function AdminPage() {
  const router = useRouter()
  const [talleres, setTalleres] = useState<Taller[]>([])

  useEffect(() => {
    fetch("/api/talleres")
      .then((res) => res.json())
      .then(setTalleres)
      .catch(console.error)
  }, [])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  const handleDelete = async (slug: string) => {
    if (!confirm("¿Eliminar este taller?")) return
    const res = await fetch(`/api/talleres/${slug}`, { method: "DELETE" })
    if (res.ok) {
      setTalleres((prev) => prev.filter((t) => t.slug !== slug))
    }
  }

  const formatDate = (date: string) => {
    return new Date(date + "T12:00:00").toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <header className="flex items-center justify-between bg-[#1a1a1a] px-6 py-4 text-white">
        <Link href="/admin" className="text-lg font-light">
          Eduardo Montenegro
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/talleres/nuevo"
            className="border border-white px-4 py-2 text-sm transition-colors duration-200 hover:bg-white hover:text-black"
          >
            + Nuevo taller
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-400 transition-colors duration-200 hover:text-white"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {talleres.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-4 text-neutral-500">No hay talleres aún</p>
            <Link
              href="/admin/talleres/nuevo"
              className="inline-block border border-neutral-400 px-4 py-2 text-sm transition-colors duration-200 hover:bg-neutral-900 hover:text-white"
            >
              Crear primer taller
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {talleres.map((taller) => (
              <div
                key={taller.id}
                className="flex items-center justify-between border border-neutral-200 bg-white px-6 py-4"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-medium text-neutral-900">
                    {taller.title}
                  </h2>
                  <p className="font-mono text-xs text-neutral-400">{taller.slug}</p>
                  <div className="mt-1 flex gap-4 text-sm text-neutral-500">
                    <span>{formatDate(taller.date)}</span>
                    <span>{taller.cost}</span>
                    <span className="max-w-xs truncate">{taller.excerpt}</span>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <a
                    href={`/talleres/${taller.slug}`}
                    target="_blank"
                    className="px-3 py-1 text-sm text-neutral-600 transition-colors duration-200 hover:text-neutral-900"
                  >
                    Ver
                  </a>
                  <Link
                    href={`/admin/talleres/${taller.slug}/editar`}
                    className="px-3 py-1 text-sm text-neutral-600 transition-colors duration-200 hover:text-neutral-900"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(taller.slug)}
                    className="px-3 py-1 text-sm text-red-500 transition-colors duration-200 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
