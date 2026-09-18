"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { pickLocale } from "@/lib/i18n-field"
import type { HeroContent } from "@/lib/site-content"
import { MediaImage } from "@/components/media-image"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

export function HeroBanner({ content }: { content: HeroContent }) {
    const { language } = useLanguage()
    const title = pickLocale(content.title, language)
    const subtitle = pickLocale(content.subtitle, language)
    const imageAlt = pickLocale(content.imageAlt, language)
    const marquee = pickLocale(content.marquee, language)
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
        <section id="hero" className="sticky top-0 z-0 h-dvh overflow-x-clip overflow-y-hidden bg-sage">
            <div
                className="absolute inset-0"
                style={reduceMotion ? undefined : { clipPath }}
            >
                <div className="absolute inset-0 lg:hidden">
                    <MediaImage
                        src={content.image}
                        alt={imageAlt}
                        className="object-center"
                        sizes="(max-width: 1023px) 100vw, 1px"
                        priority
                    />
                    <div className="absolute inset-0 bg-ink/45" />
                </div>

                <div className="relative z-10 flex h-full flex-col">
                    <div className="flex flex-1 flex-col items-center justify-center px-6 pt-28 sm:pt-40 lg:flex-row lg:items-center lg:justify-center lg:gap-12 lg:px-8 lg:pt-0">
                        <div className="relative hidden h-dvh w-[min(50vw,42rem)] shrink-0 lg:block">
                            <MediaImage
                                src={content.image}
                                alt={imageAlt}
                                className="object-contain object-bottom"
                                sizes="50vw"
                                priority
                            />
                        </div>

                        <div className="clip-reveal-hero z-20 mt-[5rem] max-w-[min(100%,22rem)] px-1 text-center lg:mt-0 lg:max-w-none lg:text-left">
                            <h1 className="mb-3 text-balance text-[clamp(1.45rem,6.2vw,2.5rem)] font-medium leading-[4rem] tracking-wide text-white underline decoration-2 underline-offset-[0.4rem] md:text-[40px]">
                                {title}
                            </h1>
                            <p className="text-pretty text-base leading-snug text-white/90 sm:text-xl md:text-2xl">{subtitle}</p>
                        </div>
                    </div>

                    <div className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-0 right-0 overflow-hidden pb-6 lg:bottom-1/12 lg:pb-8">
                        <div className={reduceMotion ? "overflow-hidden" : "consultorio-marquee-mask"}>
                            <div className={reduceMotion ? "" : "consultorio-marquee"}>
                                <HeroMarqueeCopy text={marquee} />
                                {reduceMotion ? null : <HeroMarqueeCopy text={marquee} hidden />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function HeroMarqueeCopy({ text, hidden = false }: { text: string; hidden?: boolean }) {
    return (
        <span
            aria-hidden={hidden || undefined}
            className="flex shrink-0 items-center"
        >
            <span className="px-4 text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-9xl">
                {text}
            </span>
            <span className="px-4 text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-9xl">—</span>
        </span>
    )
}
