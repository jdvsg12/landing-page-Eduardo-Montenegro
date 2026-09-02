import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPublishedServices, getServiceBySlug } from "@/lib/db-services"
import { ServiceDetail } from "@/components/services/ServiceDetail"
import { pickLocale } from "@/lib/i18n-field"

export async function generateStaticParams() {
  const services = await getPublishedServices()
  return services.map((service) => ({ slug: service.slug }))
}

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
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service || !service.published) {
    notFound()
  }

  return <ServiceDetail service={service} />
}
