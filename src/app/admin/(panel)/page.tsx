import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { getAllServices, getRecentServiceLeads, getServiceLeadCounts } from "@/lib/db-services"
import { getAllTalleres } from "@/lib/db-talleres"
import { getSiteContents } from "@/lib/db-content"
import { pickLocale } from "@/lib/i18n-field"
import { AdminPageHeader } from "@/components/admin/admin-ui"

export const dynamic = "force-dynamic"

async function settle<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise
  } catch (err) {
    console.error("Dashboard query failed:", err)
    return fallback
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminDashboardPage() {
  const [services, talleres, leadCounts, recentLeads, content] = await Promise.all([
    settle(getAllServices(), []),
    settle(getAllTalleres(), []),
    settle(getServiceLeadCounts(), { total: 0, last30Days: 0 }),
    settle(getRecentServiceLeads(8), []),
    getSiteContents(["faq", "legal"]),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const published = services.filter((service) => service.published).length
  const upcoming = talleres.filter((taller) => taller.published && taller.date >= today).length
  const privateServices = services.length - published
  const privateTalleres = talleres.filter((taller) => !taller.published).length
  const faqCount = content.faq.categories.reduce((total, category) => total + category.items.length, 0)
  const serviceTitles = new Map(services.map((service) => [service.slug, pickLocale(service.title, "es")]))

  const pending: { label: string; href: string }[] = []
  if (!content.legal.documentId.trim() || !content.legal.address.trim()) {
    pending.push({
      label: "Completa tu documento de identidad y domicilio: aparecen como responsable en la política de privacidad.",
      href: "/admin/ajustes",
    })
  }
  const untranslated = services.filter((service) => !service.title.en?.trim() || !service.title.fr?.trim())
  if (untranslated.length > 0) {
    pending.push({
      label: `${untranslated.length} servicio(s) sin traducir al inglés o francés.`,
      href: "/admin/servicios",
    })
  }
  const withoutCover = services.filter((service) => service.published && !service.cardImage && !service.coverImage)
  if (withoutCover.length > 0) {
    pending.push({ label: `${withoutCover.length} servicio(s) publicados sin foto.`, href: "/admin/servicios" })
  }

  const stats = [
    {
      label: "Servicios públicos",
      value: published,
      detail: `${services.length} en total${privateServices ? ` · ${privateServices} privados` : ""}`,
      href: "/admin/servicios",
    },
    {
      label: "Talleres próximos",
      value: upcoming,
      detail: `${talleres.length} en total${privateTalleres ? ` · ${privateTalleres} privados` : ""}`,
      href: "/admin/talleres",
    },
    { label: "Inscripciones", value: leadCounts.last30Days, detail: `últimos 30 días · ${leadCounts.total} en total` },
    { label: "Preguntas frecuentes", value: faqCount, detail: `${content.faq.categories.length} categorías`, href: "/admin/faq" },
  ]

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Resumen del sitio y accesos rápidos a cada sección." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const body = (
            <>
              <p className="text-xs uppercase tracking-wider text-neutral-500">{stat.label}</p>
              <p className="mt-3 font-serif text-4xl font-light text-neutral-900">{stat.value}</p>
              <p className="mt-1 text-xs text-neutral-500">{stat.detail}</p>
            </>
          )
          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="border border-neutral-200 bg-white p-5 transition-colors duration-200 hover:border-neutral-400"
            >
              {body}
            </Link>
          ) : (
            <div key={stat.label} className="border border-neutral-200 bg-white p-5">
              {body}
            </div>
          )
        })}
      </div>

      {pending.length > 0 && (
        <section className="mt-8 border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-amber-800">Pendientes</h2>
          <ul className="mt-3 space-y-2">
            {pending.map((item) => (
              <li key={item.label} className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-amber-900">
                <span>{item.label}</span>
                <Link href={item.href} className="shrink-0 underline underline-offset-4">
                  Resolver
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 border border-dashed border-neutral-300 bg-white/60 p-6">
        <div className="flex items-start gap-4">
          <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep" strokeWidth={1.75} />
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-600">Estadísticas de la página</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
              Próximamente: visitas, páginas más vistas, idioma y origen del tráfico. Vercel Web Analytics ya está
              instalado en el sitio y recolectando datos anónimos, así que el historial estará disponible cuando se
              active este panel.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-500">Últimas inscripciones</h2>
          <span className="text-xs text-neutral-400">Formularios de los servicios</span>
        </div>
        {recentLeads.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">Todavía no hay inscripciones.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Contacto</th>
                  <th className="px-5 py-3 font-medium">Servicio</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-5 py-3 text-neutral-900">{lead.name}</td>
                    <td className="px-5 py-3 text-neutral-600">
                      <a href={`mailto:${lead.email}`} className="hover:underline">
                        {lead.email}
                      </a>
                      {lead.phone && <span className="block text-xs text-neutral-400">{lead.phone}</span>}
                    </td>
                    <td className="px-5 py-3 text-neutral-600">{serviceTitles.get(lead.serviceSlug) || lead.serviceSlug}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-neutral-500">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/admin/servicios/nuevo", label: "+ Nuevo servicio" },
            { href: "/admin/talleres/nuevo", label: "+ Nuevo taller" },
            { href: "/admin/hero", label: "Editar hero" },
            { href: "/admin/sobre-mi", label: "Editar sobre mí" },
            { href: "/admin/faq", label: "Editar FAQ" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 transition-colors duration-200 hover:bg-ink hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
