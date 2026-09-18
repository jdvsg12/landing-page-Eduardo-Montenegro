"use client"

import Link from "next/link"
import { useRef, type ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { pickLocale } from "@/lib/i18n-field"
import type { Service } from "@/lib/services"
import type { Language } from "@/lib/translations"
import { MediaImage } from "@/components/media-image"

/* Tres espacios de consulta apilados: cada tarjeta se ancla en su propio `top`,
   escalonado el alto de una cabecera respecto a la anterior, con `z-index`
   creciente. Al bajar, la siguiente tarjeta sube y tapa el cuerpo de la
   anterior dejando su cabecera fija —eso es el tab, y por eso no se va.

   Es CSS puro: sin listeners de scroll, sin estado y sin animación. */

/* La geometría del apilado vive en variables CSS sobre cada <li>:
     --offset  navbar (60px) + barra de título, donde se ancla la primera
     --tab     alto de la cabecera, que es el escalón entre una y la siguiente */

interface ServiceTabsProps {
    services: Service[]
    language: Language
    ctaLabel: string
    /** Se fija junto con la lista, para no cuadrar dos `sticky` distintos. */
    heading?: ReactNode
}

export function ServiceTabs({ services, language, ctaLabel, heading }: ServiceTabsProps) {
    const listRef = useRef<HTMLUListElement>(null)
    const reduceMotion = usePrefersReducedMotion()

    /* Al estar siempre ancladas, el navegador considera que las tarjetas ya son
       visibles y un ancla `#id` no scrollea. Tampoco sirve `offsetTop`, que en
       un `sticky` devuelve la posición anclada. Hay que reconstruir la posición
       de flujo sumando las alturas anteriores. */
    const revealService = (index: number) => {
        const list = listRef.current
        if (!list) return

        const cards = Array.from(list.children) as HTMLElement[]
        const gap = parseFloat(getComputedStyle(list).rowGap) || 0

        let flowTop = list.getBoundingClientRect().top + window.scrollY
        for (let i = 0; i < index; i++) flowTop += cards[i].offsetHeight + gap

        const stickyTop = parseFloat(getComputedStyle(cards[index]).top) || 0

        window.scrollTo({
            top: flowTop - stickyTop,
            behavior: reduceMotion ? "instant" : "smooth",
        })
    }

    if (services.length === 0) {
        return (
            <div className="sticky top-[60px] z-40 -mx-6 mb-8 bg-surface px-6 py-6 lg:-mx-8 lg:px-8 lg:py-8">
                {heading}
            </div>
        )
    }

    return (
        <>
            <div className="sticky top-[60px] z-40 -mx-6 mb-8 bg-surface px-6 py-6 lg:-mx-8 lg:px-8 lg:py-8">
                {heading}
            </div>

            {/* Pista corta: las fichas sticky se sueltan al llegar el FAQ,
                sin dejar medio viewport vacío. */}
            <ul ref={listRef} className="flex flex-col gap-6 pb-4">
                {services.map((service, index) => {
                    const title = pickLocale(service.title, language)
                    const kicker = pickLocale(service.kicker, language)
                    const anchor = `svc-${service.slug}`

                    return (
                        <li
                            key={service.id}
                            id={anchor}
                            className="sticky [--offset:148px] md:[--offset:196px] [--tab:72px] md:[--tab:84px]"
                            style={{
                                top: `calc(var(--offset) + ${index} * var(--tab))`,
                                zIndex: index + 1,
                                scrollMarginTop: `calc(var(--offset) + ${index} * var(--tab))`,
                            }}
                        >
                            {/* El fondo opaco es lo que tapa la tarjeta de abajo al apilarse */}
                            <article className="bg-surface">
                                <a
                                    href={`#${anchor}`}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        revealService(index)
                                    }}
                                    className="flex h-[72px] items-center justify-between gap-6 border-t border-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:h-[84px]"
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate text-lg uppercase tracking-[0.09em] text-ink lg:text-2xl">
                                            {title}
                                        </span>
                                        {kicker && (
                                            <span className="mt-1 block truncate text-sm text-sage-ink">
                                                {kicker}
                                            </span>
                                        )}
                                    </span>
                                    <ArrowUpRight
                                        aria-hidden
                                        strokeWidth={1.5}
                                        className="size-5 shrink-0 text-sage-ink"
                                    />
                                </a>

                                {/* A sangre en móvil, para que la imagen gane todo el ancho */}
                                <div className="relative -mx-6 h-[280px] overflow-hidden sm:mx-0 md:h-[460px]">
                                    <div className="service-cover-media absolute inset-0 origin-center">
                                        {service.coverImage ? (
                                            <MediaImage
                                                src={service.coverImage}
                                                alt={title}
                                                sizes="(min-width: 1024px) 80vw, 100vw"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-sage to-sage-deep" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pb-6 pt-4">
                                    <Link
                                        href={`/servicios/${service.slug}`}
                                        className="border-b border-neutral-400 pb-1 text-sm text-ink transition-colors duration-200 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                                    >
                                        {ctaLabel} →
                                    </Link>
                                </div>
                            </article>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}
