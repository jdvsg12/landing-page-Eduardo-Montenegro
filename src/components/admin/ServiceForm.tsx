"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Service, ServiceBlock } from "@/lib/services"
import type { LocalizedText } from "@/lib/i18n-field"
import { emptyLocalizedText } from "@/lib/i18n-field"
import { galleryFromBlocks, mergeGalleryIntoBlocks } from "@/lib/content-blocks"
import { isImageBlock } from "@/lib/content-blocks"
import { titleToSlug } from "@/lib/talleres"
import type { Language } from "@/lib/translations"
import { ContentBlocksEditor } from "@/components/admin/ContentBlocksEditor"
import { AiTranslateButton, useAiTranslate } from "@/components/admin/AiTranslateButton"
import {
  Checkbox,
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

const DEFAULT_WHATSAPP = "+573142793431"

interface ServiceFormProps {
  initialData?: Partial<Service>
  mode: "create" | "edit"
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export function ServiceForm({ initialData, mode }: ServiceFormProps) {
  const router = useRouter()

  /** Idioma que se está editando; aplica a todos los campos traducibles del formulario. */
  const [locale, setLocale] = useState<Language>("es")

  const [title, setTitle] = useState<LocalizedText>(initialData?.title ?? emptyLocalizedText())
  const [kicker, setKicker] = useState<LocalizedText>(initialData?.kicker ?? emptyLocalizedText())
  const [excerpt, setExcerpt] = useState<LocalizedText>(initialData?.excerpt ?? emptyLocalizedText())
  const [cardImage, setCardImage] = useState(initialData?.cardImage ?? "")
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "")
  const [blocks, setBlocks] = useState<ServiceBlock[]>(
    mergeGalleryIntoBlocks(initialData?.blocks ?? [], initialData?.images ?? [])
  )
  const [showWhatsapp, setShowWhatsapp] = useState(initialData?.showWhatsapp ?? true)
  // Un servicio nuevo arranca con el WhatsApp del consultorio para que el botón por defecto funcione.
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? (mode === "create" ? DEFAULT_WHATSAPP : ""))
  const [waMessage, setWaMessage] = useState<LocalizedText>(initialData?.waMessage ?? emptyLocalizedText())
  const [showForm, setShowForm] = useState(initialData?.showForm ?? false)
  const [showCalendar, setShowCalendar] = useState(initialData?.showCalendar ?? false)
  const [calendarUrl, setCalendarUrl] = useState(initialData?.calendarUrl ?? "")
  const [showRegistration, setShowRegistration] = useState(initialData?.showRegistration ?? false)
  const [registrationUrl, setRegistrationUrl] = useState(initialData?.registrationUrl ?? "")
  const [registrationLabel, setRegistrationLabel] = useState<LocalizedText>(
    initialData?.registrationLabel ?? emptyLocalizedText()
  )
  const [position, setPosition] = useState(initialData?.position ?? 0)
  const [published, setPublished] = useState(initialData?.published ?? true)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { translate, translating, error: translateError, setError: setTranslateError } = useAiTranslate()

  const slug = mode === "create" ? titleToSlug(title.es ?? "") : (initialData?.slug ?? "")

  const setLocalized = (
    setter: React.Dispatch<React.SetStateAction<LocalizedText>>,
    value: string
  ) => setter((prev) => ({ ...prev, [locale]: value }))

  const applyLocalePatch = (field: LocalizedText, key: string, en: Record<string, string>, fr: Record<string, string>) => ({
    ...field,
    en: en[key] ?? field.en,
    fr: fr[key] ?? field.fr,
  })

  const handleAiTranslate = async () => {
    setTranslateError("")
    const fields: Record<string, string> = {}
    if (title.es?.trim()) fields.title = title.es
    if (kicker.es?.trim()) fields.kicker = kicker.es
    if (excerpt.es?.trim()) fields.excerpt = excerpt.es
    if (waMessage.es?.trim()) fields.waMessage = waMessage.es
    if (registrationLabel.es?.trim()) fields.registrationLabel = registrationLabel.es
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
    setTitle((prev) => applyLocalePatch(prev, "title", en, fr))
    setKicker((prev) => applyLocalePatch(prev, "kicker", en, fr))
    setExcerpt((prev) => applyLocalePatch(prev, "excerpt", en, fr))
    setWaMessage((prev) => applyLocalePatch(prev, "waMessage", en, fr))
    setRegistrationLabel((prev) => applyLocalePatch(prev, "registrationLabel", en, fr))
    setBlocks((prev) =>
      prev.map((block, index) => {
        if (isImageBlock(block)) {
          return { ...block, alt: applyLocalePatch(block.alt, `block-${index}-alt`, en, fr) }
        }
        return { ...block, content: applyLocalePatch(block.content, `block-${index}`, en, fr) }
      })
    )
    setLocale("en")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.es?.trim()) {
      setError("El título en español es obligatorio: define el slug y es el respaldo de los demás idiomas.")
      setLocale("es")
      return
    }
    if (showWhatsapp && !whatsapp.trim()) {
      setError("Activaste el botón de WhatsApp: escribe el número.")
      return
    }
    if (showCalendar && !isHttpUrl(calendarUrl)) {
      setError("Activaste el calendario: pega un enlace válido que empiece por https://")
      return
    }
    if (showRegistration && !isHttpUrl(registrationUrl)) {
      setError("Activaste el link de inscripción: pega un enlace válido que empiece por https://")
      return
    }

    const payload = {
      title,
      kicker,
      excerpt,
      cardImage,
      coverImage,
      blocks,
      images: galleryFromBlocks(blocks),
      showWhatsapp,
      whatsapp,
      waMessage,
      showForm,
      showCalendar,
      calendarUrl,
      showRegistration,
      registrationUrl,
      registrationLabel,
      position,
      published,
    }

    setSaving(true)
    try {
      const res =
        mode === "create"
          ? await fetch("/api/services", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/services/${initialData?.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })

      if (res.ok) {
        router.push("/admin/servicios")
        router.refresh()
        return
      }

      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "No se pudo guardar el servicio")
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setSaving(false)
    }
  }

  const L = locale.toUpperCase()

  return (
    // noValidate: los errores los muestra el formulario, en español y en un solo lugar.
    <form onSubmit={handleSubmit} noValidate className="space-y-6 pb-24">
      <LocaleSwitcher
        locale={locale}
        onChange={setLocale}
        missing={missingLocales([
          title,
          kicker,
          excerpt,
          waMessage,
          registrationLabel,
          ...blocks.flatMap((block) => (isImageBlock(block) ? [block.alt] : [block.content])),
        ])}
      />

      {(error || translateError) && (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || translateError}
        </p>
      )}

      <Panel title="Información básica">
        <Field
          label={`Título (${L})`}
          hint={
            <>
              {slug && <span className="font-mono">/servicios/{slug}</span>} <FallbackHint locale={locale} />
            </>
          }
        >
          <input
            type="text"
            value={title[locale] ?? ""}
            onChange={(e) => setLocalized(setTitle, e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label={`Bajada de la card (${L})`} hint="Texto corto debajo del título en la card de la home.">
          <input
            type="text"
            value={kicker[locale] ?? ""}
            onChange={(e) => setLocalized(setKicker, e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label={`Entradilla de la página interna (${L})`}>
          <textarea
            value={excerpt[locale] ?? ""}
            onChange={(e) => setLocalized(setExcerpt, e.target.value)}
            rows={3}
            className={`${inputClass} text-sm`}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Orden" hint="Los números más bajos aparecen primero.">
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
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
        </div>
      </Panel>

      <Panel title="Imágenes" description="La card y la página interna pueden usar fotos distintas.">
        <ImageField
          label="Foto de la card (home)"
          value={cardImage}
          onChange={setCardImage}
          prefix="services/covers"
          hint="Se recorta para llenar la card; funciona mejor una foto horizontal o cuadrada. Si la dejas vacía se usa la portada interna."
          previewClassName="h-48 w-full max-w-[16rem] object-cover"
        />
        <ImageField
          label="Portada de la página interna"
          value={coverImage}
          onChange={setCoverImage}
          prefix="services/covers"
          hint="Banda a todo el ancho debajo del título; usa una foto horizontal amplia (16:9 o más ancha)."
          previewClassName="h-40 w-full max-w-md object-cover"
        />
      </Panel>

      <Panel
        title="Botones y acciones"
        description="Elige qué aparece al final de la página del servicio. Puedes activar varios a la vez."
      >
        <div className="space-y-4 border-l-2 border-neutral-200 pl-4">
          <Checkbox
            checked={showWhatsapp}
            onChange={setShowWhatsapp}
            label="Botón de WhatsApp"
            description="Abre una conversación con un mensaje precargado."
          />
          {showWhatsapp && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Número de WhatsApp">
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+573142793431"
                  className={inputClass}
                />
              </Field>
              <Field label={`Mensaje precargado (${L})`}>
                <input
                  type="text"
                  value={waMessage[locale] ?? ""}
                  onChange={(e) => setLocalized(setWaMessage, e.target.value)}
                  placeholder="Hola, estoy interesado/a en..."
                  className={inputClass}
                />
              </Field>
            </div>
          )}
        </div>

        <div className="space-y-4 border-l-2 border-neutral-200 pl-4">
          <Checkbox
            checked={showForm}
            onChange={setShowForm}
            label="Formulario de inscripción"
            description="Formulario propio del sitio. Las respuestas quedan en el dashboard y llegan por correo."
          />
        </div>

        <div className="space-y-4 border-l-2 border-neutral-200 pl-4">
          <Checkbox
            checked={showCalendar}
            onChange={setShowCalendar}
            label="Botón de calendario"
            description="Enlace a tu agenda en línea (Google Calendar, Calendly, etc.) para reservar una cita."
          />
          {showCalendar && (
            <Field label="Enlace del calendario">
              <input
                type="url"
                value={calendarUrl}
                onChange={(e) => setCalendarUrl(e.target.value)}
                placeholder="https://calendar.app.google/..."
                className={inputClass}
              />
            </Field>
          )}
        </div>

        <div className="space-y-4 border-l-2 border-neutral-200 pl-4">
          <Checkbox
            checked={showRegistration}
            onChange={setShowRegistration}
            label="Link de inscripción externo"
            description="Botón hacia un formulario externo, por ejemplo el Google Form de inscripción al grupo de estudio."
          />
          {showRegistration && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Enlace de inscripción">
                <input
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://forms.gle/..."
                  className={inputClass}
                />
              </Field>
              <Field label={`Texto del botón (${L})`} hint="Si lo dejas vacío dice “Inscribirme”.">
                <input
                  type="text"
                  value={registrationLabel[locale] ?? ""}
                  onChange={(e) => setLocalized(setRegistrationLabel, e.target.value)}
                  placeholder="Inscribirme al grupo"
                  className={inputClass}
                />
              </Field>
            </div>
          )}
        </div>
      </Panel>

      <Panel
        title={`Contenido de la página interna (${L})`}
        description="Títulos, párrafos e imágenes en el orden en que se verán. Usa el menú de posición para reordenar."
        actions={
          <AiTranslateButton
            onClick={handleAiTranslate}
            busy={translating}
            disabled={!title.es?.trim()}
          />
        }
      >
        <p className="text-xs text-neutral-500">
          Completa el español y pulsa “Autocompletar con IA” para rellenar inglés y francés sin perder el orden de los bloques.
        </p>
        <ContentBlocksEditor
          blocks={blocks}
          onChange={setBlocks}
          locale={locale}
          uploadPrefix="services/blocks"
        />
      </Panel>

      <div className="sticky bottom-0 z-20 -mx-4 flex justify-end gap-3 border-t border-neutral-200 bg-paper/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <button type="button" onClick={() => router.back()} className={buttonClass}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Guardando..." : mode === "create" ? "Crear servicio" : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}
