import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

const GEMINI_URL = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

type TranslateBody = {
  fields?: unknown
}

function geminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || ""
}

function geminiModel() {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash"
}

function extractJson(raw: string) {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  return fenced?.[1]?.trim() ?? trimmed
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const apiKey = geminiApiKey()
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Falta GEMINI_API_KEY. Créala en Google AI Studio, agrégala a .env.local y reinicia el servidor.",
      },
      { status: 503 }
    )
  }

  let body: TranslateBody
  try {
    body = (await request.json()) as TranslateBody
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  if (!body.fields || typeof body.fields !== "object" || Array.isArray(body.fields)) {
    return NextResponse.json({ error: "No hay campos para traducir" }, { status: 400 })
  }

  const fields = Object.fromEntries(
    Object.entries(body.fields as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0
    )
  )

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Escribe primero el contenido en español." }, { status: 400 })
  }

  const prompt = `Traduce el contenido de un consultorio de psicoanálisis. El JSON de entrada está en español (claves estables, valores a traducir).
Devuelve SOLO un JSON con esta forma:
{"en":{"mismaClave":"traducción al inglés"},"fr":{"mismaClave":"traducción al francés"}}
Conserva el tono profesional, cálido y clínico. No traduzcas URLs, slugs ni nombres propios (Eduardo Montenegro). No agregues claves nuevas.

Entrada:
${JSON.stringify(fields)}`

  try {
    const res = await fetch(GEMINI_URL(geminiModel()), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "Eres un traductor editorial. Respondes únicamente con JSON válido." }],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error("Gemini translate error", res.status, detail.slice(0, 500))
      return NextResponse.json(
        { error: "No se pudo completar la traducción. Revisa GEMINI_API_KEY e inténtalo de nuevo." },
        { status: 502 }
      )
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const raw = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("")
    if (!raw) {
      return NextResponse.json({ error: "La IA no devolvió texto." }, { status: 502 })
    }

    const parsed = JSON.parse(extractJson(raw)) as { en?: unknown; fr?: unknown }
    const asMap = (value: unknown): Record<string, string> => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return {}
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string"
        )
      )
    }

    return NextResponse.json({ en: asMap(parsed.en), fr: asMap(parsed.fr) })
  } catch (error) {
    console.error("AI translate failed", error)
    return NextResponse.json({ error: "No se pudo conectar con el servicio de IA." }, { status: 502 })
  }
}
