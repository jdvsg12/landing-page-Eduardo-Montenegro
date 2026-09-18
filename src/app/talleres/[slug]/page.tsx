import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTallerBySlug } from "@/lib/db-talleres"
import { getSession } from "@/lib/auth"
import { TallerDetail } from "@/components/talleres/TallerDetail"
import { PrivatePreviewBanner } from "@/components/private-preview-banner"

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
  const taller = await getTallerBySlug(slug)

  if (!taller) return {}

  return {
    title: `${taller.title} | Eduardo Montenegro`,
    description: taller.excerpt,
    robots: taller.published ? undefined : { index: false, follow: false },
  }
}

export default async function TallerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const taller = await getTallerBySlug(slug)

  if (!taller) {
    notFound()
  }

  const isPrivatePreview = !taller.published
  if (isPrivatePreview && !(await getSession())) {
    notFound()
  }

  return (
    <>
      <TallerDetail taller={taller} />
      {isPrivatePreview && <PrivatePreviewBanner editHref={`/admin/talleres/${taller.slug}/editar`} />}
    </>
  )
}
