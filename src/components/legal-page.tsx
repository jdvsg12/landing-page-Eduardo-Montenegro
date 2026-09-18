"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/language-context"
import { getTranslation, type Language } from "@/lib/translations"
import { dateLocale } from "@/lib/language"
import type { LegalDocument } from "@/lib/legal-documents"

export function LegalPage({
    documents,
    updatedAt,
}: {
    documents: Record<Language, LegalDocument>
    updatedAt: string
}) {
    const { language } = useLanguage()
    const t = getTranslation(language)
    const doc = documents[language]
    const updated = new Date(`${updatedAt}T12:00:00`).toLocaleDateString(dateLocale(language), {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar variant="page" />
            <main id="main" className="mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-8 lg:pt-44">
                <p className="mb-8 text-xs uppercase tracking-[0.28em] text-sage-ink">
                    {t.legal.lastUpdated}: {updated}
                </p>
                <h1 className="font-serif text-4xl font-light italic leading-[1.1] md:text-5xl lg:text-6xl">
                    {doc.title}
                </h1>
                <div className="my-10 h-px w-full bg-sage/50" />
                <p className="text-lg leading-relaxed text-neutral-700">{doc.intro}</p>

                <ol className="mt-16 space-y-14">
                    {doc.sections.map((section, index) => (
                        <li key={section.heading}>
                            <h2 className="font-serif text-2xl font-light italic md:text-3xl">
                                <span className="mr-3 text-sage-ink not-italic">{index + 1}.</span>
                                {section.heading}
                            </h2>
                            <div className="mt-5 space-y-4 text-base leading-[1.8] text-neutral-700">
                                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                                {section.items && section.items.length > 0 && (
                                    <ul className="space-y-2 pl-5 [list-style:square] marker:text-sage">
                                        {section.items.map((item) =>
                                            typeof item === "string" ? (
                                                <li key={item}>{item}</li>
                                            ) : (
                                                <li key={item[0]}>
                                                    <strong className="font-medium text-ink">{item[0]}</strong>
                                                    {item[1].startsWith("(") ? " " : ": "}
                                                    {item[1]}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}
                                {section.after?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                                {section.link && (
                                    <p>
                                        <Link
                                            href={section.link.href}
                                            className="text-ink underline underline-offset-4 transition-colors hover:text-sage-deep"
                                        >
                                            {section.link.label}
                                        </Link>
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>

                <div className="mt-20 border-t border-neutral-300 pt-8">
                    <Link href="/" className="text-sm text-neutral-800 transition-colors hover:text-neutral-900">
                        {t.legal.backHome}
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    )
}
