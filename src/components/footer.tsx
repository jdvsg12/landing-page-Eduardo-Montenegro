"use client"

import { motion } from "motion/react"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { socialLinks } from "@/lib/social-links"

export function Footer() {
    const { language } = useLanguage()
    const t = getTranslation(language)

    return (
        <footer className="bg-[#1a1a1a] py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-8">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <span className="text-lg text-white">
                        Eduardo <span className="font-semibold italic">Montenegro</span>
                    </span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center gap-4 md:items-end"
                >
                    <span className="text-sm text-white">{t.footer.socialMedia}</span>
                    <div className="flex gap-6">
                        {socialLinks.map((link) => (
                            <motion.a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ y: -2 }}
                                className="text-sm text-neutral-400 transition-colors hover:text-white"
                            >
                                {link.label}
                            </motion.a>
                        ))}
                    </div>
                </motion.div>
            </div>
        </footer>
    )
}