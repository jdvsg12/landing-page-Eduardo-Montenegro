"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "motion/react"
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

function AnimatedTitle({ text, className }: { text: string; className?: string }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.5 })
    const words = text.split(" ")

    return (
        <motion.h2
            ref={ref}
            className={className}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: 0.12,
                    },
                },
            }}
        >
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    className="mr-[0.25em] inline-block"
                    variants={{
                        hidden: {
                            opacity: 0,
                            y: 50,
                            filter: "blur(10px)",
                        },
                        visible: {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: {
                                duration: 0.5,
                                ease: [0.25, 0.4, 0.25, 1],
                            },
                        },
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </motion.h2>
    )
}

function CategoryTab({
    name,
    isActive,
    onClick,
    index,
}: {
    name: string
    isActive: boolean
    onClick: () => void
    index: number
}) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.5 })

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.4, 0.25, 1],
            }}
            className={`relative px-6 py-3 text-left text-lg font-medium transition-colors cursor-pointer lg:text-xl ${isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
                }`}
        >
            {name}
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
        </motion.button>
    )
}

function FaqItem({
    question,
    answer,
    index,
    value,
}: {
    question: string
    answer: string
    index: number
    value: string
}) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.25, 0.4, 0.25, 1],
            }}
        >
            <AccordionItem value={value} className="border-b border-muted-foreground/20">
                <AccordionTrigger className="py-6 text-left text-base font-medium text-foreground hover:no-underline lg:text-lg [&[data-state=open]>svg]:rotate-180">
                    {question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
                    {answer}
                </AccordionContent>
            </AccordionItem>
        </motion.div>
    )
}

export function FaqSection() {
    const { language } = useLanguage()
    const t = getTranslation(language) as Translations
    const [activeCategory, setActiveCategory] = useState(0)

    const faqContent = t.faq

    return (
        <section id="faq" className="relative z-10 bg-white py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <AnimatedTitle
                    text={faqContent.title}
                    className="mb-16 font-serif text-4xl italic text-foreground lg:mb-20 lg:text-6xl"
                />

                <div className="mb-12 flex flex-wrap justify-between gap-2 border-b border-muted-foreground/20">
                    {faqContent.categories.map((category, index) => (
                        <CategoryTab
                            key={category.name}
                            name={category.name}
                            isActive={activeCategory === index}
                            onClick={() => setActiveCategory(index)}
                            index={index}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Accordion type="single" collapsible className="w-full">
                            {faqContent.categories[activeCategory]?.items.map((item, index) => (
                                <FaqItem
                                    key={`${activeCategory}-${index}`}
                                    question={item.question}
                                    answer={item.answer}
                                    index={index}
                                    value={`item-${activeCategory}-${index}`}
                                />
                            ))}
                        </Accordion>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    )
}
