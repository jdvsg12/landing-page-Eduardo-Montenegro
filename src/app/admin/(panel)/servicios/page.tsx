"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Service } from "@/lib/services"
import { pickLocale } from "@/lib/i18n-field"
import {
  AdminPageHeader,
  VisibilityTabs,
  VisibilityToggle,
  filterByVisibility,
  primaryButtonClass,
  visibilityCounts,
  type VisibilityFilter,
} from "@/components/admin/admin-ui"

function actionLabels(service: Service) {
  return [
    service.showWhatsapp && "WhatsApp",
    service.showForm && "Formulario",
    service.showCalendar && "Calendario",
    service.showRegistration && "Link de inscripción",
  ].filter(Boolean) as string[]
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null)
  const [filter, setFilter] = useState<VisibilityFilter>("all")
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/services?all=1")
      .then((res) => res.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
  }, [])

  const handleDelete = async (slug: string) => {
    if (!confirm("¿Eliminar este servicio? Esta acción no se puede deshacer.")) return
    const res = await fetch(`/api/services/${slug}`, { method: "DELETE" })
    if (res.ok) setServices((prev) => prev?.filter((s) => s.slug !== slug) ?? null)
  }

  /** Cambia la visibilidad sin tocar el resto del servicio. */
  const handleVisibility = async (slug: string, published: boolean) => {
    setError("")
    setPending(slug)
    setServices((prev) => prev?.map((s) => (s.slug === slug ? { ...s, published } : s)) ?? null)
    try {
      const res = await fetch(`/api/services/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setServices((prev) => prev?.map((s) => (s.slug === slug ? { ...s, published: !published } : s)) ?? null)
      setError("No se pudo cambiar la visibilidad. Intenta de nuevo.")
    } finally {
      setPending(null)
    }
  }

  const missingLocales = (service: Service) =>
    (["en", "fr"] as const).filter((code) => !service.title[code]?.trim())

  return (
    <>
      <AdminPageHeader
        title="Servicios"
        description="Cada servicio tiene una card en la home y su propia página interna. El orden define la posición en el carrusel."
        actions={
          <Link href="/admin/servicios/nuevo" className={primaryButtonClass}>
            + Nuevo servicio
          </Link>
        }
      />

      {error && (
        <p role="alert" className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {services !== null && services.length > 0 && (
        <VisibilityTabs value={filter} onChange={setFilter} counts={visibilityCounts(services)} />
      )}

      {services === null ? (
        <p className="py-12 text-center text-sm text-neutral-500">Cargando...</p>
      ) : services.length === 0 ? (
        <p className="border border-dashed border-neutral-300 py-12 text-center text-neutral-500">No hay servicios aún</p>
      ) : (
        <ul className="space-y-3">
          {filterByVisibility(services, filter).length === 0 && (
            <li className="border border-dashed border-neutral-300 py-10 text-center text-sm text-neutral-500">
              No hay servicios {filter === "public" ? "públicos" : "privados"}.
            </li>
          )}
          {filterByVisibility(services, filter).map((service) => {
            const image = service.cardImage || service.coverImage
            const missing = missingLocales(service)
            return (
              <li
                key={service.id}
                className={`flex flex-col gap-4 border border-neutral-200 p-4 sm:flex-row sm:items-center ${
                  service.published ? "bg-white" : "bg-neutral-50"
                }`}
              >
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className={`h-20 w-full shrink-0 object-cover sm:w-28 ${service.published ? "" : "opacity-50 grayscale"}`}
                  />
                ) : (
                  <div className="flex h-20 w-full shrink-0 items-center justify-center bg-neutral-100 text-xs text-neutral-400 sm:w-28">
                    Sin foto
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-medium text-neutral-900">
                      {pickLocale(service.title, "es") || service.slug}
                    </h2>
                  </div>
                  <p className="font-mono text-xs text-neutral-400">/servicios/{service.slug}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                    <span>Orden: {service.position}</span>
                    <span>{actionLabels(service).join(" · ") || "Sin botones"}</span>
                    {missing.length > 0 && (
                      <span className="text-amber-700">Sin traducir: {missing.join(", ").toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <VisibilityToggle
                    size="sm"
                    published={service.published}
                    disabled={pending === service.slug}
                    onChange={(published) => handleVisibility(service.slug, published)}
                  />
                  <a
                    href={`/servicios/${service.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm text-neutral-600 transition-colors duration-200 hover:text-neutral-900"
                  >
                    Ver
                  </a>
                  <Link
                    href={`/admin/servicios/${service.slug}/editar`}
                    className="px-3 py-1 text-sm text-neutral-600 transition-colors duration-200 hover:text-neutral-900"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(service.slug)}
                    className="px-3 py-1 text-sm text-red-600 transition-colors duration-200 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
