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

    // Sin `scroll-mt-20`: cada grupo ya reserva el navbar con su `pt-19`; sumar los dos
    // dejaba ~80px de más sobre el título al llegar por el ancla #services.
    return (
        <section id="services" className="relative bg-sage">
            <ServiceCards
                services={services}
                talleres={talleres}
                language={language}
                ctaLabel={t.services.viewService}
                talleresCtaLabel={t.talleres.viewTaller}
                heading={t.services.title}
                talleresHeading={t.talleres.title}
                serviceBadge={t.services.badge}
                tallerBadge={t.talleres.badge}
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
