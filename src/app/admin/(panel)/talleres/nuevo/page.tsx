import { TallerForm } from "@/components/admin/TallerForm"
import { AdminPageHeader } from "@/components/admin/admin-ui"

export default function NuevoTallerPage() {
  return (
    <>
      <AdminPageHeader title="Nuevo taller" />
      <TallerForm mode="create" />
    </>
  )
}
