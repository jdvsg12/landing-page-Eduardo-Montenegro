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
import { sectionHeadingClassName } from "@/components/section-heading"

const GAP = 24
const COVER_CLASS = "relative h-[16.5rem] overflow-hidden bg-sage sm:h-[18rem] lg:h-[24rem]"
/** En modo de 1 columna la portada crece para llenar el alto disponible, en vez de quedar chica y suelta. */
const COVER_CLASS_STRETCH = "relative min-h-0 flex-1 overflow-hidden bg-sage"
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

    if (services.length === 0 && talleres.length === 0) {
        return (
            <div className="px-6 py-16 lg:px-10">
                <h2 className={sectionHeadingClassName("white")}>{heading}</h2>
            </div>
        )
    }

    if (reduceMotion) {
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
            <Heading className={sectionHeadingClassName("white", "max-w-[12ch]")}>
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
    const visibleCards = useVisibleCards()

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

    const cardW = viewportW > 0 ? (viewportW - GAP * (visibleCards - 1)) / visibleCards : 320
    const servicesExtra = extraTravel(services.length, cardW, visibleCards)
    const talleresExtra = extraTravel(talleres.length, cardW, visibleCards)
    const sectionSlide = services.length > 0 && talleres.length > 0 ? viewportW : 0
    const totalTravel = servicesExtra + sectionSlide + talleresExtra
    const pinVh =
        viewportW > 0 && totalTravel > 0
            ? 1 + (totalTravel / viewportW) * 1.15
            : estimatedPinVh(services.length, talleres.length, visibleCards)

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
            <div className="sticky top-20 flex h-[calc(100svh-5rem)] flex-col overflow-hidden px-6 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-8 lg:pb-12 lg:pt-10">
                <motion.div className="absolute inset-0 origin-center" style={{ scale: fieldScale }}>
                    <OrbitalField />
                </motion.div>

                <h2 className={sectionHeadingClassName("white", "relative shrink-0")}>
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
                            <Scene width={viewportW} stretch={visibleCards === 1}>
                                <motion.div
                                    className={`w-full ${visibleCards === 1 ? "h-full" : ""}`}
                                    style={{ transform: xServices }}
                                >
                                    <CardStrip count={services.length} cardWidth={cardW} visibleCards={visibleCards}>
                                        {services.map((service, index) => (
                                            <li
                                                key={service.id}
                                                id={`svc-${service.slug}`}
                                                className={`shrink-0 ${visibleCards === 1 ? "h-full" : ""}`}
                                                style={{ width: cardW }}
                                            >
                                                <ServicePinCard
                                                    service={service}
                                                    language={language}
                                                    index={index}
                                                    progress={scrollYProgress}
                                                    stretch={visibleCards === 1}
                                                />
                                            </li>
                                        ))}
                                    </CardStrip>
                                </motion.div>
                            </Scene>
                        ) : null}

                        {talleres.length > 0 ? (
                            <Scene width={viewportW} stretch={visibleCards === 1}>
                                <motion.div
                                    className={`w-full ${visibleCards === 1 ? "h-full" : ""}`}
                                    style={{ transform: xTalleres }}
                                >
                                    <CardStrip count={talleres.length} cardWidth={cardW} visibleCards={visibleCards}>
                                        {talleres.map((taller) => (
                                            <li
                                                key={taller.id}
                                                className={`shrink-0 ${visibleCards === 1 ? "h-full" : ""}`}
                                                style={{ width: cardW }}
                                            >
                                                <TallerPinCard
                                                    taller={taller}
                                                    language={language}
                                                    stretch={visibleCards === 1}
                                                />
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

function Scene({ width, stretch, children }: { width: number; stretch?: boolean; children: ReactNode }) {
    return (
        <div
            className={`flex h-full w-full shrink-0 ${stretch ? "items-stretch" : "items-center"}`}
            style={{ width: width || "100%", minWidth: width || "100%" }}
        >
            <div className={`w-full ${stretch ? "h-full" : ""}`}>{children}</div>
        </div>
    )
}

function CardStrip({
    count,
    cardWidth,
    visibleCards,
    children,
}: {
    count: number
    cardWidth: number
    visibleCards: number
    children: ReactNode
}) {
    const centered = count <= visibleCards
    const width = count * cardWidth + Math.max(0, count - 1) * GAP
    const stretch = visibleCards === 1

    return (
        <ul
            className={`flex gap-6 ${stretch ? "h-full" : ""} ${centered ? "w-full justify-center" : ""}`}
            style={centered ? undefined : { width }}
        >
            {children}
        </ul>
    )
}

function ServicePinCard({
    service,
    language,
    index,
    progress,
    stretch,
}: {
    service: Service
    language: Language
    index: number
    progress?: MotionValue<number>
    stretch?: boolean
}) {
    const title = pickLocale(service.title, language)
    const kicker = pickLocale(service.kicker, language)
    const cardImage = service.cardImage || service.coverImage

    return (
        <Link
            href={`/servicios/${service.slug}`}
            className="block h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
            <article className="flex h-full flex-col bg-sage-deep p-5 text-white">
                <div className={stretch ? COVER_CLASS_STRETCH : COVER_CLASS}>
                    {cardImage ? (
                        progress ? (
                            <ParallaxCover src={cardImage} alt={title} index={index} progress={progress} />
                        ) : (
                            <MediaImage src={cardImage} alt={title} sizes={CARD_IMAGE_SIZES} />
                        )
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-sage to-sage-deep" />
                    )}
                </div>
                <h3 className="mt-5 line-clamp-2 font-serif text-[1.45rem] font-light italic leading-[1.15] text-white lg:text-[1.65rem]">
                    {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{kicker || "—"}</p>
            </article>
        </Link>
    )
}

function TallerPinCard({
    taller,
    language,
    stretch,
}: {
    taller: Taller
    language: Language
    stretch?: boolean
}) {
    const subtitle = [formatTallerDate(taller.date, language), taller.cost].filter(Boolean).join(" · ")

    return (
        <Link
            href={`/talleres/${taller.slug}`}
            className="block h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
            <article className="flex h-full flex-col bg-sage-deep p-5 text-white">
                <div className={stretch ? COVER_CLASS_STRETCH : COVER_CLASS}>
                    {taller.coverImage ? (
                        <MediaImage src={taller.coverImage} alt={taller.title} sizes={CARD_IMAGE_SIZES} />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-sage to-sage-deep" />
                    )}
                </div>
                <h3 className="mt-5 line-clamp-2 font-serif text-[1.45rem] font-light italic leading-[1.15] text-white lg:text-[1.65rem]">
                    {taller.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{subtitle}</p>
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

function extraTravel(count: number, cardW: number, visibleCards: number) {
    if (count <= visibleCards) return 0
    return (count - visibleCards) * (cardW + GAP)
}

function estimatedPinVh(serviceCount: number, tallerCount: number, visibleCards: number) {
    const panes = (serviceCount > 0 ? 1 : 0) + (tallerCount > 0 ? 1 : 0)
    const extra = Math.max(0, serviceCount - visibleCards) + Math.max(0, tallerCount - visibleCards)
    return Math.max(1, panes + extra * 0.45)
}

/** 1 tarjeta a la vez en mobile/tablet, 3 desde `lg` — el mismo umbral que el navbar. */
function useVisibleCards() {
    const [visible, setVisible] = useState(3)

    useEffect(() => {
        const media = window.matchMedia("(min-width: 1024px)")
        const update = () => setVisible(media.matches ? 3 : 1)
        update()
        media.addEventListener("change", update)
        return () => media.removeEventListener("change", update)
    }, [])

    return visible
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
            className="pointer-events-none absolute inset-0 h-full w-full text-white/50"
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
