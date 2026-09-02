"use client"

import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { dateLocale } from "@/lib/language"
import type { Taller } from "@/lib/talleres"

interface TallerCardProps {
  taller: Taller
}

export function TallerCard({ taller }: TallerCardProps) {
  const { language } = useLanguage()
  const t = getTranslation(language)

  const formatDate = (date: string) => {
    return new Date(date + "T12:00:00").toLocaleDateString(dateLocale(language), {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="h-full border-t-2 border-neutral-400 pt-6">
      <span className="mb-3 inline-block border border-neutral-400 px-3 py-1 text-xs font-medium text-neutral-800">
        {t.talleres.badge}
      </span>

      <h3 className="mb-3 text-xl font-semibold text-neutral-900">
        {taller.title}
      </h3>

      <div className="mb-3 flex gap-3 text-sm text-neutral-800">
        <span>{formatDate(taller.date)}</span>
        <span>{taller.cost}</span>
      </div>

      <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-neutral-700">
        {taller.excerpt}
      </p>

      <a
        href={`/talleres/${taller.slug}`}
        className="inline-block min-h-11 text-sm font-medium text-neutral-800 transition-colors duration-200 hover:text-neutral-900"
      >
        <span className="border-b border-neutral-400 pb-0.5 transition-all duration-200 hover:border-neutral-900">
          {t.talleres.viewTaller} →
        </span>
      </a>
    </div>
  )
}
