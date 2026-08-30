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
        <div className="sticky top-16 z-30 -mx-6 mb-12 flex flex-col gap-4 bg-muted/95 px-6 py-6 backdrop-blur-sm md:mb-16 md:flex-row md:items-end md:justify-between lg:-mx-8 lg:px-8 lg:py-8">
          <h2 className="font-serif text-5xl font-light italic text-foreground md:text-7xl">{t.services.title}</h2>
        </div>

        <div className="flex flex-col gap-6">
          {t.services.items.map((service: any, index: number) => (
            <ServiceCard key={service.slug || index} title={service.title} subtitle={service.subtitle} image={service.image} slug={service.slug} />
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
