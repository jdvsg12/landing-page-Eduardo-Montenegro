"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

const easeConsultorio: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function MessageSection() {
    const { language } = useLanguage()
    const t = getTranslation(language)
    const reduceMotion = usePrefersReducedMotion()
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, amount: 0.55 })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const clipped = mounted && !reduceMotion && !inView

    return (
        <section className="relative bg-paper py-24 lg:py-32">
            <div className="flex items-center justify-center px-6">
                <motion.p
                    ref={ref}
                    animate={{ clipPath: clipped ? "inset(100% 0 0 0)" : "inset(0% 0 0 0)" }}
                    transition={{ duration: 0.8, ease: easeConsultorio }}
                    className="max-w-4xl text-center font-serif text-5xl font-light italic leading-[1.15] text-sage-ink lg:text-7xl"
                >
                    {t.slogan}
                </motion.p>
            </div>
        </section>
    )
}
