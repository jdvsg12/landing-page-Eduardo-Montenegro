"use client"

import { useState } from "react"
import type { HeroContent } from "@/lib/site-content"
import type { LocalizedText } from "@/lib/i18n-field"
import type { Language } from "@/lib/translations"
import {
  FallbackHint,
  Field,
  ImageField,
  LocaleSwitcher,
  Panel,
  SaveBar,
  inputClass,
  missingLocales,
  useContentEditor,
} from "@/components/admin/admin-ui"

export function HeroEditor({ hero }: { hero: HeroContent }) {
  const [locale, setLocale] = useState<Language>("es")
  const { value, update, save, status, dirty } = useContentEditor("hero", hero)

  const setText = (field: "title" | "subtitle" | "marquee" | "imageAlt", text: string) =>
    update((prev) => ({ ...prev, [field]: { ...(prev[field] as LocalizedText), [locale]: text } }))

  const L = locale.toUpperCase()

  return (
    <div className="space-y-6">
      <LocaleSwitcher
        locale={locale}
        onChange={setLocale}
        missing={missingLocales([value.title, value.subtitle, value.imageAlt])}
      />

      <Panel title="Retrato">
        <ImageField
          label="Imagen del hero"
          value={value.image}
          onChange={(image) => update((prev) => ({ ...prev, image }))}
          prefix="site/hero"
          hint="Se usa en todas las pantallas. Funciona mejor un PNG vertical con fondo transparente, recortado a la altura de la cintura; en escritorio se apoya abajo y en mobile llena la pantalla."
          previewClassName="h-56 w-auto max-w-full bg-sage object-contain"
        />
        <Field label={`Descripción de la imagen (${L})`} hint="Para lectores de pantalla y buscadores.">
          <input
            type="text"
            value={value.imageAlt[locale] ?? ""}
            onChange={(e) => setText("imageAlt", e.target.value)}
            className={inputClass}
          />
        </Field>
      </Panel>

      <Panel title={`Textos (${L})`}>
        <Field label="Título" hint={<FallbackHint locale={locale} />}>
          <input
            type="text"
            value={value.title[locale] ?? ""}
            onChange={(e) => setText("title", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Subtítulo">
          <input
            type="text"
            value={value.subtitle[locale] ?? ""}
            onChange={(e) => setText("subtitle", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="Texto deslizante"
          hint="Se repite en loop en la parte inferior, en letras grandes. Mejor corto: un nombre o una frase de 2 a 4 palabras."
        >
          <input
            type="text"
            value={value.marquee[locale] ?? ""}
            onChange={(e) => setText("marquee", e.target.value)}
            placeholder={locale === "es" ? "EDUARDO MONTENEGRO" : value.marquee.es}
            className={inputClass}
          />
        </Field>
      </Panel>

      <Panel title="Vista previa">
        <div className="relative overflow-hidden bg-sage px-6 pb-4 pt-10 text-center text-white">
          <p className="text-lg font-medium tracking-wide underline decoration-1 underline-offset-[0.35em]">
            {value.title[locale] || value.title.es}
          </p>
          <p className="mt-2 text-sm text-white/90">{value.subtitle[locale] || value.subtitle.es}</p>
          <p className="mt-8 whitespace-nowrap text-4xl font-bold tracking-tight">
            {value.marquee[locale] || value.marquee.es} — {value.marquee[locale] || value.marquee.es}
          </p>
        </div>
      </Panel>

      <SaveBar status={status} dirty={dirty} onSave={save} previewHref="/" />
    </div>
  )
}
