import { notFound } from "next/navigation"
import { getServiceBySlug } from "@/lib/db-services"
import { ServiceForm } from "@/components/admin/ServiceForm"
import { AdminPageHeader } from "@/components/admin/admin-ui"

export default async function EditarServicioPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service) {
    notFound()
  }

  return (
    <>
      <AdminPageHeader title="Editar servicio" description={`/servicios/${slug}`} />
      <ServiceForm mode="edit" initialData={service} />
    </>
  )
}
