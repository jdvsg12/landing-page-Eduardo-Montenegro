"use client"

import { useState } from "react"
import { buttonClass } from "@/components/admin/admin-ui"

export function useAiTranslate() {
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState("")

  const translate = async (fields: Record<string, string>) => {
    setError("")
    setTranslating(true)
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        en?: Record<string, string>
        fr?: Record<string, string>
      }
      if (!res.ok) {
        setError(data.error ?? "No se pudo autocompletar")
        return null
      }
      return { en: data.en ?? {}, fr: data.fr ?? {} }
    } catch {
      setError("No se pudo conectar con el servidor")
      return null
    } finally {
      setTranslating(false)
    }
  }

  return { translate, translating, error, setError }
}

export function AiTranslateButton({
  onClick,
  disabled,
  busy,
}: {
  onClick: () => void
  disabled?: boolean
  busy?: boolean
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || busy} className={buttonClass}>
      {busy ? "Traduciendo con Gemini..." : "Autocompletar con IA"}
    </button>
  )
}
