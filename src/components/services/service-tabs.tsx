"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { pickLocale } from "@/lib/i18n-field"
import type { Service } from "@/lib/services"
import type { Language } from "@/lib/translations"

/* Tres espacios de consulta, uno abierto a la vez. El abierto muestra la imagen
   completa; los demás quedan como pestañas en las que se puede volver a entrar
   con un clic.

   Cada servicio tiene su propio tramo de scroll dentro de un contenedor alto,
   con la lista fijada encima. Así el ritmo no depende de lo alta que sea cada
   fila —que en móvil las hacía cambiar demasiado rápido— sino de una distancia
   de scroll explícita. */

/** Tramo de scroll por servicio, en alturas de pantalla. */
const SLOT_VH = { base: 0.9, md: 0.7 }

interface ServiceTabsProps {
    services: Service[]
    language: Language
    ctaLabel: string
    /** Se fija junto con la lista, para que no haya que cuadrar dos `sticky` distintos. */
    heading?: ReactNode
}

export function ServiceTabs({ services, language, ctaLabel, heading }: ServiceTabsProps) {
    const runwayRef = useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion()
    const [activeIndex, setActiveIndex] = useState(0)
    const [slotVh, setSlotVh] = useState(SLOT_VH.base)

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)")
        const update = () => setSlotVh(mq.matches ? SLOT_VH.md : SLOT_VH.base)
        update()
        mq.addEventListener("change", update)
        return () => mq.removeEventListener("change", update)
    }, [])

    /* El scroll recorrido dentro del contenedor decide qué servicio está
       abierto. Se lee con getBoundingClientRect en un rAF propio: los hooks de
       scroll de Motion sobre un contenedor sticky entran en bucle de medición. */
    const syncActive = useCallback(() => {
        const runway = runwayRef.current
        if (!runway || services.length === 0) return

        const rect = runway.getBoundingClientRect()
        const travelled = -rect.top
        const slot = rect.height / services.length
        if (slot <= 0) return

        const next = Math.min(
            services.length - 1,
            Math.max(0, Math.floor(travelled / slot))
        )
        setActiveIndex((current) => (current === next ? current : next))
    }, [services.length])

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

    /* Pulsar una pestaña lleva el scroll al tramo de ese servicio, que es lo que
       lo abre. Así el clic y el scroll no se contradicen. */
    const openService = (index: number) => {
        const runway = runwayRef.current
        if (!runway) return

        /* offsetTop es relativo al contenedor posicionado, no al documento:
           hay que partir del rect en pantalla más el scroll actual. */
        const rect = runway.getBoundingClientRect()
        const documentTop = rect.top + window.scrollY
        const slot = rect.height / services.length

        window.scrollTo({
            top: documentTop + slot * index + slot / 2,
            behavior: reduceMotion ? "instant" : "smooth",
        })
        setActiveIndex(index)
    }

    if (services.length === 0) return null

    const transition = { duration: reduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] as const }

    return (
        <div
            ref={runwayRef}
            className="relative"
            style={{ height: `${services.length * slotVh * 100}vh` }}
        >
            <div className="sticky top-20 bg-[#D9D9D9] pt-8">
                {heading}
                <ul className="space-y-3">
                    {services.map((service, index) => {
                        const isOpen = index === activeIndex
                        const title = pickLocale(service.title, language)
                        const kicker = pickLocale(service.kicker, language)
                        const panelId = `service-panel-${service.slug}`

                        return (
                            <li key={service.id}>
                                {isOpen ? (
                                    <motion.div
                                        id={panelId}
                                        initial={reduceMotion ? false : { opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={transition}
                                    >
                                        {/* A sangre en móvil, para que la imagen gane todo el ancho */}
                                        <div className="-mx-6 h-[280px] overflow-hidden sm:mx-0 md:h-[460px]">
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

                                        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pt-5">
                                            <div className="min-w-0">
                                                <h3 className="text-xl uppercase tracking-[0.09em] text-neutral-900 lg:text-3xl">
                                                    {title}
                                                </h3>
                                                {kicker && (
                                                    <p className="mt-2 text-sm text-neutral-600 lg:text-base">
                                                        {kicker}
                                                    </p>
                                                )}
                                            </div>

                                            <Link
                                                href={`/servicios/${service.slug}`}
                                                className="whitespace-nowrap border-b border-neutral-400 pb-1 text-sm text-neutral-800 transition-colors duration-200 hover:border-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900"
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
                                        className="group -mx-6 flex h-20 w-[calc(100%+3rem)] items-stretch gap-4 bg-[#C4C4C0] pr-5 text-left transition-colors duration-200 hover:bg-[#BCBCB7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] sm:mx-0 sm:w-full md:h-[84px]"
                                    >
                                        <span className="w-24 shrink-0 overflow-hidden md:w-32">
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
            </div>
        </div>
    )
}
