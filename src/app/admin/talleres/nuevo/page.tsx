import { TallerForm } from "@/components/admin/TallerForm"

export default function NuevoTallerPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <header className="bg-[#1a1a1a] px-6 py-4 text-white">
        <h1 className="text-lg font-light">Eduardo Montenegro</h1>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="mb-8 text-2xl font-light text-neutral-900">Nuevo taller</h2>
        <TallerForm mode="create" />
      </main>
    </div>
  )
}
