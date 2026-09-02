import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getAllTalleres, getTallerBySlug } from "@/lib/db-talleres"
import { TallerDetail } from "@/components/talleres/TallerDetail"

export async function generateStaticParams() {
  const talleres = await getAllTalleres()
  return talleres.map((taller) => ({ slug: taller.slug }))
}

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

  return <TallerDetail taller={taller} />
}
