"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { pickLocale } from "@/lib/i18n-field"
import type { Service } from "@/lib/services"
import type { Language } from "@/lib/translations"

/* Tres espacios de consulta, uno abierto a la vez. El abierto muestra la imagen
   completa; los demás quedan como pestañas en las que se puede volver a entrar
   con un clic. Como siempre hay exactamente uno abierto, la altura total de la
   lista es constante y abrir uno no descuadra a los otros. */

/** Altura de pantalla, en tanto por uno, donde se decide qué servicio está abierto. */
const FOCUS_LINE = 0.45

interface ServiceTabsProps {
    services: Service[]
    language: Language
    ctaLabel: string
}

export function ServiceTabs({ services, language, ctaLabel }: ServiceTabsProps) {
    const listRef = useRef<HTMLUListElement>(null)
    const itemRefs = useRef<(HTMLLIElement | null)[]>([])
    const reduceMotion = useReducedMotion()
    const [activeIndex, setActiveIndex] = useState(0)

    /* El servicio abierto es aquel cuyo centro queda más cerca de la línea de
       foco. Se calcula a mano, con rAF, para no depender de observadores que
       vuelvan a dispararse cada vez que abrir una tarjeta recoloca la lista. */
    const syncActive = useCallback(() => {
        const items = itemRefs.current.filter(Boolean) as HTMLLIElement[]
        if (items.length === 0) return

        const line = window.innerHeight * FOCUS_LINE
        let bestIndex = 0
        let bestDistance = Number.POSITIVE_INFINITY

        items.forEach((item, index) => {
            const rect = item.getBoundingClientRect()
            const distance = Math.abs(rect.top + rect.height / 2 - line)
            if (distance < bestDistance) {
                bestDistance = distance
                bestIndex = index
            }
        })

        setActiveIndex((current) => (current === bestIndex ? current : bestIndex))
    }, [])

    useEffect(() => {
        if (services.length === 0) return

        let frame = 0
        const onScroll = () => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(syncActive)
        }

        syncActive()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll, { passive: true })

        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
        }
    }, [services.length, syncActive])

    /* Pulsar una pestaña lleva el scroll hasta ese servicio, que es lo que lo
       abre. Así el clic y el scroll no se contradicen. */
    const openService = (index: number) => {
        setActiveIndex(index)
        itemRefs.current[index]?.scrollIntoView({
            block: "center",
            behavior: reduceMotion ? "instant" : "smooth",
        })
    }

    if (services.length === 0) return null

    const transition = { duration: reduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] as const }

    return (
        <ul ref={listRef} className="space-y-2">
            {services.map((service, index) => {
                const isOpen = index === activeIndex
                const title = pickLocale(service.title, language)
                const kicker = pickLocale(service.kicker, language)
                const panelId = `service-panel-${service.slug}`

                return (
                    <li
                        key={service.id}
                        ref={(el) => {
                            itemRefs.current[index] = el
                        }}
                    >
                        {isOpen ? (
                            <motion.div
                                id={panelId}
                                initial={reduceMotion ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={transition}
                                className="bg-[#1a1a1a] p-2"
                            >
                                <div className="h-[200px] w-full overflow-hidden md:h-[380px]">
                                    {service.coverImage ? (
                                        <img
                                            src={service.coverImage}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-[#8F958B] to-[#3f443d]" />
                                    )}
                                </div>

                                <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 px-3 pb-2 pt-5">
                                    <div className="min-w-0">
                                        <h3 className="text-lg uppercase tracking-[0.09em] text-white lg:text-2xl">
                                            {title}
                                        </h3>
                                        {kicker && (
                                            <p className="mt-2 text-sm text-white/55">{kicker}</p>
                                        )}
                                    </div>

                                    <Link
                                        href={`/servicios/${service.slug}`}
                                        className="whitespace-nowrap border-b border-white/40 pb-1 text-sm text-white transition-colors duration-200 hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                                    >
                                        {ctaLabel} →
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => openService(index)}
                                aria-expanded={false}
                                aria-controls={panelId}
                                className="group flex h-16 w-full items-stretch gap-4 bg-[#C4C4C0] pr-4 text-left transition-colors duration-200 hover:bg-[#BCBCB7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] md:h-[76px]"
                            >
                                <span className="w-16 shrink-0 overflow-hidden bg-[#1a1a1a] md:w-[76px]">
                                    {service.coverImage ? (
                                        <img
                                            src={service.coverImage}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="block h-full w-full bg-gradient-to-br from-[#8F958B] to-[#3f443d]" />
                                    )}
                                </span>

                                <span className="flex min-w-0 flex-1 flex-col justify-center py-2">
                                    <span className="truncate text-sm uppercase tracking-[0.09em] text-neutral-900 lg:text-base">
                                        {title}
                                    </span>
                                    {kicker && (
                                        <span className="truncate text-xs text-neutral-600 lg:text-sm">
                                            {kicker}
                                        </span>
                                    )}
                                </span>

                                <span
                                    aria-hidden
                                    className="flex items-center self-center text-neutral-500 transition-transform duration-200 group-hover:translate-x-0.5"
                                >
                                    ↗
                                </span>
                            </button>
                        )}
                    </li>
                )
            })}
        </ul>
    )
}
