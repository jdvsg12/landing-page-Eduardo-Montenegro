"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { useLanguage } from "@/lib/language-context"
import { pickLocale } from "@/lib/i18n-field"
import type { FaqContent } from "@/lib/site-content"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionHeading } from "@/components/section-heading"

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
            className={`relative min-h-11 shrink-0 cursor-pointer px-4 py-3 text-left text-base font-medium transition-colors sm:px-6 lg:text-xl ${isActive
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

export function FaqSection({ content }: { content: FaqContent }) {
    const { language } = useLanguage()
    const reduceMotion = usePrefersReducedMotion()
    const [activeCategory, setActiveCategory] = useState(0)
    const [hasSwapped, setHasSwapped] = useState(false)

    const faqContent = {
        title: pickLocale(content.title, language),
        categories: content.categories
            .map((category) => ({
                name: pickLocale(category.name, language),
                items: category.items
                    .map((item) => ({
                        question: pickLocale(item.question, language),
                        answer: pickLocale(item.answer, language),
                    }))
                    .filter((item) => item.question && item.answer),
            }))
            .filter((category) => category.name && category.items.length > 0),
    }

    if (faqContent.categories.length === 0) return null

    return (
        <section id="faq" className="relative scroll-mt-20 bg-paper py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeading className="mb-16 lg:mb-20">{faqContent.title}</SectionHeading>

                <div className="mb-12 flex gap-1 overflow-x-auto border-b border-ink/15 pb-px [-ms-overflow-style:none] [scrollbar-width:none] lg:justify-between lg:overflow-visible [&::-webkit-scrollbar]:hidden">
                    {faqContent.categories.map((category, index) => (
                        <CategoryTab
                            key={`${index}-${category.name}`}
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
