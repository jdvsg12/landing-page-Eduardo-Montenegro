import { notFound } from "next/navigation"
import { getTallerBySlug } from "@/lib/db-talleres"
import { TallerForm } from "@/components/admin/TallerForm"

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
    <div className="min-h-screen bg-[#f5f5f0]">
      <header className="bg-[#1a1a1a] px-6 py-4 text-white">
        <h1 className="text-lg font-light">Eduardo Montenegro</h1>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="mb-1 text-2xl font-light text-neutral-900">Editar taller</h2>
        <p className="mb-8 font-mono text-sm text-neutral-400">/talleres/{slug}</p>
        <TallerForm mode="edit" initialData={taller} />
      </main>
    </div>
  )
}
