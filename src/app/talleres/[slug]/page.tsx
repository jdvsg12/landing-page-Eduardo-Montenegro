import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getAllTalleres, getTallerBySlug } from "@/lib/db-talleres"
import type { Taller } from "@/lib/talleres"

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

function formatDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function TallerContent({ taller }: { taller: Taller }) {
  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[45vh] items-center bg-[#8F958B]"
      >
        {taller.coverImage && (
          <>
            <img
              src={taller.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-20">
          <span className="mb-4 inline-block text-xs font-medium uppercase tracking-widest text-white/80">
            TALLER
          </span>
          <h1 className="mb-6 text-3xl font-light text-white md:text-5xl">
            {taller.title}
          </h1>
          <div className="flex flex-wrap gap-3">
            <span className="inline-block bg-white/15 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {formatDate(taller.date)}
            </span>
            <span className="inline-block bg-white/15 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {taller.cost}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="border-l-2 border-neutral-300 pl-6 text-xl leading-relaxed text-neutral-700">
          {taller.excerpt}
        </p>

        <div className="mt-12 space-y-6">
          {taller.blocks.map((block, index) =>
            block.type === "heading" ? (
              <h2
                key={index}
                className="text-2xl font-medium text-neutral-900"
              >
                {block.content}
              </h2>
            ) : (
              <p
                key={index}
                className="whitespace-pre-line text-base leading-relaxed text-neutral-600"
              >
                {block.content}
              </p>
            )
          )}
        </div>

        {taller.images.length > 0 && (
          <div className="mt-16 grid grid-cols-2 gap-4">
            {taller.images.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={img.alt ?? ""}
                className="w-full object-cover"
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-neutral-50 p-8">
          <p className="mb-4 text-lg font-medium text-neutral-900">
            ¿Te interesa este taller?
          </p>
          <p className="mb-6 text-sm text-neutral-500">
            Escríbeme por WhatsApp para más información o para reservar tu cupo.
          </p>
          <a
            href={`https://wa.me/573142793431?text=${encodeURIComponent(`Hola, me interesa el taller "${taller.title}". Quisiera más información.`)}`}
            target="_blank"
            className="inline-block bg-green-500 px-8 py-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-600"
          >
            Contactar por WhatsApp
          </a>
        </div>

        <div className="mt-12">
          <Link
            href="/#services"
            className="text-sm text-neutral-500 transition-colors duration-200 hover:text-neutral-900"
          >
            ← Volver a servicios
          </Link>
        </div>
      </section>
    </>
  )
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

  return <TallerContent taller={taller} />
}
