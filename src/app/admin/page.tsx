"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Taller } from "@/lib/talleres"
import type { Service } from "@/lib/services"
import { pickLocale } from "@/lib/i18n-field"

export default function AdminPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [talleres, setTalleres] = useState<Taller[]>([])

  useEffect(() => {
    fetch("/api/services?all=1")
      .then((res) => res.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(console.error)

    fetch("/api/talleres")
      .then((res) => res.json())
      .then((data) => setTalleres(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  const handleDeleteTaller = async (slug: string) => {
    if (!confirm("¿Eliminar este taller?")) return
    const res = await fetch(`/api/talleres/${slug}`, { method: "DELETE" })
    if (res.ok) setTalleres((prev) => prev.filter((t) => t.slug !== slug))
  }

  const handleDeleteService = async (slug: string) => {
    if (!confirm("¿Eliminar este servicio?")) return
    const res = await fetch(`/api/services/${slug}`, { method: "DELETE" })
    if (res.ok) setServices((prev) => prev.filter((s) => s.slug !== slug))
  }

  const formatDate = (date: string) =>
    new Date(date + "T12:00:00").toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const missingLocales = (service: Service) =>
    (["en", "fr"] as const).filter((code) => !service.title[code]?.trim())

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <header className="flex items-center justify-between bg-[#1a1a1a] px-6 py-4 text-white">
        <Link href="/admin" className="text-lg font-light">
          Eduardo Montenegro
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-neutral-400 transition-colors duration-200 hover:text-white"
        >
          Salir
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Servicios */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-light text-neutral-900">Servicios</h2>
            <Link
              href="/admin/servicios/nuevo"
              className="border border-neutral-400 px-4 py-2 text-sm transition-colors duration-200 hover:bg-neutral-900 hover:text-white"
            >
              + Nuevo servicio
            </Link>
          </div>

          {services.length === 0 ? (
            <p className="border border-dashed border-neutral-300 py-12 text-center text-neutral-500">
              No hay servicios aún
            </p>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between border border-neutral-200 bg-white px-6 py-4"
                >
                  {service.coverImage && (
                    <img
                      src={service.coverImage}
                      alt=""
                      className="mr-4 h-16 w-24 shrink-0 object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-lg font-medium text-neutral-900">
                        {pickLocale(service.title, "es") || service.slug}
                      </h3>
                      {!service.published && (
                        <span className="border border-neutral-300 px-2 py-0.5 text-xs text-neutral-500">
                          Borrador
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-neutral-400">/servicios/{service.slug}</p>
                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-neutral-500">
                      <span>Orden: {service.position}</span>
                      <span>
                        {service.ctaType === "form" ? "Formulario grupal" : "WhatsApp"}
                      </span>
                      {missingLocales(service).length > 0 && (
                        <span className="text-amber-600">
                          Sin traducir: {missingLocales(service).join(", ").toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    <a
                      href={`/servicios/${service.slug}`}
                      target="_blank"
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
                      onClick={() => handleDeleteService(service.slug)}
                      className="px-3 py-1 text-sm text-red-500 transition-colors duration-200 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Talleres */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-light text-neutral-900">Talleres</h2>
            <Link
              href="/admin/talleres/nuevo"
              className="border border-neutral-400 px-4 py-2 text-sm transition-colors duration-200 hover:bg-neutral-900 hover:text-white"
            >
              + Nuevo taller
            </Link>
          </div>

          {talleres.length === 0 ? (
            <p className="border border-dashed border-neutral-300 py-12 text-center text-neutral-500">
              No hay talleres aún
            </p>
          ) : (
            <div className="space-y-4">
              {talleres.map((taller) => (
                <div
                  key={taller.id}
                  className="flex items-center justify-between border border-neutral-200 bg-white px-6 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-medium text-neutral-900">
                      {taller.title}
                    </h3>
                    <p className="font-mono text-xs text-neutral-400">{taller.slug}</p>
                    <div className="mt-1 flex gap-4 text-sm text-neutral-500">
                      <span>{formatDate(taller.date)}</span>
                      <span>{taller.cost}</span>
                      <span className="max-w-xs truncate">{taller.excerpt}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-2">
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
                      onClick={() => handleDeleteTaller(taller.slug)}
                      className="px-3 py-1 text-sm text-red-500 transition-colors duration-200 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
