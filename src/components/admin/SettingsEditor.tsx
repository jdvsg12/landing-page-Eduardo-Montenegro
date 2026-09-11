"use client"

import { useState } from "react"
import type { LegalContent, SeoContent } from "@/lib/site-content"
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

const TITLE_LIMIT = 60
const DESCRIPTION_LIMIT = 160

function Counter({ value, limit }: { value: string; limit: number }) {
  return (
    <span className={value.length > limit ? "text-amber-700" : undefined}>
      {value.length} / {limit} caracteres recomendados
    </span>
  )
}

export function SettingsEditor({ seo, legal }: { seo: SeoContent; legal: LegalContent }) {
  const [locale, setLocale] = useState<Language>("es")
  const seoEditor = useContentEditor("seo", seo)
  const legalEditor = useContentEditor("legal", legal)
  const L = locale.toUpperCase()

  const seoValue = seoEditor.value
  const legalValue = legalEditor.value

  const setSeoText = (field: "title" | "description" | "keywords", text: string) =>
    seoEditor.update((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: text } }))

  const setLegal = (field: keyof LegalContent, text: string) =>
    legalEditor.update((prev) => ({ ...prev, [field]: text }))

  const saveAll = async () => {
    await seoEditor.save()
    await legalEditor.save()
  }

  const statuses = [seoEditor.status, legalEditor.status]
  const status =
    statuses.find((s) => s.kind === "error") ??
    statuses.find((s) => s.kind === "saving") ??
    (statuses.every((s) => s.kind === "saved") ? statuses[0] : { kind: "idle" as const })

  const title = seoValue.title[locale] || seoValue.title.es || ""
  const description = seoValue.description[locale] || seoValue.description.es || ""
  const displayUrl = seoValue.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")

  return (
    <div className="space-y-6">
      <LocaleSwitcher
        locale={locale}
        onChange={setLocale}
        missing={missingLocales([seoValue.title, seoValue.description])}
      />

      <Panel title="Así se ve en Google">
        <div className="max-w-xl border border-neutral-200 bg-white p-4">
          <p className="truncate text-xs text-neutral-600">{displayUrl}</p>
          <p className="mt-1 truncate text-lg text-[#1a0dab]">{title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{description}</p>
        </div>
      </Panel>

      <Panel title={`SEO (${L})`}>
        <Field
          label="Título de la página"
          hint={
            <>
              <Counter value={seoValue.title[locale] ?? ""} limit={TITLE_LIMIT} />. <FallbackHint locale={locale} />
            </>
          }
        >
          <input
            type="text"
            value={seoValue.title[locale] ?? ""}
            onChange={(e) => setSeoText("title", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="Descripción"
          hint={<Counter value={seoValue.description[locale] ?? ""} limit={DESCRIPTION_LIMIT} />}
        >
          <textarea
            value={seoValue.description[locale] ?? ""}
            onChange={(e) => setSeoText("description", e.target.value)}
            rows={3}
            className={`${inputClass} text-sm`}
          />
        </Field>
        <Field label="Palabras clave" hint="Separadas por comas.">
          <input
            type="text"
            value={seoValue.keywords[locale] ?? ""}
            onChange={(e) => setSeoText("keywords", e.target.value)}
            className={inputClass}
          />
        </Field>
      </Panel>

      <Panel title="Sitio y redes sociales">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre del sitio">
            <input
              type="text"
              value={seoValue.siteName}
              onChange={(e) => seoEditor.update((prev) => ({ ...prev, siteName: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Dominio" hint="Con https://, por ejemplo https://www.eduardomontenegroflorez.com">
            <input
              type="url"
              value={seoValue.siteUrl}
              onChange={(e) => seoEditor.update((prev) => ({ ...prev, siteUrl: e.target.value }))}
              className={inputClass}
            />
          </Field>
        </div>
        <ImageField
          label="Imagen al compartir (WhatsApp, Facebook, LinkedIn)"
          value={seoValue.ogImage}
          onChange={(ogImage) => seoEditor.update((prev) => ({ ...prev, ogImage }))}
          prefix="site/seo"
          hint="Tamaño ideal: 1200 × 630 px."
          previewClassName="aspect-[1200/630] w-full max-w-sm object-cover"
        />
      </Panel>

      <Panel
        title="Datos legales"
        description="Aparecen como responsable en la política de privacidad y en los términos y condiciones. Los campos vacíos no se muestran."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre completo">
            <input
              type="text"
              value={legalValue.ownerName}
              onChange={(e) => setLegal("ownerName", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Documento de identidad" hint="Cédula o NIT. Lo exige la Ley 1581 para identificar al responsable.">
            <input
              type="text"
              value={legalValue.documentId}
              onChange={(e) => setLegal("documentId", e.target.value)}
              placeholder="C.C. 00.000.000"
              className={inputClass}
            />
          </Field>
          <Field label="Domicilio" hint="Ciudad y dirección de notificación.">
            <input
              type="text"
              value={legalValue.address}
              onChange={(e) => setLegal("address", e.target.value)}
              placeholder="Bogotá D.C., Colombia"
              className={inputClass}
            />
          </Field>
          <Field label="Correo para solicitudes">
            <input
              type="email"
              value={legalValue.email}
              onChange={(e) => setLegal("email", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Teléfono">
            <input
              type="text"
              value={legalValue.phone}
              onChange={(e) => setLegal("phone", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Fecha de última actualización" hint="Cámbiala cuando modifiques estos datos.">
            <input
              type="date"
              value={legalValue.updatedAt}
              onChange={(e) => setLegal("updatedAt", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <p className="text-sm text-neutral-500">
          Ver páginas:{" "}
          <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            Política de privacidad
          </a>{" "}
          ·{" "}
          <a href="/terminos" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            Términos y condiciones
          </a>
        </p>
      </Panel>

      <SaveBar status={status} dirty={seoEditor.dirty || legalEditor.dirty} onSave={saveAll} />
    </div>
  )
}
