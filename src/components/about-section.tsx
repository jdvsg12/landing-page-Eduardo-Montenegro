"use client"

import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"

type Block = {
    title: string
    body: string
}

function splitParagraphs(text: string) {
    return text
        .split("\n\n")
        .map((part) => part.trim())
        .filter(Boolean)
}

function chunk<T>(items: T[], size: number) {
    const groups: T[][] = []
    for (let index = 0; index < items.length; index += size) {
        groups.push(items.slice(index, index + size))
    }
    return groups
}

export function AboutSection() {
    const { language } = useLanguage()
    const t = getTranslation(language)

    const aboutBlocks: Block[] = splitParagraphs(t.about.description).map((body, index) => ({
        title: t.about.passageTitles[index] ?? t.about.title,
        body,
    }))

    const profileParts = splitParagraphs(t.profile.description)
    const closingTitle = t.profile.passageTitles.at(-1) ?? ""
    const lastPart = profileParts.at(-1) ?? ""
    const closingIsTitle =
        closingTitle.length > 0 &&
        lastPart.replace(/[.]/g, "").toLowerCase() === closingTitle.replace(/[.]/g, "").toLowerCase()
    const profileBodies = closingIsTitle ? profileParts.slice(0, -1) : profileParts

    const profileBlocks: Block[] = profileBodies.map((body, index) => ({
        title: t.profile.passageTitles[index] ?? t.profile.title,
        body,
    }))

    const screens = [aboutBlocks, ...chunk(profileBlocks, 2)].filter((screen) => screen.length > 0)

    return (
        <section id="about" className="relative scroll-mt-20 bg-paper">
            <div className="lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <aside className="flex flex-col justify-center border-b border-sage/30 px-6 py-16 sm:px-10 lg:sticky lg:top-0 lg:h-svh lg:border-b-0 lg:border-r lg:px-16 xl:px-24">
                    <h2 className="max-w-[8ch] font-serif text-[clamp(3.75rem,10vw,7.5rem)] font-light italic leading-[0.9] text-sage-ink">
                        {t.about.title}
                    </h2>
                </aside>

                <div>
                    {screens.map((blocks, screenIndex) => (
                        <article
                            key={blocks[0]?.title || screenIndex}
                            className={`flex flex-col justify-center px-6 py-20 sm:px-10 lg:min-h-svh lg:px-16 xl:px-24 ${
                                screenIndex < screens.length - 1 ? "border-b border-sage/30" : ""
                            }`}
                        >
                            {blocks.map((block, blockIndex) => (
                                <div key={`${block.title}-${blockIndex}`} className={blockIndex > 0 ? "mt-12" : ""}>
                                    {block.title ? (
                                        <h3 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] font-light italic leading-[1.1] text-sage-ink">
                                            {block.title}
                                        </h3>
                                    ) : null}
                                    <p className={`max-w-[38rem] text-lg leading-[1.7] text-ink ${block.title ? "mt-6" : "mt-8"}`}>
                                        {block.body}
                                    </p>
                                </div>
                            ))}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
