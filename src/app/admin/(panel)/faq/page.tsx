import { getSiteContents } from "@/lib/db-content"
import { AdminPageHeader } from "@/components/admin/admin-ui"
import { FaqEditor } from "@/components/admin/FaqEditor"

export const dynamic = "force-dynamic"

export default async function Page() {
  const content = await getSiteContents(["faq"])

  return (
    <>
      <AdminPageHeader
        title="Preguntas frecuentes"
        description="Las categorías son las pestañas; cada una agrupa sus preguntas."
      />
      <FaqEditor {...content} />
    </>
  )
}
