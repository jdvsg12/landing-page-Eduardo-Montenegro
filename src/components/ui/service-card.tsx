"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { motion } from "motion/react"

interface ContactInfo {
    whatsapp?: string
    email?: string
}

interface ServiceCardProps {
    title: string
    description: string
    index: number
    whatsapp?: string
    message?: string
}

export function ServiceCard({ title, description, index, whatsapp, message }: ServiceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [canExpand, setCanExpand] = useState(false)
    const descriptionRef = useRef<HTMLParagraphElement | null>(null)

    useLayoutEffect(() => {
        const el = descriptionRef.current
        if (!el) return

        const compute = () => {
            if (!descriptionRef.current) return
            const node = descriptionRef.current
            // Force a reflow to get accurate measurements
            const originalClamp = (node.style as any).webkitLineClamp
                ; (node.style as any).webkitLineClamp = '6'
            const isClamped = node.scrollHeight > node.clientHeight
                ; (node.style as any).webkitLineClamp = originalClamp
            setCanExpand(isClamped)
        }

        compute()
        window.addEventListener("resize", compute)
        return () => window.removeEventListener("resize", compute)
    }, [description])

    const handleWhatsAppClick = (phone: string, customMessage?: string) => {
        const defaultMessage = "Hola, estoy interesado/a en sus servicios"
        const msg = customMessage || defaultMessage
        const encodedMessage = encodeURIComponent(msg)
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="group"
        >
            <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="h-full border-t border-neutral-300 pt-6"
            >
                <h3 className="mb-4 text-xl font-semibold text-neutral-900">{title}</h3>

                <div className="relative">
                    <motion.p
                        ref={descriptionRef}
                        className={`whitespace-pre-line text-sm leading-relaxed text-neutral-600 transition-all duration-500 ease-in-out ${isExpanded ? 'line-clamp-none' : 'line-clamp-6'
                            }`}
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: isExpanded ? 'unset' : 6,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                        animate={{
                            height: isExpanded ? 'auto' : 'auto'
                        }}
                        transition={{
                            duration: 0.5,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                    >
                        {description}
                    </motion.p>

                    {canExpand && (
                        <motion.button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            transition={{
                                duration: 0.3,
                                delay: isExpanded ? 0 : 0.1
                            }}
                        >
                            <motion.span
                                animate={{
                                    display: 'inline-block'
                                }}
                                transition={{
                                    duration: 0.2
                                }}
                            >
                                {isExpanded ? 'Ver menos' : 'Ver más'}
                            </motion.span>
                            <motion.svg
                                className="inline-block ml-1 w-3 h-3"
                                animate={{
                                    rotate: isExpanded ? 180 : 0
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeInOut"
                                }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                        </motion.button>
                    )}
                </div>

                {whatsapp && (
                    <div className="mt-6 space-y-2">
                        <motion.button
                            onClick={() => handleWhatsAppClick(whatsapp, message)}
                            whileHover={{ scale: 1.02, backgroundColor: "#16a34a" }}
                            whileTap={{ scale: 0.98 }}
                            className="flex w-full items-center justify-center gap-2 bg-green-500 py-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-green-600"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Contactar por WhatsApp
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}
