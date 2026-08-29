import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { translations } from "@/lib/translations"

type Service = (typeof translations.es.services.items)[number]

function getService(slug: string): Service | undefined {
  return translations.es.services.items.find((service) => service.slug === slug)
}

export async function generateStaticParams() {
  return translations.es.services.items.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = getService(slug)
  return service ? { title: `${service.title} | Eduardo Montenegro`, description: service.subtitle } : {}
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) notFound()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative flex min-h-[58vh] items-end overflow-hidden">
        <Image src={service.image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-foreground/45" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 lg:px-8">
          <Link href="/#services" className="mb-16 inline-block font-mono text-xs uppercase tracking-[0.2em] text-background/80 transition hover:text-background">← Volver a servicios</Link>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-background/70">Servicio</p>
          <h1 className="max-w-4xl font-serif text-5xl font-light leading-tight text-background md:text-7xl">{service.title}</h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1fr_2fr] lg:px-8 lg:py-32">
        <p className="max-w-xs text-xl leading-relaxed text-muted-foreground">{service.subtitle}</p>
        <div>
          <div className="flex flex-col gap-6 text-base leading-relaxed text-muted-foreground">
            {service.description.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          <div className="mt-16 border-t border-border pt-8">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">¿Quieres conversar?</p>
            <a href={`https://wa.me/${service.whatsapp?.replace(/\D/g, "")}?text=${encodeURIComponent(service.message || "Hola, quisiera más información")}`} target="_blank" rel="noreferrer" className="inline-block bg-primary px-7 py-4 text-sm text-primary-foreground transition-opacity hover:opacity-80">Contactar por WhatsApp ↗</a>
          </div>
        </div>
      </section>
    </main>
  )
}
