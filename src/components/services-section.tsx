"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { ServiceCard } from "@/components/ui/service-card"
import { TallerCard } from "@/components/ui/taller-card"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import type { Taller } from "@/lib/talleres"

interface ServiceItem {
  title: string
  description: string
  whatsapp?: string
  message?: string
}

interface ServicesTranslations {
  title: string
  items: ServiceItem[]
  seeMore?: string
  seeLess?: string
  contactWhatsApp?: string
}

interface Translations {
  services: ServicesTranslations
}

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const { language } = useLanguage()
  const t = getTranslation(language) as Translations

  const contentY = useTransform(scrollYProgress, [0, 0.5, 1], ["15%", "0%", "-15%"])

  const [talleres, setTalleres] = useState<Taller[]>([])

  useEffect(() => {
    fetch("/api/talleres")
      .then((res) => res.json())
      .then(setTalleres)
      .catch(console.error)
  }, [])

  const hasTalleres = talleres.length > 0

  return (
    <section
      ref={sectionRef}
      id="services"
      className={`relative z-20 bg-[#D9D9D9] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] ${
        hasTalleres ? "min-h-[175vh]" : "min-h-[150vh]"
      }`}
    >
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden py-20">
        <motion.div style={{ y: contentY }} className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 font-serif text-4xl font-light italic text-neutral-900 lg:text-5xl"
          >
            {t.services.title}
          </motion.h2>

          <div className="grid gap-8 md:grid-cols-3 whitespace-pre-line">
            {t.services.items.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                index={index}
                whatsapp={service.whatsapp}
                message={service.message}
                buttonText={t.services.contactWhatsApp}
                seeMoreText={t.services.seeMore}
                seeLessText={t.services.seeLess}
              />
            ))}
          </div>

          {hasTalleres && (
            <>
              <div className="mb-10 mt-16 border-t border-neutral-400" />

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
        </motion.div>
      </div>
    </section>
  )
}
