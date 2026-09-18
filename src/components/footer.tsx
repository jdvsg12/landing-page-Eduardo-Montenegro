"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { socialLinks } from "@/lib/social-links"

export function Footer() {
    const { language } = useLanguage()
    const t = getTranslation(language)

    return (
        <footer className="bg-ink py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-8">
                <div className="flex flex-col items-center gap-2 md:items-start">
                    <span className="text-lg text-white">
                        Eduardo <span className="font-semibold italic">Montenegro</span>
                    </span>
                    <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-5">
                        <Link
                            href="/privacidad"
                            className="inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white"
                        >
                            {t.footer.privacy}
                        </Link>
                        <Link
                            href="/terminos"
                            className="inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white"
                        >
                            {t.footer.terms}
                        </Link>
                    </nav>
                </div>

                <div className="flex flex-col items-center gap-4 md:items-end">
                    <span className="text-sm text-white">{t.footer.socialMedia}</span>
                    <div className="flex gap-6">
                        {socialLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-white/80 transition-colors hover:text-white min-h-11 inline-flex items-center"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
