"use client"

import { useEffect, useState } from "react"
import { ScrollVelocityRow } from "@/registry/magicui/scroll-based-velocity"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { MediaImage } from "@/components/media-image"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

export function HeroBanner() {
    const { language } = useLanguage()
    const t = getTranslation(language)
    const reduceMotion = usePrefersReducedMotion()
    const [clipPath, setClipPath] = useState("inset(0 0 0 0)")

    useEffect(() => {
        if (reduceMotion) {
            setClipPath("inset(0 0 0 0)")
            return
        }

        let frame = 0
        const sync = () => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => {
                const h = window.innerHeight || 1
                const p = Math.min(1, Math.max(0, window.scrollY / h))
                setClipPath(`inset(0 0 ${p * 100}% 0)`)
            })
        }

        sync()
        window.addEventListener("scroll", sync, { passive: true })
        window.addEventListener("resize", sync, { passive: true })
        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener("scroll", sync)
            window.removeEventListener("resize", sync)
        }
    }, [reduceMotion])

    return (
        <section id="hero" className="sticky top-0 z-0 h-screen overflow-hidden bg-sage">
            <div
                className="absolute inset-0"
                style={reduceMotion ? undefined : { clipPath }}
            >
                <div className="absolute inset-0 lg:hidden">
                    <MediaImage
                        src="/images/profile.png"
                        alt={t.hero.portraitAlt}
                        className="object-center"
                        sizes="(max-width: 1023px) 100vw, 1px"
                        priority
                    />
                    <div className="absolute inset-0 bg-ink/45" />
                </div>

                <div className="relative z-10 flex h-full flex-col">
                    <div className="flex flex-1 flex-col items-center justify-center px-6 pt-48 lg:flex-row lg:items-center lg:justify-center lg:gap-12 lg:px-8 lg:pt-0">
                        <div className="relative hidden h-dvh w-[min(50vw,42rem)] shrink-0 lg:block">
                            <MediaImage
                                src="/images/profile.png"
                                alt={t.hero.portraitAlt}
                                className="object-contain object-bottom"
                                sizes="50vw"
                                priority
                            />
                        </div>

                        <div className="clip-reveal-hero z-20 text-center lg:text-left">
                            <h1 className="mb-3 text-[32px] font-medium tracking-wide text-white underline underline-offset-8 md:text-[40px]">
                                {t.hero.title}
                            </h1>
                            <p className="text-xl text-white/90 md:text-2xl">{t.hero.subtitle}</p>
                        </div>
                    </div>

                    <div className="absolute bottom-1/12 left-0 right-0 pb-8 lg:bottom-1/12">
                        <ScrollVelocityRow baseVelocity={4} direction={-1}>
                            <span className="mx-4 text-7xl font-bold tracking-tight text-white lg:text-9xl">EDUARDO MONTENEGRO</span>
                            <span className="mx-4 text-7xl font-bold tracking-tight text-white lg:text-9xl">—</span>
                        </ScrollVelocityRow>
                    </div>
                </div>
            </div>
        </section>
    )
}
