"use client"

import { ServiceCards } from "@/components/services/service-cards"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import type { Service } from "@/lib/services"
import type { Taller } from "@/lib/talleres"

export function ServicesSection({
    services,
    talleres,
    loadError,
}: {
    services: Service[]
    talleres: Taller[]
    loadError: boolean
}) {
    const { language } = useLanguage()
    const t = getTranslation(language)

    return (
        <section id="services" className="relative scroll-mt-20 bg-sage-deep">
            <ServiceCards
                services={services}
                talleres={talleres}
                language={language}
                ctaLabel={t.services.viewService}
                heading={t.services.title}
                talleresHeading={t.talleres.title}
            />

            {(loadError || services.length === 0) && (
                <div className="relative px-6 pb-16 lg:px-10">
                    {loadError && (
                        <p role="status" className="max-w-xl text-white/80">
                            {t.services.loadError}
                        </p>
                    )}

                    {!loadError && services.length === 0 && (
                        <p className="max-w-xl text-white/80">{t.services.empty}</p>
                    )}
                </div>
            )}
        </section>
    )
}
