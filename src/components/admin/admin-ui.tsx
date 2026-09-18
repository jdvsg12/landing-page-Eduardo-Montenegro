"use client"

import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { LocalizedText } from "@/lib/i18n-field"
import type { SiteContentKey, SiteContentMap } from "@/lib/site-content"
import type { Language } from "@/lib/translations"

export const LOCALES: { code: Language; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
]

export const inputClass =
  "w-full border border-neutral-300 bg-white px-3 py-2 text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-ink focus:outline-none"

export const buttonClass =
  "inline-flex items-center gap-2 border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"

export const primaryButtonClass =
  "inline-flex items-center gap-2 bg-ink px-6 py-3 text-sm text-white transition-colors duration-200 hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60"

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl font-light italic text-neutral-900 md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({
  title,
  description,
  children,
  actions,
}: {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-500">{title}</h2>
          {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: ReactNode
  htmlFor?: string
  children: ReactNode
}) {
  const generatedId = useId()
  const hintId = `${generatedId}-hint`
  // Asocia el label con el campo nativo que envuelve (input, textarea o select).
  const nativeChild =
    !htmlFor && isValidElement(children) && ["input", "textarea", "select"].includes(children.type as string)
      ? (children as ReactElement<{ id?: string; "aria-describedby"?: string }>)
      : null
  const fieldId = htmlFor ?? nativeChild?.props.id ?? (nativeChild ? generatedId : undefined)
  const content = nativeChild
    ? cloneElement(nativeChild, { id: fieldId, "aria-describedby": hint ? hintId : undefined })
    : children

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      {content}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
      />
      <span>
        <span className="block text-sm font-medium text-neutral-800">{label}</span>
        {description && <span className="block text-xs text-neutral-500">{description}</span>}
      </span>
    </label>
  )
}

/**
 * Selector de visibilidad al estilo WordPress. Público: se ve en la página.
 * Privado: queda guardado y solo lo ve el administrador con sesión iniciada.
 */
export function VisibilityToggle({
  published,
  onChange,
  disabled,
  size = "md",
}: {
  published: boolean
  onChange: (published: boolean) => void
  disabled?: boolean
  size?: "sm" | "md"
}) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"
  const option = (value: boolean, label: string, icon: ReactNode) => {
    const active = published === value
    return (
      <button
        type="button"
        role="radio"
        aria-checked={active}
        disabled={disabled}
        onClick={() => !active && onChange(value)}
        className={`inline-flex items-center gap-1.5 transition-colors duration-200 disabled:cursor-wait disabled:opacity-60 ${pad} ${
          active
            ? value
              ? "bg-emerald-700 text-white"
              : "bg-neutral-700 text-white"
            : "bg-white text-neutral-600 hover:bg-neutral-100"
        }`}
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <div role="radiogroup" aria-label="Visibilidad" className="inline-flex border border-neutral-300">
      {option(
        true,
        "Público",
        <svg aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
        </svg>
      )}
      {option(
        false,
        "Privado",
        <svg aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <rect x="5" y="11" width="14" height="9" rx="1" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      )}
    </div>
  )
}

export type VisibilityFilter = "all" | "public" | "private"

