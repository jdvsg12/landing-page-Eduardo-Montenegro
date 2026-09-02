"use client"

import { ServiceTabs } from "@/components/services/service-tabs"
import { TallerCard } from "@/components/ui/taller-card"
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
    const hasTalleres = talleres.length > 0

    return (
        <section
            id="services"
            className="relative bg-surface px-6 pb-28 pt-6 lg:px-8"
        >
            <div className="mx-auto w-full max-w-7xl">
                <ServiceTabs
                    services={services}
                    language={language}
                    ctaLabel={t.services.viewService}
                    heading={
                        <h2 className="font-serif text-5xl font-light italic text-neutral-900 md:text-7xl">
                            {t.services.title}
                        </h2>
                    }
                />

                {loadError && (
                    <p role="status" className="mt-8 max-w-xl text-neutral-800">
                        {t.services.loadError}
                    </p>
                )}

                {!loadError && services.length === 0 && (
                    <p className="mt-8 max-w-xl text-neutral-800">{t.services.empty}</p>
                )}

                {hasTalleres && (
                    <>
                        <div className="mt-32 border-t border-neutral-400 pt-16" />

                        <h3 className="mb-12 font-serif text-3xl font-light italic text-neutral-900">
                            {t.talleres.title}
                        </h3>

                        <div className="grid gap-8 md:grid-cols-3">
                            {talleres.map((taller) => (
                                <TallerCard key={taller.id} taller={taller} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
