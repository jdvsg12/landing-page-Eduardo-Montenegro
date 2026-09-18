"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Taller, TallerBlock, TallerI18n } from "@/lib/talleres"
import { titleToSlug } from "@/lib/talleres"
import { galleryFromBlocks, isImageBlock, mergeGalleryIntoBlocks } from "@/lib/content-blocks"
import { emptyLocalizedText, type LocalizedText } from "@/lib/i18n-field"
import type { Language } from "@/lib/translations"
import { ContentBlocksEditor } from "@/components/admin/ContentBlocksEditor"
import { AiTranslateButton, useAiTranslate } from "@/components/admin/AiTranslateButton"
import {
  FallbackHint,
  Field,
  ImageField,
  LocaleSwitcher,
  Panel,
  VisibilityToggle,
  buttonClass,
  inputClass,
  missingLocales,
  primaryButtonClass,
} from "@/components/admin/admin-ui"

interface TallerFormProps {
  initialData?: Partial<Taller>
  mode: "create" | "edit"
}

function patchLocalized(field: LocalizedText | undefined, en: string | undefined, fr: string | undefined): LocalizedText {
  return { ...(field ?? emptyLocalizedText()), en: en ?? field?.en, fr: fr ?? field?.fr }
}

export function TallerForm({ initialData, mode }: TallerFormProps) {
  const router = useRouter()
  const [locale, setLocale] = useState<Language>("es")
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [date, setDate] = useState(initialData?.date ?? "")
  const [cost, setCost] = useState(initialData?.cost ?? "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "")
  const [i18n, setI18n] = useState<TallerI18n>(initialData?.i18n ?? {})
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "")
  const [blocks, setBlocks] = useState<TallerBlock[]>(
    mergeGalleryIntoBlocks(initialData?.blocks ?? [], initialData?.images ?? [])
  )
  const [published, setPublished] = useState(initialData?.published ?? true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const { translate, translating, error: translateError, setError: setTranslateError } = useAiTranslate()

  const slug = titleToSlug(title)
  const L = locale.toUpperCase()

  const titleValue = locale === "es" ? title : (i18n.title?.[locale] ?? "")
  const excerptValue = locale === "es" ? excerpt : (i18n.excerpt?.[locale] ?? "")
  const costValue = locale === "es" ? cost : (i18n.cost?.[locale] ?? "")

  const handleAiTranslate = async () => {
    setTranslateError("")
    const fields: Record<string, string> = {}
    if (title.trim()) fields.title = title
    if (excerpt.trim()) fields.excerpt = excerpt
    if (cost.trim()) fields.cost = cost
    blocks.forEach((block, index) => {
      if (isImageBlock(block)) {
        if (block.alt.es?.trim()) fields[`block-${index}-alt`] = block.alt.es
        return
      }
      if (block.content.es?.trim()) fields[`block-${index}`] = block.content.es
    })
    const result = await translate(fields)
    if (!result) return
    const { en, fr } = result
    setI18n({
      title: patchLocalized(i18n.title, en.title, fr.title),
      excerpt: patchLocalized(i18n.excerpt, en.excerpt, fr.excerpt),
      cost: patchLocalized(i18n.cost, en.cost, fr.cost),
    })
    setBlocks((prev) =>
      prev.map((block, index) => {
        if (isImageBlock(block)) {
          return { ...block, alt: patchLocalized(block.alt, en[`block-${index}-alt`], fr[`block-${index}-alt`]) }
        }
        return { ...block, content: patchLocalized(block.content, en[`block-${index}`], fr[`block-${index}`]) }
      })
    )
    setLocale("en")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("El título en español es obligatorio.")
      setLocale("es")
      return
    }

    const payload = {
      title,
      date,
      cost,
      excerpt,
      i18n,
      coverImage: coverImage || undefined,
      blocks,
      images: galleryFromBlocks(blocks),
      published,
    }

    setSaving(true)
    try {
      const res =
        mode === "create"
          ? await fetch("/api/talleres", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/talleres/${initialData?.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })

      if (res.ok) {
        router.push("/admin/talleres")
        router.refresh()
        return
      }

      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "No se pudo guardar el taller")
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 pb-24">
      <LocaleSwitcher
        locale={locale}
        onChange={setLocale}
        missing={missingLocales([
          { es: title, en: i18n.title?.en, fr: i18n.title?.fr },
          { es: excerpt, en: i18n.excerpt?.en, fr: i18n.excerpt?.fr },
          ...blocks.flatMap((block) => (isImageBlock(block) ? [block.alt] : [block.content])),
        ])}
      />

      {(error || translateError) && (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || translateError}
        </p>
      )}

      <Panel title="Visibilidad">
        <Field
          label="Visibilidad"
          hint={
            published
              ? "Se ve en la home y en su página."
              : "Queda guardado pero oculto: solo tú lo ves con sesión iniciada."
          }
        >
          <VisibilityToggle published={published} onChange={setPublished} />
        </Field>
      </Panel>

      <Panel title="Información básica">
        <Field
          label={`Título (${L})`}
          hint={
            <>
              {slug && <span className="font-mono">/talleres/{slug}</span>} <FallbackHint locale={locale} />
            </>
          }
        >
          <input
            type="text"
            value={titleValue}
            onChange={(e) => {
              const value = e.target.value
              if (locale === "es") {
                setTitle(value)
                return
              }
              setI18n((prev) => ({ ...prev, title: { ...prev.title, [locale]: value } }))
            }}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fecha">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label={`Costo (${L})`}>
            <input
              type="text"
              value={costValue}
              onChange={(e) => {
                const value = e.target.value
                if (locale === "es") {
                  setCost(value)
                  return
                }
                setI18n((prev) => ({ ...prev, cost: { ...prev.cost, [locale]: value } }))
              }}
              placeholder="Ej: COP 120.000 o Gratuito"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label={`Extracto (${L})`}>
          <textarea
            value={excerptValue}
            onChange={(e) => {
              const value = e.target.value
              if (locale === "es") {
                setExcerpt(value)
                return
              }
              setI18n((prev) => ({ ...prev, excerpt: { ...prev.excerpt, [locale]: value } }))
            }}
            rows={2}
            className={`${inputClass} text-sm`}
          />
        </Field>

        <ImageField
          label="Imagen de portada"
          value={coverImage}
          onChange={setCoverImage}
          prefix="talleres/covers"
        />
      </Panel>

      <Panel
        title={`Contenido de la página interna (${L})`}
        description="Títulos, párrafos e imágenes en el orden en que se verán. Usa el menú de posición para reordenar."
        actions={
          <AiTranslateButton onClick={handleAiTranslate} busy={translating} disabled={!title.trim()} />
        }
      >
        <p className="text-xs text-neutral-500">
          Completa el español y pulsa “Autocompletar con IA” para rellenar inglés y francés.
        </p>
        <ContentBlocksEditor
          blocks={blocks}
          onChange={setBlocks}
          locale={locale}
          uploadPrefix="talleres/blocks"
        />
      </Panel>

      <div className="sticky bottom-0 z-20 -mx-4 flex justify-end gap-3 border-t border-neutral-200 bg-paper/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <button type="button" onClick={() => router.back()} className={buttonClass}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Guardando..." : mode === "create" ? "Crear taller" : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}
