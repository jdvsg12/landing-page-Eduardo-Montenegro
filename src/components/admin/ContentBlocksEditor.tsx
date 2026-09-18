"use client"

import type { Language } from "@/lib/translations"
import type { ContentBlock, ContentBlockType } from "@/lib/content-blocks"
import { emptyImageBlock, emptyTextBlock, isImageBlock, moveItem, moveItemTo } from "@/lib/content-blocks"
import {
  Field,
  ImageField,
  ListControls,
  buttonClass,
  inputClass,
} from "@/components/admin/admin-ui"

interface ContentBlocksEditorProps {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
  locale: Language
  uploadPrefix: string
}

const TYPE_LABEL: Record<ContentBlockType, string> = {
  heading: "Título",
  paragraph: "Párrafo",
  image: "Imagen",
}

function asType(block: ContentBlock, type: ContentBlockType): ContentBlock {
  if (block.type === type) return block
  if (type === "image") return emptyImageBlock()
  if (block.type === "image") return emptyTextBlock(type)
  return { ...block, type }
}

export function ContentBlocksEditor({
  blocks,
  onChange,
  locale,
  uploadPrefix,
}: ContentBlocksEditorProps) {
  const update = (index: number, next: ContentBlock) =>
    onChange(blocks.map((block, i) => (i === index ? next : block)))

  return (
    <div className="space-y-4">
      {blocks.length === 0 && (
        <p className="text-sm text-neutral-500">Todavía no hay bloques. El orden de esta lista es el de la página interna.</p>
      )}
      {blocks.map((block, index) => (
        <div key={index} className="border border-neutral-200 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor={`block-type-${index}`}>
                Tipo de bloque
              </label>
              <select
                id={`block-type-${index}`}
                value={block.type}
                onChange={(e) => update(index, asType(block, e.target.value as ContentBlockType))}
                className="border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-700 focus:border-ink focus:outline-none"
              >
                <option value="heading">{TYPE_LABEL.heading}</option>
                <option value="paragraph">{TYPE_LABEL.paragraph}</option>
                <option value="image">{TYPE_LABEL.image}</option>
              </select>
              <label className="sr-only" htmlFor={`block-pos-${index}`}>
                Posición del bloque
              </label>
              <select
                id={`block-pos-${index}`}
                value={index}
                onChange={(e) => onChange(moveItemTo(blocks, index, Number(e.target.value)))}
                className="border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-700 focus:border-ink focus:outline-none"
              >
                {blocks.map((_, position) => (
                  <option key={position} value={position}>
                    Posición {position + 1}
                  </option>
                ))}
              </select>
            </div>
            <ListControls
              label="bloque"
              onUp={() => onChange(moveItem(blocks, index, -1))}
              onDown={() => onChange(moveItem(blocks, index, 1))}
              onRemove={() => onChange(blocks.filter((_, i) => i !== index))}
              disableUp={index === 0}
              disableDown={index === blocks.length - 1}
            />
          </div>

          {isImageBlock(block) ? (
            <div className="space-y-3">
              <ImageField
                label={`Imagen ${index + 1}`}
                value={block.url}
                onChange={(url) => update(index, { ...block, url })}
                prefix={uploadPrefix}
                previewClassName="h-40 w-full max-w-md object-cover"
              />
              <Field label={`Texto alternativo (${locale.toUpperCase()})`}>
                <input
                  type="text"
                  value={block.alt[locale] ?? ""}
                  onChange={(e) =>
                    update(index, { ...block, alt: { ...block.alt, [locale]: e.target.value } })
                  }
                  placeholder="Describe la imagen"
                  className={`${inputClass} text-sm`}
                />
              </Field>
            </div>
          ) : (
            <textarea
              value={block.content[locale] ?? ""}
              onChange={(e) =>
                update(index, { ...block, content: { ...block.content, [locale]: e.target.value } })
              }
              rows={block.type === "heading" ? 1 : 4}
              className={`${inputClass} ${block.type === "heading" ? "text-lg font-medium" : "text-sm leading-relaxed"}`}
            />
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([...blocks, emptyTextBlock("heading")])}
          className={buttonClass}
        >
          + Título
        </button>
        <button
          type="button"
          onClick={() => onChange([...blocks, emptyTextBlock("paragraph")])}
          className={buttonClass}
        >
          + Párrafo
        </button>
        <button
          type="button"
          onClick={() => onChange([...blocks, emptyImageBlock()])}
          className={buttonClass}
        >
          + Imagen
        </button>
      </div>
    </div>
  )
}
