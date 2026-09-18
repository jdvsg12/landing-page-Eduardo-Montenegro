import type { ReactNode } from "react"

type Tone = "ink" | "white"

const toneClass: Record<Tone, string> = {
    ink: "text-sage-ink",
    white: "text-white",
}

/** Tamaño y tipografía compartidos por los títulos de sección (Sobre mí, Servicios, FAQ). */
export function sectionHeadingClassName(tone: Tone = "ink", className = "") {
    return `font-serif text-4xl font-light italic leading-[1.05] sm:text-5xl lg:text-6xl ${toneClass[tone]} ${className}`.trim()
}

export function SectionHeading({
    children,
    as: Tag = "h2",
    tone = "ink",
    className = "",
}: {
    children: ReactNode
    as?: "h1" | "h2" | "h3"
    tone?: Tone
    className?: string
}) {
    return <Tag className={sectionHeadingClassName(tone, className)}>{children}</Tag>
}
