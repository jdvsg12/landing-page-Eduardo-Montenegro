import { getSiteContents } from "@/lib/db-content"
import { AdminPageHeader } from "@/components/admin/admin-ui"
import { SettingsEditor } from "@/components/admin/SettingsEditor"

export const dynamic = "force-dynamic"

export default async function Page() {
  const content = await getSiteContents(["seo", "legal"])

  return (
    <>
      <AdminPageHeader
        title="Ajustes y SEO"
        description="Cómo aparece el sitio en Google y al compartirlo, y los datos del responsable para las páginas legales."
      />
      <SettingsEditor {...content} />
    </>
  )
}
