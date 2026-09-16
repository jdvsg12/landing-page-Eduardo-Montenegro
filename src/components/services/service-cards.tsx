"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { pickLocale } from "@/lib/i18n-field"
import { dateLocale } from "@/lib/language"
import type { Service } from "@/lib/services"
import type { Taller } from "@/lib/talleres"
import type { Language } from "@/lib/translations"
import { MediaImage } from "@/components/media-image"
import { sectionHeadingClassName } from "@/components/section-heading"

/** En móvil la portada se mide contra el viewport para que la tarjeta ocupe ~60% del alto; en la grilla vuelve a alto fijo. */
const COVER_CLASS = "relative h-[38svh] overflow-hidden bg-sage lg:h-[24rem]"
const CARD_IMAGE_SIZES = "(min-width: 1024px) 30vw, (min-width: 640px) 55vw, 82vw"

/** Forma común para que Servicios y Talleres compartan exactamente la misma tarjeta. */
interface CardData {
    id: string
    href: string
    title: string
    subtitle: string
    coverImage?: string
    badge: string
    ctaLabel: string
}

export function ServiceCards({
    services,
    talleres,
    language,
    heading,
    talleresHeading,
    ctaLabel,
    talleresCtaLabel,
    serviceBadge,
    tallerBadge,
}: {
    services: Service[]
    talleres: Taller[]
    language: Language
    heading: string
    talleresHeading: string
    ctaLabel: string
    talleresCtaLabel: string
    serviceBadge: string
    tallerBadge: string
}) {
    if (services.length === 0 && talleres.length === 0) {
        return (
            <div className="px-6 py-16 lg:px-10">
                <h2 className={sectionHeadingClassName("white")}>{heading}</h2>
            </div>
        )
    }

    const serviceItems = normalizeServices(services, language, serviceBadge, ctaLabel)
    const tallerItems = normalizeTalleres(talleres, language, tallerBadge, talleresCtaLabel)

    return (
        <>
            <div className="pointer-events-none absolute inset-0 opacity-40">
                <OrbitalField />
            </div>
            <CardGroup heading={heading} items={serviceItems} />
            <CardGroup heading={talleresHeading} items={tallerItems} />
        </>
    )
}

function normalizeServices(services: Service[], language: Language, badge: string, ctaLabel: string): CardData[] {
    return services.map((service) => ({
        id: service.id,
        href: `/servicios/${service.slug}`,
        title: pickLocale(service.title, language),
        subtitle: pickLocale(service.kicker, language) || "—",
        coverImage: service.cardImage || service.coverImage,
        badge,
        ctaLabel,
    }))
}

function normalizeTalleres(talleres: Taller[], language: Language, badge: string, ctaLabel: string): CardData[] {
    return talleres.map((taller) => ({
        id: taller.id,
        href: `/talleres/${taller.slug}`,
        title: taller.title,
        subtitle: [formatTallerDate(taller.date, language), taller.cost].filter(Boolean).join(" · "),
        coverImage: taller.coverImage,
        badge,
        ctaLabel,
    }))
}

/** Título fijo (igual patrón que "Sobre mí") + tarjetas: carrusel deslizable hasta `lg`, grilla normal desde ahí. */
function CardGroup({ heading, items }: { heading: string; items: CardData[] }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const listRef = useRef<HTMLUListElement>(null)

    /** La tarjeta activa es la que queda más cerca del centro del carrusel. */
    const syncActive = () => {
        const list = listRef.current
        if (!list) return
        const listRect = list.getBoundingClientRect()
        const center = listRect.left + listRect.width / 2
        let closest = 0
        let smallest = Infinity
        Array.from(list.children).forEach((card, index) => {
            const rect = card.getBoundingClientRect()
            const distance = Math.abs(rect.left + rect.width / 2 - center)
            if (distance < smallest) {
                smallest = distance
                closest = index
            }
        })
        setActiveIndex(closest)
    }

    const goTo = (index: number) => {
        const list = listRef.current
        const card = list?.children[index] as HTMLElement | undefined
        if (!list || !card) return
        const listRect = list.getBoundingClientRect()
        const cardRect = card.getBoundingClientRect()
        const delta = cardRect.left - listRect.left - (listRect.width - cardRect.width) / 2
        list.scrollTo({ left: list.scrollLeft + delta, behavior: "smooth" })
        setActiveIndex(index)
    }

    if (items.length === 0) return null

    return (
        /* Al menos una pantalla, y el `pt` reserva el navbar para que el título fijo no se monte sobre las tarjetas. */
        <div className="relative flex min-h-svh flex-col pt-19">
            {/* `top-19` (76px), no `top-20`: el navbar mide 80px con el hamburguesa y 76px desde `lg`,
                donde se oculta. Con 80 quedaban 4px transparentes en desktop; con 76 se mete bajo el
                navbar opaco en móvil, que no se nota. El `z-20` lo deja por encima de los badges
                (z-10), que al ir después en el DOM si no lo tapaban. */}
            <div className="sticky top-19 z-20 bg-sage px-6 py-6 sm:px-10 lg:px-10">
                <h2 className={sectionHeadingClassName("white")}>{heading}</h2>
            </div>

            <div className="flex min-h-0 flex-1 items-center pb-6 lg:pb-16">
                <ul
                    ref={listRef}
                    onScroll={syncActive}
                    className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-10 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:snap-none lg:px-10 [&::-webkit-scrollbar]:hidden"
                >
                    {items.map((item) => (
                        <li key={item.id} className="flex w-[82%] shrink-0 snap-center sm:w-[55%] lg:w-auto">
                            <PinCard {...item} />
                        </li>
                    ))}
                </ul>
            </div>

            {items.length > 1 && (
                <div className="flex justify-center gap-1 pb-6 lg:hidden">
                    {items.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => goTo(index)}
                            aria-label={item.title}
                            aria-current={index === activeIndex}
                            className="group flex h-10 w-8 items-center justify-center"
                        >
                            <span
                                className={`h-2 w-2 rounded-full transition-all ${index === activeIndex ? "scale-125 bg-white" : "bg-white/40 group-hover:bg-white/70"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function PinCard({ href, title, subtitle, coverImage, badge, ctaLabel }: CardData) {
    return (
        <Link
            href={href}
            className="flex w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
            <article className="flex flex-1 flex-col bg-sage-deep p-5 text-white">
                <div className={COVER_CLASS}>
                    <span className="absolute left-3 top-3 z-10 border border-white/40 bg-sage-deep px-3 py-1 text-xs font-medium text-white">
                        {badge}
                    </span>
                    {coverImage ? (
                        <MediaImage src={coverImage} alt={title} sizes={CARD_IMAGE_SIZES} />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-sage to-sage-deep" />
                    )}
                </div>
                <h3 className="mt-5 line-clamp-2 font-serif text-[1.45rem] font-light italic leading-[1.15] text-white lg:text-[1.65rem]">
                    {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{subtitle}</p>
                <span className="mt-4 inline-flex w-fit items-center gap-1 text-sm text-white/70">
                    {ctaLabel} <span aria-hidden>→</span>
                </span>
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
