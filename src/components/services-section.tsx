"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ServiceCard } from "@/components/ui/service-card"
import { TallerCard } from "@/components/ui/taller-card"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import type { Taller } from "@/lib/talleres"

export function ServicesSection() {
  const { language } = useLanguage()
  const t = getTranslation(language) as any
  const [talleres, setTalleres] = useState<Taller[]>([])

  useEffect(() => {
    fetch("/api/talleres").then((res) => res.json()).then(setTalleres).catch(() => setTalleres([]))
  }, [])

  return (
    <section id="services" className="relative z-20 bg-muted px-6 py-24 shadow-[0_-20px_60px_rgba(0,0,0,0.12)] lg:px-8 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 flex flex-col gap-8 md:flex-row md:items-end md:justify-between lg:mb-28">
          <div>
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">03 / {t.services.indexLabel || "Prácticas"}</p>
            <h2 className="font-serif text-5xl font-light italic text-foreground md:text-7xl">{t.services.title}</h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">{t.services.intro || "Cada práctica tiene su propio tiempo, encuadre y espacio de trabajo."}</p>
        </div>

        <div className="flex flex-col gap-6">
          {t.services.items.map((service: any, index: number) => (
            <ServiceCard key={service.slug || index} title={service.title} subtitle={service.subtitle} image={service.image} slug={service.slug} index={index} exploreText={t.services.explore || "Explorar servicio"} />
          ))}
        </div>

        {talleres.length > 0 && (
          <div className="mt-32 border-t border-border pt-16">
            <h3 className="mb-12 font-serif text-4xl font-light italic text-foreground">Talleres</h3>
            <div className="grid gap-8 md:grid-cols-3">{talleres.map((taller, index) => <TallerCard key={taller.id} taller={taller} index={index} />)}</div>
          </div>
        )}
      </div>
    </section>
  )
}
