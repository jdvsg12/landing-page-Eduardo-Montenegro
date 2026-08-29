"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { Navbar } from "@/components/navbar"
import { ServiceLeadForm } from "@/components/services/ServiceLeadForm"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { pickLocale } from "@/lib/i18n-field"
import type { Service } from "@/lib/services"

export function ServiceDetail({ service }: { service: Service }) {
    const { language } = useLanguage()
    const t = getTranslation(language)
    const reduceMotion = useReducedMotion()

    const title = pickLocale(service.title, language)
    const kicker = pickLocale(service.kicker, language)
    const excerpt = pickLocale(service.excerpt, language)
    const waMessage = pickLocale(service.waMessage, language) || `Hola, me interesa "${title}".`

    const whatsappHref = service.whatsapp
        ? `https://wa.me/${service.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`
        : null

    /* Secuencia de entrada: cintillo, título, filete y entradilla, en ese orden.
       Es la única animación de la página además de la apertura de la imagen. */
    const enter = (delay: number) =>
        reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 16 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
            }

    return (
        <div className="min-h-screen bg-[#F2F1EE] text-neutral-900">
            <Navbar variant="page" />


            {/* Apertura: la página empieza por el nombre, no por una fotografía */}
            <section className="mx-auto max-w-5xl px-6 pb-16 pt-32 lg:px-8 lg:pt-44">
                {kicker && (
                    <motion.p
                        {...enter(0)}
                        className="mb-8 text-xs uppercase tracking-[0.28em] text-[#6E7469]"
                    >
                        {kicker}
                    </motion.p>
                )}

                <motion.h1
                    {...enter(0.08)}
                    className="max-w-3xl font-serif text-4xl font-light italic leading-[1.1] md:text-6xl lg:text-7xl"
                >
                    {title}
                </motion.h1>

                {excerpt && (
                    <>
                        <motion.div
                            {...enter(0.16)}
                            className="my-10 h-px w-full max-w-3xl bg-[#8F958B]/50"
                        />
                        <motion.p
                            {...enter(0.24)}
                            className="max-w-2xl text-lg leading-relaxed text-neutral-700 md:text-xl"
                        >
                            {excerpt}
                        </motion.p>
                    </>
                )}
            </section>

            {/* La imagen ilustra, no anuncia: llega después de la frase de apertura */}
            {service.coverImage && (
                <motion.figure
                    initial={reduceMotion ? undefined : { opacity: 0 }}
                    animate={reduceMotion ? undefined : { opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.3 }}
                    className="mb-20 h-[45vh] w-full overflow-hidden md:h-[60vh]"
                >
                    <img
                        src={service.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                </motion.figure>
            )}

            {/* El cuerpo comparte el eje izquierdo con el título de apertura */}
            <article className="mx-auto max-w-5xl px-6 pb-8 lg:px-8">
                <div className="max-w-2xl space-y-7">
                    {service.blocks.map((block, index) => {
                        const content = pickLocale(block.content, language)
                        if (!content) return null

                        return block.type === "heading" ? (
                            <h2
                                key={index}
                                className="pt-8 font-serif text-2xl font-light italic md:text-3xl"
                            >
                                {content}
                            </h2>
                        ) : (
                            <p
                                key={index}
                                className="whitespace-pre-line text-base leading-[1.8] text-neutral-700"
                            >
                                {content}
                            </p>
                        )
                    })}
                </div>

                {service.images.length > 0 && (
                    <div className="mt-16 grid max-w-3xl gap-4 sm:grid-cols-2">
                        {service.images.map((img, index) => (
                            <img
                                key={index}
                                src={img.url}
                                alt={img.alt ?? ""}
                                className="w-full object-cover"
                            />
                        ))}
                    </div>
                )}
            </article>

            {/* Cierre: WhatsApp para consultas individuales, formulario para encuentros grupales */}
            <section className="mx-auto max-w-5xl px-6 pb-24 lg:px-8">
                <div className="max-w-2xl">
                {service.ctaType === "form" ? (
                    <ServiceLeadForm slug={service.slug} />
                ) : whatsappHref ? (
                    <div className="border-t border-[#8F958B]/50 pt-10">
                        <p className="mb-3 font-serif text-2xl font-light italic">
                            {t.services.detailWhatsAppTitle}
                        </p>
                        <p className="mb-8 max-w-md text-sm leading-relaxed text-neutral-500">
                            {t.services.detailWhatsAppSubtitle}
                        </p>
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-[#1a1a1a] px-8 py-4 text-sm text-white transition-colors duration-200 hover:bg-[#25D366] hover:text-[#0b2d18]"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            {t.services.contactWhatsApp}
                        </a>
                    </div>
                ) : null}

                <div className="mt-16 border-t border-neutral-300 pt-8">
                    <Link
                        href="/#services"
                        className="text-sm text-neutral-500 transition-colors duration-200 hover:text-neutral-900"
                    >
                        {t.services.backToServices}
                    </Link>
                </div>
                </div>
            </section>
        </div>
    )
}
