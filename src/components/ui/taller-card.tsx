"use client"

import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { dateLocale } from "@/lib/language"
import { pickTallerText, type Taller } from "@/lib/talleres"

interface TallerCardProps {
  taller: Taller
}

export function TallerCard({ taller }: TallerCardProps) {
  const { language } = useLanguage()
  const t = getTranslation(language)
  const title = pickTallerText(taller.title, taller.i18n?.title, language)
  const excerpt = pickTallerText(taller.excerpt, taller.i18n?.excerpt, language)
  const cost = pickTallerText(taller.cost, taller.i18n?.cost, language)

  const formatDate = (date: string) => {
    return new Date(date + "T12:00:00").toLocaleDateString(dateLocale(language), {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="h-full border-t-2 border-neutral-400 pt-6">
      <span className="mb-3 inline-block border border-neutral-400 px-3 py-1 text-xs font-medium text-ink">
        {t.talleres.badge}
      </span>

      <h3 className="mb-3 text-xl font-semibold text-ink">{title}</h3>

      <div className="mb-3 flex gap-3 text-sm text-sage-ink">
        <span suppressHydrationWarning>{formatDate(taller.date)}</span>
        <span>{cost}</span>
      </div>

      <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-sage-ink">{excerpt}</p>

      <a
        href={`/talleres/${taller.slug}`}
        className="inline-block min-h-11 text-sm font-medium text-ink transition-colors duration-200 hover:text-ink"
      >
        <span className="border-b border-neutral-400 pb-0.5 transition-all duration-200 hover:border-ink">
          {t.talleres.viewTaller} →
        </span>
      </a>
    </div>
  )
}
