import { ServiceForm } from "@/components/admin/ServiceForm"

export default function NuevoServicioPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <header className="bg-[#1a1a1a] px-6 py-4 text-white">
        <h1 className="text-lg font-light">Eduardo Montenegro</h1>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="mb-8 text-2xl font-light text-neutral-900">Nuevo servicio</h2>
        <ServiceForm mode="create" />
      </main>
    </div>
  )
}
