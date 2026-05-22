"use client"

import { motion } from "motion/react"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"

export function AboutSection() {
    const { language } = useLanguage()
    const t = getTranslation(language)

    return (
        <section id="about" className="relative z-10 bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24 lg:pb-14">
                <div className="grid items-start gap-8 lg:grid-cols-[2fr_1fr] lg:gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="thin-scrollbar order-2 max-h-[60vh] overflow-y-auto pr-4 lg:order-1"
                    >
                        <div className="mb-12">
                            <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                                {t.about.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold text-foreground whitespace-nowrap">
                                {t.profile.title}
                            </h3>
                            <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                                {t.profile.description}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="order-1 lg:order-2"
                    >
                        <h2 className="text-right font-serif">
                            <span className="text-6xl font-bold text-muted-foreground/50 lg:text-8xl">
                                {t.about.title}
                            </span>
                        </h2>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
