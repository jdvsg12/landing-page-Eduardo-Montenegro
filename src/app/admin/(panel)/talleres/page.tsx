"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Taller } from "@/lib/talleres"
import {
  AdminPageHeader,
  VisibilityTabs,
  VisibilityToggle,
  filterByVisibility,
  primaryButtonClass,
  visibilityCounts,
  type VisibilityFilter,
} from "@/components/admin/admin-ui"

const formatDate = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

export default function AdminTalleresPage() {
  const [talleres, setTalleres] = useState<Taller[] | null>(null)
  const [filter, setFilter] = useState<VisibilityFilter>("all")
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/talleres?all=1")
      .then((res) => res.json())
      .then((data) => setTalleres(Array.isArray(data) ? data : []))
      .catch(() => setTalleres([]))
  }, [])

  const handleDelete = async (slug: string) => {
    if (!confirm("¿Eliminar este taller? Esta acción no se puede deshacer.")) return
    const res = await fetch(`/api/talleres/${slug}`, { method: "DELETE" })
    if (res.ok) setTalleres((prev) => prev?.filter((t) => t.slug !== slug) ?? null)
  }

  /** Cambia la visibilidad sin tocar el resto del taller. */
  const handleVisibility = async (slug: string, published: boolean) => {
    setError("")
    setPending(slug)
    setTalleres((prev) => prev?.map((t) => (t.slug === slug ? { ...t, published } : t)) ?? null)
    try {
      const res = await fetch(`/api/talleres/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setTalleres((prev) => prev?.map((t) => (t.slug === slug ? { ...t, published: !published } : t)) ?? null)
      setError("No se pudo cambiar la visibilidad. Intenta de nuevo.")
    } finally {
      setPending(null)
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <AdminPageHeader
        title="Talleres"
        description="Los talleres aparecen en la home después de los servicios, ordenados por fecha."
        actions={
          <Link href="/admin/talleres/nuevo" className={primaryButtonClass}>
            + Nuevo taller
          </Link>
        }
      />

      {error && (
        <p role="alert" className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {talleres !== null && talleres.length > 0 && (
        <VisibilityTabs value={filter} onChange={setFilter} counts={visibilityCounts(talleres)} />
      )}

      {talleres === null ? (
        <p className="py-12 text-center text-sm text-neutral-500">Cargando...</p>
      ) : talleres.length === 0 ? (
        <p className="border border-dashed border-neutral-300 py-12 text-center text-neutral-500">No hay talleres aún</p>
      ) : (
        <ul className="space-y-3">
          {filterByVisibility(talleres, filter).length === 0 && (
            <li className="border border-dashed border-neutral-300 py-10 text-center text-sm text-neutral-500">
              No hay talleres {filter === "public" ? "públicos" : "privados"}.
            </li>
          )}
          {filterByVisibility(talleres, filter).map((taller) => (
            <li
              key={taller.id}
              className={`flex flex-col gap-4 border border-neutral-200 p-4 sm:flex-row sm:items-center ${
                taller.published ? "bg-white" : "bg-neutral-50"
              }`}
            >
              {taller.coverImage ? (
                <img
                  src={taller.coverImage}
                  alt=""
                  className={`h-20 w-full shrink-0 object-cover sm:w-28 ${taller.published ? "" : "opacity-50 grayscale"}`}
                />
              ) : (
                <div className="flex h-20 w-full shrink-0 items-center justify-center bg-neutral-100 text-xs text-neutral-400 sm:w-28">
                  Sin foto
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-medium text-neutral-900">{taller.title}</h2>
                  {taller.date < today && (
                    <span className="border border-neutral-300 px-2 py-0.5 text-xs text-neutral-500">Pasado</span>
                  )}
                </div>
                <p className="font-mono text-xs text-neutral-400">/talleres/{taller.slug}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                  <span>{formatDate(taller.date)}</span>
                  <span>{taller.cost}</span>
                  <span className="max-w-xs truncate">{taller.excerpt}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1">
                <VisibilityToggle
                  size="sm"
                  published={taller.published}
                  disabled={pending === taller.slug}
                  onChange={(published) => handleVisibility(taller.slug, published)}
                />
                <a
                  href={`/talleres/${taller.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  className="px-3 py-1 text-sm text-red-600 transition-colors duration-200 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