/** Pestañas Todos / Públicos / Privados con conteo, como el listado de entradas de WordPress. */
export function VisibilityTabs({
  value,
  onChange,
  counts,
}: {
  value: VisibilityFilter
  onChange: (value: VisibilityFilter) => void
  counts: Record<VisibilityFilter, number>
}) {
  const tabs: { key: VisibilityFilter; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "public", label: "Públicos" },
    { key: "private", label: "Privados" },
  ]
  return (
    <div className="mb-4 flex flex-wrap gap-x-1 text-sm">
      {tabs.map((tab, index) => (
        <span key={tab.key} className="flex items-center">
          {index > 0 && <span className="px-1 text-neutral-300">|</span>}
          <button
            type="button"
            onClick={() => onChange(tab.key)}
            aria-pressed={value === tab.key}
            className={`py-1 transition-colors ${
              value === tab.key ? "font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {tab.label} <span className="text-neutral-400">({counts[tab.key]})</span>
          </button>
        </span>
      ))}
    </div>
  )
}

export function filterByVisibility<T extends { published: boolean }>(items: T[], filter: VisibilityFilter) {
  if (filter === "public") return items.filter((item) => item.published)
  if (filter === "private") return items.filter((item) => !item.published)
  return items
}

export function visibilityCounts(items: { published: boolean }[]): Record<VisibilityFilter, number> {
  const published = items.filter((item) => item.published).length
  return { all: items.length, public: published, private: items.length - published }
}

/** Barra fija con el idioma que se edita. Marca con • los idiomas sin traducir. */
export function LocaleSwitcher({
  locale,
  onChange,
  missing = [],
}: {
  locale: Language
  onChange: (locale: Language) => void
  missing?: Language[]
}) {
  return (
    <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-3 border border-neutral-200 bg-white/95 p-3 backdrop-blur-sm lg:top-0">
      <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Editando en</span>
      <div className="flex gap-1.5">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code)}
            aria-pressed={locale === l.code}
            className={`border px-3 py-1.5 text-sm transition-colors duration-200 sm:px-4 ${
              locale === l.code
                ? "border-ink bg-ink text-white"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {l.label}
            {missing.includes(l.code) && (
              <span className="ml-1.5 text-xs opacity-60" title="Sin traducir">
                •
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export function missingLocales(fields: LocalizedText[]): Language[] {
  return (["en", "fr"] as const).filter((code) => fields.some((field) => field.es?.trim() && !field[code]?.trim()))
}

export function FallbackHint({ locale }: { locale: Language }) {
  if (locale === "es") return null
  return <>Si lo dejas vacío se muestra la versión en español.</>
}

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const upload = async (file: File, prefix: string): Promise<string | null> => {
    setUploading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("prefix", prefix)
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "No se pudo subir la imagen")
        return null
      }
      const { url } = await res.json()
      return url as string
    } catch {
      setError("No se pudo subir la imagen")
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, error }
}

/** Campo de imagen: URL editable, botón de subida a Blob y vista previa. */
export function ImageField({
  label,
  value,
  onChange,
  prefix,
  hint,
  previewClassName = "h-40 w-full max-w-sm object-cover",
}: {
  label: string
  value: string
  onChange: (url: string) => void
  prefix: string
  hint?: ReactNode
  previewClassName?: string
}) {
  const { upload, uploading, error } = useUpload()
  const inputId = useId()

  const handlePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    const url = await upload(file, prefix)
    if (url) onChange(url)
  }

  return (
    <Field label={label} hint={hint} htmlFor={inputId}>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://... o sube un archivo"
          className={`min-w-0 flex-1 ${inputClass} text-sm`}
        />
        <label
          className={`flex shrink-0 cursor-pointer items-center border px-3 py-2 text-sm transition-colors duration-200 ${
            uploading
              ? "cursor-wait border-neutral-200 text-neutral-400"
              : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
          }`}
        >
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handlePick} />
          {uploading ? "Subiendo..." : "Subir"}
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className={buttonClass} aria-label={`Quitar ${label}`}>
            Quitar
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {value && (
        <img src={value} alt="" className={`mt-3 border border-neutral-200 bg-neutral-100 ${previewClassName}`} />
      )}
    </Field>
  )
}

/** Botones compactos para reordenar y quitar elementos de una lista. */
export function ListControls({
  onUp,
  onDown,
  onRemove,
  disableUp,
  disableDown,
  label,
}: {
  onUp: () => void
  onDown: () => void
  onRemove: () => void
  disableUp?: boolean
  disableDown?: boolean
  label: string
}) {
  const base =
    "flex h-7 w-7 items-center justify-center border border-neutral-200 bg-white text-xs transition-colors duration-200 disabled:opacity-30"
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" onClick={onUp} disabled={disableUp} className={`${base} text-neutral-500 hover:bg-neutral-100`} aria-label={`Subir ${label}`}>
        ↑
      </button>
      <button type="button" onClick={onDown} disabled={disableDown} className={`${base} text-neutral-500 hover:bg-neutral-100`} aria-label={`Bajar ${label}`}>
        ↓
      </button>
      <button type="button" onClick={onRemove} className={`${base} text-red-700 hover:bg-red-50`} aria-label={`Eliminar ${label}`}>
        ✕
      </button>
    </div>
  )
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction
  if (target < 0 || target >= items.length) return items
  const copy = [...items]
  ;[copy[index], copy[target]] = [copy[target], copy[index]]
  return copy
}

type SaveStatus = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string }

/** Estado y guardado de una sección de `site_content`. */
export function useContentEditor<K extends SiteContentKey>(key: K, initial: SiteContentMap[K]) {
  const router = useRouter()
  const [value, setValue] = useState<SiteContentMap[K]>(initial)
  const [status, setStatus] = useState<SaveStatus>({ kind: "idle" })
  const [dirty, setDirty] = useState(false)

  const update = (next: SiteContentMap[K] | ((prev: SiteContentMap[K]) => SiteContentMap[K])) => {
    setValue(next)
    setDirty(true)
    setStatus({ kind: "idle" })
  }

  const save = async () => {
    setStatus({ kind: "saving" })
    try {
      const res = await fetch(`/api/admin/content/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setStatus({ kind: "error", message: data.error ?? "No se pudo guardar" })
        return
      }
      setValue(await res.json())
      setDirty(false)
      setStatus({ kind: "saved" })
      router.refresh()
    } catch {
      setStatus({ kind: "error", message: "No se pudo conectar con el servidor" })
    }
  }

  return { value, update, save, status, dirty }
}

export function SaveBar({
  status,
  dirty,
  onSave,
  previewHref,
}: {
  status: SaveStatus
  dirty: boolean
  onSave: () => void
  previewHref?: string
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex flex-wrap items-center justify-end gap-4 border-t border-neutral-200 bg-paper/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <p role="status" className="mr-auto text-sm">
        {status.kind === "saved" && <span className="text-emerald-700">Cambios guardados y publicados.</span>}
        {status.kind === "error" && <span className="text-red-600">{status.message}</span>}
        {status.kind !== "saved" && status.kind !== "error" && dirty && (
          <span className="text-neutral-500">Tienes cambios sin guardar.</span>
        )}
      </p>
      {previewHref && (
        <a href={previewHref} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          Ver en la página
        </a>
      )}
      <button type="button" onClick={onSave} disabled={status.kind === "saving"} className={primaryButtonClass}>
        {status.kind === "saving" ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  )
}
