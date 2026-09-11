import { notFound } from "next/navigation"
import { getTallerBySlug } from "@/lib/db-talleres"
import { TallerForm } from "@/components/admin/TallerForm"
import { AdminPageHeader } from "@/components/admin/admin-ui"

export default async function EditarTallerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const taller = await getTallerBySlug(slug)

  if (!taller) {
    notFound()
  }

  return (
    <>
      <AdminPageHeader title="Editar taller" description={`/talleres/${slug}`} />
      <TallerForm mode="edit" initialData={taller} />
    </>
  )
}
