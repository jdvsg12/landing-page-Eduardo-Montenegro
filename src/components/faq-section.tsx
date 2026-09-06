"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface FaqItem {
    question: string
    answer: string
}

interface FaqCategory {
    name: string
    items: FaqItem[]
}

interface FaqTranslations {
    title: string
    categories: FaqCategory[]
}

interface Translations {
    faq: FaqTranslations
}

const easeConsultorio: [number, number, number, number] = [0.16, 1, 0.3, 1]

function CategoryTab({
    name,
    isActive,
    onClick,
    reduceMotion,
}: {
    name: string
    isActive: boolean
    onClick: () => void
    reduceMotion: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isActive}
            className={`relative min-h-11 cursor-pointer px-6 py-3 text-left text-lg font-medium transition-colors lg:text-xl ${isActive
                ? "text-ink"
                : "text-sage-ink hover:text-ink"
                }`}
        >
            {name}
            {isActive && (
                reduceMotion ? (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink" />
                ) : (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                )
            )}
        </button>
    )
}

export function FaqSection() {
    const { language } = useLanguage()
    const t = getTranslation(language) as Translations
    const reduceMotion = usePrefersReducedMotion()
    const [activeCategory, setActiveCategory] = useState(0)
    const [hasSwapped, setHasSwapped] = useState(false)

    const faqContent = t.faq

    return (
        <section id="faq" className="relative scroll-mt-20 bg-paper py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <h2 className="mb-16 font-serif text-4xl font-light italic text-sage-ink lg:mb-20 lg:text-6xl">
                    {faqContent.title}
                </h2>

                <div className="mb-12 flex flex-wrap justify-between gap-2 border-b border-ink/15">
                    {faqContent.categories.map((category, index) => (
                        <CategoryTab
                            key={category.name}
                            name={category.name}
                            isActive={activeCategory === index}
                            reduceMotion={reduceMotion}
                            onClick={() => {
                                setHasSwapped(true)
                                setActiveCategory(index)
                            }}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={
                            hasSwapped && !reduceMotion
                                ? { clipPath: "inset(0 0 100% 0)" }
                                : false
                        }
                        animate={{ clipPath: "inset(0 0 0% 0)" }}
                        exit={
                            reduceMotion
                                ? { opacity: 0 }
                                : { clipPath: "inset(100% 0 0 0)" }
                        }
                        transition={{ duration: 0.3, ease: easeConsultorio }}
                        className="overflow-hidden"
                    >
                        <Accordion type="single" collapsible className="w-full">
                            {faqContent.categories[activeCategory]?.items.map((item, index) => (
                                <AccordionItem
                                    key={`${activeCategory}-${index}`}
                                    value={`item-${activeCategory}-${index}`}
                                    className="border-b border-ink/15"
                                >
                                    <AccordionTrigger className="py-6 text-left text-base font-medium text-ink hover:no-underline lg:text-lg [&[data-state=open]>svg]:rotate-180">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6 text-base leading-relaxed text-sage-ink">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    )
}
