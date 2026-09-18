"use client"

import { MediaImage } from "@/components/media-image"
import { pickLocale } from "@/lib/i18n-field"
import { isImageBlock, type ContentBlock } from "@/lib/content-blocks"
import type { Language } from "@/lib/translations"

export function PageContentBlocks({
  blocks,
  language,
  fallbackAlt,
  headingClassName,
  paragraphClassName,
}: {
  blocks: ContentBlock[]
  language: Language
  fallbackAlt: string
  headingClassName: string
  paragraphClassName: string
}) {
  return (
    <>
      {blocks.map((block, index) => {
        if (isImageBlock(block)) {
          if (!block.url.trim()) return null
          return (
            <figure key={index} className="relative my-10 aspect-[16/10] overflow-hidden">
              <MediaImage
                src={block.url}
                alt={pickLocale(block.alt, language) || fallbackAlt}
                sizes="(min-width: 768px) 42rem, 100vw"
              />
            </figure>
          )
        }

        const content = pickLocale(block.content, language)
        if (!content) return null
        return block.type === "heading" ? (
          <h2 key={index} className={headingClassName}>
            {content}
          </h2>
        ) : (
          <p key={index} className={paragraphClassName}>
            {content}
          </p>
        )
      })}
    </>
  )
}
