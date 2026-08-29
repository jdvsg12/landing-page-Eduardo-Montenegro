"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { ServiceTabs } from "@/components/services/service-tabs"
import { TallerCard } from "@/components/ui/taller-card"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import type { Service } from "@/lib/services"
import type { Taller } from "@/lib/talleres"

export function ServicesSection() {
  const { language } = useLanguage()
  const t = getTranslation(language)

  const [services, setServices] = useState<Service[]>([])
  const [talleres, setTalleres] = useState<Taller[]>([])

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(console.error)

    fetch("/api/talleres")
      .then((res) => res.json())
      .then((data) => setTalleres(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  const hasTalleres = talleres.length > 0

  return (
    <section
      id="services"
      className="relative z-20 bg-[#D9D9D9] pb-28 shadow-[0_-20px_60px_rgba(0,0,0,0.15)]"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <ServiceTabs
          services={services}
          language={language}
          ctaLabel={t.services.viewService}
          heading={
            <h2 className="mb-6 font-serif text-4xl font-light italic text-neutral-900 lg:text-5xl">
              {t.services.title}
            </h2>
          }
        />

        {hasTalleres && (
          <>
            <div className="mb-10 mt-20 border-t border-neutral-400" />

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 font-serif text-3xl font-light italic text-neutral-900"
            >
              Talleres
            </motion.h3>

            <div className="grid gap-8 md:grid-cols-3">
              {talleres.map((taller, index) => (
                <TallerCard key={taller.id} taller={taller} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
