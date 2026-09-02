"use client"

import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"

export function AboutSection() {
    const { language } = useLanguage()
    const t = getTranslation(language)

    return (
        <section id="about" className="relative scroll-mt-20 bg-paper py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid items-start gap-8 lg:grid-cols-[2fr_1fr] lg:gap-12">
                    <h2 className="order-1 text-right font-serif lg:order-2">
                        <span className="text-6xl font-bold text-sage-ink lg:text-8xl">
                            {t.about.title}
                        </span>
                    </h2>

                    <div className="thin-scrollbar order-2 max-h-[60vh] overflow-y-auto pr-4 lg:order-1">
                        <div className="mb-12">
                            <p className="whitespace-pre-line text-lg leading-relaxed text-neutral-700">
                                {t.about.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold text-foreground">
                                {t.profile.title}
                            </h3>
                            <p className="whitespace-pre-line text-lg leading-relaxed text-neutral-700">
                                {t.profile.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
