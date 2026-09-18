import { getSiteContents } from "@/lib/db-content"
import { AdminPageHeader } from "@/components/admin/admin-ui"
import { AboutEditor } from "@/components/admin/AboutEditor"

export const dynamic = "force-dynamic"

export default async function Page() {
  const content = await getSiteContents(["about"])

  return (
    <>
      <AdminPageHeader
        title="Sobre mí"
        description="Cada pantalla se ve a la derecha mientras el título queda fijo a la izquierda. Lo ideal son uno o dos bloques por pantalla."
      />
      <AboutEditor {...content} />
    </>
  )
}
