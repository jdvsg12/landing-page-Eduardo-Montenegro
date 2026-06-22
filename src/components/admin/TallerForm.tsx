"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Taller, TallerBlock, TallerImage } from "@/lib/talleres"
import { titleToSlug } from "@/lib/talleres"

interface TallerFormProps {
  initialData?: Partial<Taller>
  mode: "create" | "edit"
}

export function TallerForm({ initialData, mode }: TallerFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [date, setDate] = useState(initialData?.date ?? "")
  const [cost, setCost] = useState(initialData?.cost ?? "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "")
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "")
  const [blocks, setBlocks] = useState<TallerBlock[]>(initialData?.blocks ?? [])
  const [images, setImages] = useState<TallerImage[]>(initialData?.images ?? [])

  const slug = titleToSlug(title)

  const addBlock = (type: TallerBlock["type"]) => {
    setBlocks([...blocks, { type, content: "" }])
  }

  const updateBlock = (index: number, field: Partial<TallerBlock>) => {
    setBlocks(blocks.map((b, i) => (i === index ? { ...b, ...field } : b)))
  }

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index))
  }

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= blocks.length) return
    const copy = [...blocks]
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
    setBlocks(copy)
  }

  const addImage = () => {
    setImages([...images, { url: "", alt: "" }])
  }

  const updateImage = (index: number, field: Partial<TallerImage>) => {
    setImages(images.map((img, i) => (i === index ? { ...img, ...field } : img)))
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const uploadRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File): Promise<string | null> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
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

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>, onUrl: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await handleUpload(file)
    if (url) onUrl(url)
    e.target.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      title,
      date,
      cost,
      excerpt,
      coverImage: coverImage || undefined,
      blocks,
      images: images.filter((img) => img.url),
    }

    let res: Response

    if (mode === "create") {
      res = await fetch("/api/talleres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      res = await fetch(`/api/talleres/${initialData?.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    if (res.ok) {
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información básica */}
      <div className="border border-neutral-200 bg-white p-6">
        <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-neutral-500">
          Información básica
        </h3>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 focus:border-neutral-400 focus:outline-none"
          />
          {title && (
            <p className="mt-1 font-mono text-xs text-neutral-400">{slug}</p>
          )}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 focus:border-neutral-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Costo
            </label>
            <input
              type="text"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
              placeholder="Ej: COP 120.000 o Gratuito"
              className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 focus:border-neutral-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Extracto
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={2}
            className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
          />
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
              className="flex-1 border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 focus:border-neutral-400 focus:outline-none"
            />
            <label
              className={`flex cursor-pointer items-center border px-3 py-2 text-sm transition-colors duration-200 ${
                uploading
                  ? "cursor-wait border-neutral-200 text-neutral-400"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <input
                ref={uploadRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleFilePick(e, setCoverImage)}
              />
              {uploading ? "Subiendo..." : "Subir"}
            </label>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="border border-neutral-200 bg-white p-6">
        <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-neutral-500">
          Contenido
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
                  className="h-6 w-6 border border-neutral-200 text-xs text-neutral-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1">
                <select
                  value={block.type}
                  onChange={(e) =>
                    updateBlock(index, { type: e.target.value as TallerBlock["type"] })
                  }
                  className="mb-2 w-full border border-neutral-200 bg-transparent px-3 py-1 text-sm text-neutral-700 focus:border-neutral-400 focus:outline-none"
                >
                  <option value="heading">Título</option>
                  <option value="paragraph">Párrafo</option>
                </select>
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  rows={block.type === "heading" ? 1 : 4}
                  className={`w-full border border-neutral-200 bg-transparent px-3 py-2 text-neutral-900 focus:border-neutral-400 focus:outline-none ${
                    block.type === "heading"
                      ? "text-lg font-medium"
                      : "text-sm leading-relaxed"
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
                    className="flex-1 border border-neutral-200 bg-transparent px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
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
                        handleFilePick(e, (url) => updateImage(index, { url }))
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
                  className="w-full border border-neutral-200 bg-transparent px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="mt-2 h-6 w-6 border border-neutral-200 text-xs text-neutral-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-500"
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

      {/* Footer */}
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
          {mode === "create" ? "Crear taller" : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}
