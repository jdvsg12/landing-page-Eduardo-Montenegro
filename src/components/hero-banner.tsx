"use client"

import { ScrollVelocityRow } from "@/registry/magicui/scroll-based-velocity"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { MediaImage } from "@/components/media-image"

export function HeroBanner() {
    const { language } = useLanguage()
    const t = getTranslation(language)

    return (
        <section className="sticky top-0 z-0 h-screen overflow-hidden bg-sage">
            <div className="absolute inset-0 lg:hidden">
                <MediaImage
                    src="/images/profile.png"
                    alt={t.hero.portraitAlt}
                    className="object-center"
                    sizes="(max-width: 1023px) 100vw, 1px"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 flex h-full flex-col">
                <div className="flex flex-1 flex-col items-center justify-center px-6 pt-48 lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-8 lg:pt-0">
                    <div className="relative mb-8 hidden lg:mb-0 lg:block">
                        <div className="relative hidden overflow-hidden lg:inline-block lg:h-dvh lg:w-10/12">
                            <MediaImage
                                src="/images/profile.png"
                                alt={t.hero.portraitAlt}
                                className="object-contain object-bottom"
                                sizes="45vw"
                                priority
                            />
                        </div>
                    </div>

                    <div className="clip-reveal-hero z-20 text-center lg:text-left">
                        <h1 className="mb-3 text-[32px] font-medium tracking-wide text-white underline underline-offset-8 md:text-[40px]">
                            {t.hero.title}
                        </h1>
                        <p className="text-xl text-white md:text-2xl">{t.hero.subtitle}</p>
                    </div>
                </div>

                <div className="absolute bottom-1/12 left-0 right-0 pb-8 lg:bottom-1/12">
                    <ScrollVelocityRow baseVelocity={4} direction={-1}>
                        <span className="mx-4 text-7xl font-bold tracking-tight text-white lg:text-9xl">EDUARDO MONTENEGRO</span>
                        <span className="mx-4 text-7xl font-bold tracking-tight text-white lg:text-9xl">—</span>
                    </ScrollVelocityRow>
                </div>
            </div>
        </section>
    )
}
