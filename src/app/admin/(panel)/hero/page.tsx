import { getSiteContents } from "@/lib/db-content"
import { AdminPageHeader } from "@/components/admin/admin-ui"
import { HeroEditor } from "@/components/admin/HeroEditor"

export const dynamic = "force-dynamic"

export default async function Page() {
  const content = await getSiteContents(["hero"])

  return (
    <>
      <AdminPageHeader
        title="Hero"
        description="La primera pantalla del sitio: retrato, título, subtítulo y el texto que se desliza abajo."
      />
      <HeroEditor {...content} />
    </>
  )
}
