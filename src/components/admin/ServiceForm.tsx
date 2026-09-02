"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Service, ServiceBlock, ServiceImage, ServiceCtaType } from "@/lib/services"
import type { LocalizedText } from "@/lib/i18n-field"
import { emptyLocalizedText } from "@/lib/i18n-field"
import { titleToSlug } from "@/lib/talleres"
import type { Language } from "@/lib/translations"

const LOCALES: { code: Language; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
]

interface ServiceFormProps {
  initialData?: Partial<Service>
  mode: "create" | "edit"
}

export function ServiceForm({ initialData, mode }: ServiceFormProps) {
  const router = useRouter()

  /** Idioma que se está editando; aplica a todos los campos traducibles del formulario. */
  const [locale, setLocale] = useState<Language>("es")

  const [title, setTitle] = useState<LocalizedText>(initialData?.title ?? emptyLocalizedText())
  const [kicker, setKicker] = useState<LocalizedText>(initialData?.kicker ?? emptyLocalizedText())
  const [excerpt, setExcerpt] = useState<LocalizedText>(initialData?.excerpt ?? emptyLocalizedText())
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "")
  const [blocks, setBlocks] = useState<ServiceBlock[]>(initialData?.blocks ?? [])
  const [images, setImages] = useState<ServiceImage[]>(initialData?.images ?? [])
  const [ctaType, setCtaType] = useState<ServiceCtaType>(initialData?.ctaType ?? "whatsapp")
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "")
  const [waMessage, setWaMessage] = useState<LocalizedText>(initialData?.waMessage ?? emptyLocalizedText())
  const [position, setPosition] = useState(initialData?.position ?? 0)
  const [published, setPublished] = useState(initialData?.published ?? true)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const slug = mode === "create" ? titleToSlug(title.es ?? "") : (initialData?.slug ?? "")

  const setLocalized = (
    setter: React.Dispatch<React.SetStateAction<LocalizedText>>,
    value: string
  ) => setter((prev) => ({ ...prev, [locale]: value }))

  const filledLocales = (field: LocalizedText) =>
    LOCALES.filter((l) => field[l.code]?.trim()).map((l) => l.code)

  const addBlock = (type: ServiceBlock["type"]) => {
    setBlocks([...blocks, { type, content: emptyLocalizedText() }])
  }

  const updateBlockType = (index: number, type: ServiceBlock["type"]) => {
    setBlocks(blocks.map((b, i) => (i === index ? { ...b, type } : b)))
  }

  const updateBlockContent = (index: number, value: string) => {
    setBlocks(
      blocks.map((b, i) => (i === index ? { ...b, content: { ...b.content, [locale]: value } } : b))
    )
  }

  const removeBlock = (index: number) => setBlocks(blocks.filter((_, i) => i !== index))

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= blocks.length) return
    const copy = [...blocks]
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
    setBlocks(copy)
  }

  const addImage = () => setImages([...images, { url: "", alt: "" }])

  const updateImage = (index: number, field: Partial<ServiceImage>) => {
    setImages(images.map((img, i) => (i === index ? { ...img, ...field } : img)))
  }

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index))

  const handleUpload = async (file: File, prefix: string): Promise<string | null> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("prefix", prefix)
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      if (!res.ok) return null
      const { url } = await res.json()
      return url
    } catch {
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFilePick = async (
    e: React.ChangeEvent<HTMLInputElement>,
    prefix: string,
    onUrl: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await handleUpload(file, prefix)
    if (url) onUrl(url)
    e.target.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.es?.trim()) {
      setError("El título en español es obligatorio: define el slug y es el fallback de los demás idiomas.")
      setLocale("es")
      return
    }

    const payload = {
      title,
      kicker,
      excerpt,
      coverImage: coverImage || undefined,
      blocks,
      images: images.filter((img) => img.url),
      ctaType,
      whatsapp: ctaType === "whatsapp" ? whatsapp : "",
      waMessage,
      position,
      published,
    }

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
      router.push("/admin")
      router.refresh()
      return
    }

    const data = await res.json().catch(() => ({}))
    setError(data.error ?? "No se pudo guardar el servicio")
  }

  const inputClass =
    "w-full border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 focus:border-neutral-400 focus:outline-none"

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Selector de idioma: cambia qué versión se está editando en todos los campos traducibles */}
      <div className="sticky top-0 z-10 flex items-center justify-between border border-neutral-200 bg-white p-4">
        <span className="text-sm font-medium uppercase tracking-wider text-neutral-500">
          Editando en
        </span>
        <div className="flex gap-2">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLocale(l.code)}
              className={`border px-4 py-2 text-sm transition-colors duration-200 ${
                locale === l.code
                  ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {l.label}
              {l.code !== "es" && !filledLocales(title).includes(l.code) && (
                <span className="ml-2 text-xs opacity-60">•</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* Información básica */}
      <div className="border border-neutral-200 bg-white p-6">
        <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-neutral-500">
          Información básica
        </h3>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Título ({locale.toUpperCase()})
          </label>
          <input
            type="text"
            value={title[locale] ?? ""}
            onChange={(e) => setLocalized(setTitle, e.target.value)}
            className={inputClass}
          />
          {slug && <p className="mt-1 font-mono text-xs text-neutral-400">/servicios/{slug}</p>}
          {locale !== "es" && (
            <p className="mt-1 text-xs text-neutral-400">
              Si lo dejas vacío se muestra la versión en español.
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Bajada de la card ({locale.toUpperCase()})
          </label>
          <input
            type="text"
            value={kicker[locale] ?? ""}
            onChange={(e) => setLocalized(setKicker, e.target.value)}
            placeholder="Texto corto que acompaña al título en la card"
            className={inputClass}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Extracto ({locale.toUpperCase()})
          </label>
          <textarea
            value={excerpt[locale] ?? ""}
            onChange={(e) => setLocalized(setExcerpt, e.target.value)}
            rows={3}
            className={`${inputClass} text-sm`}
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Orden</label>
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 pb-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4"
              />
              Publicado
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Imagen de portada
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... o sube un archivo"
              className={`flex-1 ${inputClass}`}
            />
            <label
              className={`flex cursor-pointer items-center border px-3 py-2 text-sm transition-colors duration-200 ${
                uploading
                  ? "cursor-wait border-neutral-200 text-neutral-400"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleFilePick(e, "services/covers", setCoverImage)}
              />
              {uploading ? "Subiendo..." : "Subir"}
            </label>
          </div>
          {coverImage && (
            <img src={coverImage} alt="" className="mt-3 h-40 w-full max-w-sm object-cover" />
          )}
        </div>
      </div>

      {/* Llamado a la acción */}
      <div className="border border-neutral-200 bg-white p-6">
        <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-neutral-500">
          Llamado a la acción
        </h3>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setCtaType("whatsapp")}
            className={`border px-4 py-2 text-sm transition-colors duration-200 ${
              ctaType === "whatsapp"
                ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setCtaType("form")}
            className={`border px-4 py-2 text-sm transition-colors duration-200 ${
              ctaType === "form"
                ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            Formulario (encuentros grupales)
          </button>
        </div>

        {ctaType === "whatsapp" ? (
          <>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Número de WhatsApp
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+573142793431"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Mensaje precargado ({locale.toUpperCase()})
              </label>
              <input
                type="text"
                value={waMessage[locale] ?? ""}
                onChange={(e) => setLocalized(setWaMessage, e.target.value)}
                placeholder="Hola, estoy interesado/a en..."
                className={inputClass}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-500">
            La página del servicio mostrará un formulario de inscripción. Las respuestas quedan en
            la tabla <code className="font-mono text-xs">service_leads</code> y llegan por correo.
          </p>
        )}
      </div>

      {/* Contenido */}
      <div className="border border-neutral-200 bg-white p-6">
        <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-neutral-500">
          Contenido ({locale.toUpperCase()})
        </h3>

        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                  className="h-6 w-6 border border-neutral-200 text-xs text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === blocks.length - 1}
                  className="h-6 w-6 border border-neutral-200 text-xs text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  className="h-6 w-6 border border-neutral-200 text-xs text-red-800 transition-colors duration-200 hover:bg-red-50 hover:text-red-900"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1">
                <select
                  value={block.type}
                  onChange={(e) => updateBlockType(index, e.target.value as ServiceBlock["type"])}
                  className="mb-2 w-full border border-neutral-200 bg-transparent px-3 py-1 text-sm text-neutral-700 focus:border-neutral-400 focus:outline-none"
                >
                  <option value="heading">Título</option>
                  <option value="paragraph">Párrafo</option>
                </select>
                <textarea
                  value={block.content[locale] ?? ""}
                  onChange={(e) => updateBlockContent(index, e.target.value)}
                  rows={block.type === "heading" ? 1 : 4}
                  className={`w-full border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 focus:border-neutral-400 focus:outline-none ${
                    block.type === "heading" ? "text-lg font-medium" : "text-sm leading-relaxed"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => addBlock("paragraph")}
            className="border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors duration-200 hover:bg-neutral-100"
          >
            + Párrafo
          </button>
          <button
            type="button"
            onClick={() => addBlock("heading")}
            className="border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors duration-200 hover:bg-neutral-100"
          >
            + Título
          </button>
        </div>
      </div>

      {/* Imágenes adicionales */}
      <div className="border border-neutral-200 bg-white p-6">
        <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-neutral-500">
          Imágenes adicionales
        </h3>

        <div className="space-y-4">
          {images.map((img, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={img.url}
                    onChange={(e) => updateImage(index, { url: e.target.value })}
                    placeholder="URL de la imagen"
                    className={`flex-1 ${inputClass} text-sm`}
                  />
                  <label
                    className={`flex cursor-pointer items-center border px-2 py-2 text-xs transition-colors duration-200 ${
                      uploading
                        ? "cursor-wait border-neutral-200 text-neutral-400"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) =>
                        handleFilePick(e, "services/blocks", (url) => updateImage(index, { url }))
                      }
                    />
                    {uploading ? "..." : "Subir"}
                  </label>
                </div>
                <input
                  type="text"
                  value={img.alt ?? ""}
                  onChange={(e) => updateImage(index, { alt: e.target.value })}
                  placeholder="Texto alternativo"
                  className={`w-full ${inputClass} text-sm`}
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="mt-2 h-6 w-6 border border-neutral-200 text-xs text-red-800 transition-colors duration-200 hover:bg-red-50 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addImage}
          className="mt-4 border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors duration-200 hover:bg-neutral-100"
        >
          + Agregar imagen
        </button>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-neutral-300 px-6 py-3 text-sm text-neutral-700 transition-colors duration-200 hover:bg-neutral-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-[#1a1a1a] px-6 py-3 text-sm text-white transition-colors duration-200 hover:bg-neutral-800"
        >
          {mode === "create" ? "Crear servicio" : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}
