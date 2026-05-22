"use client"

import { motion } from "motion/react"
import { ScrollVelocityRow } from "@/registry/magicui/scroll-based-velocity"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"

export function HeroBanner() {
    const { language } = useLanguage()
    const t = getTranslation(language)

    return (
        <section className="sticky top-0 z-0 h-screen overflow-hidden bg-[#8F958B]">
            <div className="absolute inset-0 lg:hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/images/profile.png')" }}
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 flex h-full flex-col">
                <div className="flex flex-1 flex-col items-center justify-center px-6 lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-8 pt-48 lg:pt-0">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative mb-8 lg:mb-0 hidden lg:block"
                    >
                        <div className="relative hidden overflow-hidden lg:inline-block lg:h-dvh lg:w-10/12">
                            <img
                                src="/images/profile.png"
                                alt="Eduardo Montenegro - Psicólogo Clínico"
                                className="h-full w-full object-contain object-bottom"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-center lg:text-left z-20"
                    >
                        <h1 className="mb-3 text-[32px] font-medium tracking-wide text-white underline underline-offset-8 md:text-[40px]">
                            {t.hero.title}
                        </h1>
                        <p className="text-xl text-white/90 md:text-2xl">{t.hero.subtitle}</p>
                    </motion.div>
                </div>

                <div className="absolute bottom-1/12 left-0 right-0 pb-8 lg:bottom-1/12">
                    <ScrollVelocityRow baseVelocity={4} direction={-1}>
                        <span className="mx-4 text-7xl font-bold tracking-tight text-white/90 lg:text-9xl">EDUARDO MONTENEGRO</span>
                        <span className="mx-4 text-7xl font-bold tracking-tight text-white/90 lg:text-9xl">—</span>
                    </ScrollVelocityRow>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    className="h-8 w-5 rounded-full border-2 border-white/50"
                >
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        className="mx-auto mt-1 h-2 w-1 rounded-full bg-white/50"
                    />
                </motion.div>
            </motion.div>
        </section>
    )
}
