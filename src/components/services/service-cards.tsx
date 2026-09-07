"use client"

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"
import { pickLocale } from "@/lib/i18n-field"
import { dateLocale } from "@/lib/language"
import type { Service } from "@/lib/services"
import type { Taller } from "@/lib/talleres"
import type { Language } from "@/lib/translations"
import { MediaImage } from "@/components/media-image"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

const VISIBLE_CARDS = 3
const GAP = 24
const COVER_CLASS = "relative h-[16.5rem] overflow-hidden bg-sage sm:h-[18rem] lg:h-[24rem]"
const CARD_IMAGE_SIZES = "(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 90vw"
const EASE_CONSULTORIO: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function ServiceCards({
    services,
    talleres,
    language,
    heading,
    talleresHeading,
}: {
    services: Service[]
    talleres: Taller[]
    language: Language
    ctaLabel: string
    heading: string
    talleresHeading: string
}) {
    const reduceMotion = usePrefersReducedMotion()
    const desktop = useDesktopPin()

    if (services.length === 0 && talleres.length === 0) {
        return (
            <div className="px-6 py-16 lg:px-10">
                <h2 className="font-serif text-5xl font-light italic text-white md:text-7xl">{heading}</h2>
            </div>
        )
    }

    if (reduceMotion || !desktop) {
        return (
            <StackedCatalog
                services={services}
                talleres={talleres}
                language={language}
                heading={heading}
                talleresHeading={talleresHeading}
                reduceMotion={reduceMotion}
            />
        )
    }

    return (
        <PinnedTrack
            services={services}
            talleres={talleres}
            language={language}
            heading={heading}
            talleresHeading={talleresHeading}
        />
    )
}

function StackedCatalog({
    services,
    talleres,
    language,
    heading,
    talleresHeading,
    reduceMotion,
}: {
    services: Service[]
    talleres: Taller[]
    language: Language
    heading: string
    talleresHeading: string
    reduceMotion: boolean
}) {
    return (
        <div className="relative overflow-x-clip px-6 py-16 sm:py-20 lg:px-10">
            <div className="pointer-events-none absolute inset-0 opacity-80">
                <OrbitalField />
            </div>

            {services.length > 0 ? (
                <StackedBlock title={heading} heading="h2">
                    {services.map((service, index) => (
                        <StackedItem key={service.id} index={index} reduceMotion={reduceMotion}>
                            <ServicePinCard service={service} language={language} index={index} />
                        </StackedItem>
                    ))}
                </StackedBlock>
            ) : null}

            {talleres.length > 0 ? (
                <StackedBlock title={talleresHeading} heading="h3" spaced={services.length > 0}>
                    {talleres.map((taller, index) => (
                        <StackedItem key={taller.id} index={index} reduceMotion={reduceMotion}>
                            <TallerPinCard taller={taller} language={language} />
                        </StackedItem>
                    ))}
                </StackedBlock>
            ) : null}
        </div>
    )
}

function StackedBlock({
    title,
    heading: Heading,
    spaced,
    children,
}: {
    title: string
    heading: "h2" | "h3"
    spaced?: boolean
    children: ReactNode
}) {
    return (
        <div className={`relative ${spaced ? "mt-16 sm:mt-20" : ""}`}>
            <Heading className="max-w-[12ch] font-serif text-[clamp(2.75rem,14vw,4.5rem)] font-light italic leading-[0.95] text-white">
                {title}
            </Heading>
            <ul className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-2">{children}</ul>
        </div>
    )
}

function StackedItem({
    index,
    reduceMotion,
    children,
}: {
    index: number
    reduceMotion: boolean
    children: ReactNode
}) {
    if (reduceMotion) {
        return <li className="min-w-0">{children}</li>
    }

    return (
        <motion.li
            className="min-w-0"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: Math.min(index, 2) * 0.08, ease: EASE_CONSULTORIO }}
        >
            {children}
        </motion.li>
    )
}

