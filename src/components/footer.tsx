"use client"

import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { socialLinks } from "@/lib/social-links"

export function Footer() {
    const { language } = useLanguage()
    const t = getTranslation(language)

    return (
        <footer className="bg-ink py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-8">
                <span className="text-lg text-white">
                    Eduardo <span className="font-semibold italic">Montenegro</span>
                </span>

                <div className="flex flex-col items-center gap-4 md:items-end">
                    <span className="text-sm text-white">{t.footer.socialMedia}</span>
                    <div className="flex gap-6">
                        {socialLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-white/80 transition-colors hover:text-white"
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
