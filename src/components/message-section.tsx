"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"
import { useLanguage } from "@/lib/language-context"
import { getTranslation, type Language } from "@/lib/translations"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

const ACCENT: Record<Language, string> = {
    es: "sufrimiento",
    en: "suffering",
    fr: "souffrance",
}

function wordKey(word: string) {
    return word
        .normalize("NFC")
        .replace(/[.,!?;:«»“”"'’]/g, "")
        .toLowerCase()
}

export function MessageSection() {
    const { language } = useLanguage()
    const t = getTranslation(language)
    const reduceMotion = usePrefersReducedMotion()
    const words = t.slogan.split(/\s+/).filter(Boolean)
    const accent = ACCENT[language]

    return (
        <section className="relative bg-paper">
            {reduceMotion ? (
                <div className="relative flex min-h-[75svh] items-center justify-center overflow-hidden px-6 py-24">
                    <FillField />
                    <SloganHeadline words={words} accent={accent} progress={null} />
                </div>
            ) : (
                <FillSlogan words={words} accent={accent} />
            )}
        </section>
    )
}

function FillSlogan({ words, accent }: { words: string[]; accent: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"],
    })

    return (
        <div ref={ref} className="relative h-[140svh] lg:h-[165svh]">
            <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden px-6">
                <FillField />
                <SloganHeadline words={words} accent={accent} progress={scrollYProgress} />
            </div>
        </div>
    )
}

function SloganHeadline({
    words,
    accent,
    progress,
}: {
    words: string[]
    accent: string
    progress: MotionValue<number> | null
}) {
    const total = words.reduce((count, word) => count + Array.from(word).length, 0)
    let charIndex = 0

    return (
        <h2 className="relative max-w-[16ch] px-1 text-center font-serif text-[clamp(2.1rem,11vw,6.75rem)] font-light italic leading-[0.95] tracking-[-0.03em] text-ink">
            {words.map((word, wordIndex) => {
                const isAccent = wordKey(word) === accent
                const letters = Array.from(word)

                return (
                    <span key={`${word}-${wordIndex}`}>
                        {letters.map((char) => {
                            const index = charIndex++
                            if (!progress) {
                                return (
                                    <span
                                        key={`${wordIndex}-${index}`}
                                        className={isAccent ? "text-sage" : "text-ink"}
                                    >
                                        {char}
                                    </span>
                                )
                            }

                            return (
                                <FillChar
                                    key={`${wordIndex}-${index}`}
                                    char={char}
                                    index={index}
                                    total={total}
                                    progress={progress}
                                    accent={isAccent}
                                />
                            )
                        })}
                        {isAccent ? <br /> : wordIndex < words.length - 1 ? " " : null}
                    </span>
                )
            })}
        </h2>
    )
}

function FillChar({
    char,
    index,
    total,
    progress,
    accent,
}: {
    char: string
    index: number
    total: number
    progress: MotionValue<number>
    accent: boolean
}) {
    const opacity = useTransform(progress, (value) => {
        const start = (index / Math.max(1, total)) * 0.72
        const end = Math.min(1, start + 0.28)
        if (value <= start) return 0.08
        if (value >= end) return 1
        return 0.08 + (0.92 * (value - start)) / (end - start)
    })

    return (
        <motion.span style={{ opacity }} className={accent ? "text-sage" : "text-ink"}>
            {char}
        </motion.span>
    )
}

function FillField() {
    return (
        <svg
            aria-hidden
            className="pointer-events-none absolute -top-24 right-0 h-[70%] w-[55%] max-w-[min(55%,20rem)] text-sage/25 lg:-top-16"
            viewBox="0 0 640 640"
            fill="none"
        >
            <g stroke="currentColor" strokeWidth="1">
                <circle cx="420" cy="180" r="120" />
                <circle cx="420" cy="180" r="190" />
                <circle cx="420" cy="180" r="270" />
                <circle cx="420" cy="180" r="350" />
            </g>
        </svg>
    )
}
