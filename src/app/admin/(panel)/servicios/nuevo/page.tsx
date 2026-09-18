import { ServiceForm } from "@/components/admin/ServiceForm"
import { AdminPageHeader } from "@/components/admin/admin-ui"

export default function NuevoServicioPage() {
  return (
    <>
      <AdminPageHeader title="Nuevo servicio" />
      <ServiceForm mode="create" />
    </>
  )
}