function PinnedTrack({
    services,
    talleres,
    language,
    heading,
    talleresHeading,
}: {
    services: Service[]
    talleres: Taller[]
    language: Language
    heading: string
    talleresHeading: string
}) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const viewportRef = useRef<HTMLDivElement>(null)
    const [viewportW, setViewportW] = useState(0)

    useLayoutEffect(() => {
        const viewport = viewportRef.current
        if (!viewport) return

        const measure = () => setViewportW(viewport.clientWidth)
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(viewport)
        window.addEventListener("resize", measure)
        return () => {
            observer.disconnect()
            window.removeEventListener("resize", measure)
        }
    }, [services.length, talleres.length])

    const cardW = viewportW > 0 ? (viewportW - GAP * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS : 320
    const servicesExtra = extraTravel(services.length, cardW)
    const talleresExtra = extraTravel(talleres.length, cardW)
    const sectionSlide = services.length > 0 && talleres.length > 0 ? viewportW : 0
    const totalTravel = servicesExtra + sectionSlide + talleresExtra
    const pinVh =
        viewportW > 0 && totalTravel > 0 ? 1 + (totalTravel / viewportW) * 1.15 : estimatedPinVh(services.length, talleres.length)

    const { scrollYProgress } = useScroll({
        target: wrapRef,
        offset: ["start start", "end end"],
    })

    const xSection = useTransform(scrollYProgress, (value) => {
        const point = value * totalTravel
        const shift = Math.min(sectionSlide, Math.max(0, point - servicesExtra))
        return `translate3d(${-shift}px, 0, 0)`
    })
    const xServices = useTransform(scrollYProgress, (value) => {
        const point = value * totalTravel
        return `translate3d(${-Math.min(servicesExtra, Math.max(0, point))}px, 0, 0)`
    })
    const xTalleres = useTransform(scrollYProgress, (value) => {
        const point = value * totalTravel
        const start = servicesExtra + sectionSlide
        return `translate3d(${-Math.min(talleresExtra, Math.max(0, point - start))}px, 0, 0)`
    })
    const fieldScale = useTransform(scrollYProgress, [0, 1], [1.05, 1])

    const headingOpacityServices = useTransform(scrollYProgress, (value) => {
        if (sectionSlide <= 0) return services.length > 0 ? 1 : 0
        const point = value * totalTravel
        const start = servicesExtra
        const end = servicesExtra + sectionSlide
        if (point <= start) return 1
        if (point >= end) return 0
        return 1 - (point - start) / sectionSlide
    })
    const headingOpacityTalleres = useTransform(scrollYProgress, (value) => {
        if (sectionSlide <= 0) return services.length === 0 && talleres.length > 0 ? 1 : 0
        const point = value * totalTravel
        const start = servicesExtra
        const end = servicesExtra + sectionSlide
        if (point <= start) return 0
        if (point >= end) return 1
        return (point - start) / sectionSlide
    })

    return (
        <div ref={wrapRef} className="relative" style={{ height: `calc(${pinVh} * 100vh)` }}>
            <div className="sticky top-0 flex h-svh flex-col overflow-hidden px-10 pb-10 pt-20 lg:pb-12 lg:pt-24">
                <motion.div className="absolute inset-0 origin-center" style={{ scale: fieldScale }}>
                    <OrbitalField />
                </motion.div>

                <h2 className="relative shrink-0 font-serif text-4xl font-light italic text-white sm:text-5xl lg:text-6xl">
                    <span className="sr-only">
                        {heading}. {talleresHeading}
                    </span>
                    <span className="grid">
                        <motion.span
                            aria-hidden
                            className="col-start-1 row-start-1"
                            style={{ opacity: headingOpacityServices }}
                        >
                            {heading}
                        </motion.span>
                        <motion.span
                            aria-hidden
                            className="col-start-1 row-start-1"
                            style={{ opacity: headingOpacityTalleres }}
                        >
                            {talleresHeading}
                        </motion.span>
                    </span>
                </h2>

                <div ref={viewportRef} className="relative mt-8 min-h-0 flex-1 overflow-hidden">
                    <motion.div className="flex h-full" style={{ transform: xSection }}>
                        {services.length > 0 ? (
                            <Scene width={viewportW}>
                                <motion.div className="w-full" style={{ transform: xServices }}>
                                    <CardStrip count={services.length} cardWidth={cardW}>
                                        {services.map((service, index) => (
                                            <li
                                                key={service.id}
                                                id={`svc-${service.slug}`}
                                                className="shrink-0"
                                                style={{ width: cardW }}
                                            >
                                                <ServicePinCard
                                                    service={service}
                                                    language={language}
                                                    index={index}
                                                    progress={scrollYProgress}
                                                />
                                            </li>
                                        ))}
                                    </CardStrip>
                                </motion.div>
                            </Scene>
                        ) : null}

                        {talleres.length > 0 ? (
                            <Scene width={viewportW}>
                                <motion.div className="w-full" style={{ transform: xTalleres }}>
                                    <CardStrip count={talleres.length} cardWidth={cardW}>
                                        {talleres.map((taller) => (
                                            <li key={taller.id} className="shrink-0" style={{ width: cardW }}>
                                                <TallerPinCard taller={taller} language={language} />
                                            </li>
                                        ))}
                                    </CardStrip>
                                </motion.div>
                            </Scene>
                        ) : null}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

function Scene({ width, children }: { width: number; children: ReactNode }) {
    return (
        <div
            className="flex h-full w-full shrink-0 items-center"
            style={{ width: width || "100%", minWidth: width || "100%" }}
        >
            <div className="w-full">{children}</div>
        </div>
    )
}

function CardStrip({
    count,
    cardWidth,
    children,
}: {
    count: number
    cardWidth: number
    children: ReactNode
}) {
    const centered = count <= VISIBLE_CARDS
    const width = count * cardWidth + Math.max(0, count - 1) * GAP

    return (
        <ul className={`flex gap-6 ${centered ? "w-full justify-center" : ""}`} style={centered ? undefined : { width }}>
            {children}
        </ul>
    )
}

function ServicePinCard({
    service,
    language,
    index,
    progress,
}: {
    service: Service
    language: Language
    index: number
    progress?: MotionValue<number>
}) {
    const title = pickLocale(service.title, language)
    const kicker = pickLocale(service.kicker, language)

    return (
        <Link
            href={`/servicios/${service.slug}`}
            className="block h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
            <article className="flex h-full flex-col bg-paper p-5 text-ink">
                <div className={COVER_CLASS}>
                    {service.coverImage ? (
                        progress ? (
                            <ParallaxCover src={service.coverImage} alt={title} index={index} progress={progress} />
                        ) : (
                            <MediaImage src={service.coverImage} alt={title} sizes={CARD_IMAGE_SIZES} />
                        )
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-sage to-sage-deep" />
                    )}
                </div>
                <h3 className="mt-5 line-clamp-2 font-serif text-[1.45rem] font-light italic leading-[1.15] text-sage-ink lg:text-[1.65rem]">
                    {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-sage-ink">{kicker || "—"}</p>
            </article>
        </Link>
    )
}

function TallerPinCard({ taller, language }: { taller: Taller; language: Language }) {
    const subtitle = [formatTallerDate(taller.date, language), taller.cost].filter(Boolean).join(" · ")

    return (
        <Link
            href={`/talleres/${taller.slug}`}
            className="block h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
            <article className="flex h-full flex-col bg-paper p-5 text-ink">
                <div className={COVER_CLASS}>
                    {taller.coverImage ? (
                        <MediaImage src={taller.coverImage} alt={taller.title} sizes={CARD_IMAGE_SIZES} />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-sage to-sage-deep" />
                    )}
                </div>
                <h3 className="mt-5 line-clamp-2 font-serif text-[1.45rem] font-light italic leading-[1.15] text-sage-ink lg:text-[1.65rem]">
                    {taller.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-sage-ink">{subtitle}</p>
            </article>
        </Link>
    )
}

function formatTallerDate(date: string, language: Language) {
    return new Date(date + "T12:00:00").toLocaleDateString(dateLocale(language), {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

function extraTravel(count: number, cardW: number) {
    if (count <= VISIBLE_CARDS) return 0
    return (count - VISIBLE_CARDS) * (cardW + GAP)
}

function estimatedPinVh(serviceCount: number, tallerCount: number) {
    const panes = (serviceCount > 0 ? 1 : 0) + (tallerCount > 0 ? 1 : 0)
    const extra = Math.max(0, serviceCount - VISIBLE_CARDS) + Math.max(0, tallerCount - VISIBLE_CARDS)
    return Math.max(1, panes + extra * 0.45)
}

function useDesktopPin() {
    const [desktop, setDesktop] = useState(false)

    useEffect(() => {
        const media = window.matchMedia("(min-width: 1280px) and (min-height: 860px)")
        const update = () => setDesktop(media.matches)
        update()
        media.addEventListener("change", update)
        return () => media.removeEventListener("change", update)
    }, [])

    return desktop
}

function ParallaxCover({
    src,
    alt,
    index,
    progress,
}: {
    src: string
    alt: string
    index: number
    progress: MotionValue<number>
}) {
    const x = useTransform(progress, [0, 1], [10 - index * 3, -16 - index * 5])

    return (
        <motion.div className="absolute inset-0" style={{ x }}>
            <MediaImage src={src} alt={alt} className="scale-110" sizes={CARD_IMAGE_SIZES} />
        </motion.div>
    )
}

function OrbitalField() {
    return (
        <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full text-sage"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
        >
            <g fill="none" stroke="currentColor" strokeWidth="1">
                <ellipse cx="720" cy="460" rx="620" ry="280" opacity="0.45" transform="rotate(-18 720 460)" />
                <ellipse cx="720" cy="460" rx="480" ry="340" opacity="0.32" transform="rotate(12 720 460)" />
                <ellipse cx="900" cy="380" rx="520" ry="220" opacity="0.28" transform="rotate(-8 900 380)" />
                <path d="M80 620 C 320 480, 640 780, 1360 340" opacity="0.35" />
                <path d="M40 240 C 420 120, 780 400, 1400 180" opacity="0.22" />
            </g>
        </svg>
    )
}
