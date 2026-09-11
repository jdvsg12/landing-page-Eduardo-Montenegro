import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getServiceBySlug } from "@/lib/db-services"
import { ServiceDetail } from "@/components/services/ServiceDetail"
import { PrivatePreviewBanner } from "@/components/private-preview-banner"
import { getSession } from "@/lib/auth"
import { pickLocale } from "@/lib/i18n-field"

// Dinámica: el layout lee la cookie de idioma y los privados dependen de la sesión.
// Con `generateStaticParams` la ruta quedaba estática y un elemento creado
// después del deploy respondía 500 (DYNAMIC_SERVER_USAGE).
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service) return {}

  return {
    title: `${pickLocale(service.title, "es")} | Eduardo Montenegro`,
    description: pickLocale(service.excerpt, "es"),
    robots: service.published ? undefined : { index: false, follow: false },
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service) {
    notFound()
  }

  const isPrivatePreview = !service.published
  if (isPrivatePreview && !(await getSession())) {
    notFound()
  }

  return (
    <>
      <ServiceDetail service={service} />
      {isPrivatePreview && <PrivatePreviewBanner editHref={`/admin/servicios/${service.slug}/editar`} />}
    </>
  )
}
