"use client"

import { useLanguage } from "@/lib/language-context"
import { pickLocale } from "@/lib/i18n-field"
import type { AboutContent } from "@/lib/site-content"
import { SectionHeading } from "@/components/section-heading"

type Block = {
    title: string
    paragraphs: string[]
}

function splitParagraphs(text: string) {
    return text
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean)
}

export function AboutSection({ content }: { content: AboutContent }) {
    const { language } = useLanguage()

    const screens: Block[][] = content.screens
        .map((screen) =>
            screen.blocks
                .map((block) => ({
                    title: pickLocale(block.title, language),
                    paragraphs: splitParagraphs(pickLocale(block.body, language)),
                }))
                .filter((block) => block.title || block.paragraphs.length > 0)
        )
        .filter((blocks) => blocks.length > 0)

    return (
        <section id="about" className="relative scroll-mt-20 bg-paper">
            <div className="lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <aside className="sticky top-20 z-10 flex flex-col justify-center border-b border-sage/30 bg-paper px-6 py-8 sm:px-10 sm:py-10 lg:top-0 lg:h-svh lg:border-b-0 lg:border-r lg:px-16 lg:py-16 xl:px-24">
                    <SectionHeading className="max-w-[8ch]">{pickLocale(content.title, language)}</SectionHeading>
                </aside>

                <div>
                    {screens.map((blocks, screenIndex) => (
                        <article
                            key={screenIndex}
                            className={`flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-20 lg:min-h-svh lg:px-16 xl:px-24 ${
                                screenIndex < screens.length - 1 ? "border-b border-sage/30" : ""
                            }`}
                        >
                            {blocks.map((block, blockIndex) => (
                                <div key={blockIndex} className={blockIndex > 0 ? "mt-12" : ""}>
                                    {block.title ? (
                                        <h3 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] font-light italic leading-[1.1] text-sage-ink">
                                            {block.title}
                                        </h3>
                                    ) : null}
                                    <div className={`max-w-[38rem] space-y-5 ${block.title ? "mt-6" : "mt-8"}`}>
                                        {block.paragraphs.map((paragraph, paragraphIndex) => (
                                            <p key={paragraphIndex} className="text-lg leading-[1.7] text-ink">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
