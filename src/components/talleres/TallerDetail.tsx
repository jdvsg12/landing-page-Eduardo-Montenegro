"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { MediaImage } from "@/components/media-image"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { dateLocale } from "@/lib/language"
import type { Taller } from "@/lib/talleres"

export function TallerDetail({ taller }: { taller: Taller }) {
  const { language } = useLanguage()
  const t = getTranslation(language)

  const formattedDate = new Date(taller.date + "T12:00:00").toLocaleDateString(dateLocale(language), {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const whatsappHref = `https://wa.me/573142793431?text=${encodeURIComponent(
    t.talleres.whatsappMessage.replace("{title}", taller.title),
  )}`

  return (
    <div className="min-h-screen bg-paper">
      <Navbar variant="page" />

      <main id="main">
        <section className="relative flex min-h-[45vh] items-center bg-sage">
          {taller.coverImage && (
            <>
              <MediaImage
                src={taller.coverImage}
                alt={taller.title}
                className="object-cover"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
            </>
          )}
          <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-20 pt-32">
            <span className="mb-4 inline-block text-xs font-medium uppercase tracking-widest text-white">
              {t.talleres.badge}
            </span>
            <h1 className="mb-6 text-3xl font-light text-white md:text-5xl">{taller.title}</h1>
            <div className="flex flex-wrap gap-3">
              <span className="inline-block bg-white/15 px-4 py-2 text-sm text-white">{formattedDate}</span>
              <span className="inline-block bg-white/15 px-4 py-2 text-sm text-white">{taller.cost}</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-xl leading-relaxed text-neutral-800">{taller.excerpt}</p>

          <div className="mt-12 space-y-6">
            {taller.blocks.map((block, index) =>
              block.type === "heading" ? (
                <h2 key={index} className="pt-4 font-serif text-2xl font-medium text-neutral-900">
                  {block.content}
                </h2>
              ) : (
                <p key={index} className="whitespace-pre-line text-base leading-relaxed text-neutral-700">
                  {block.content}
                </p>
              ),
            )}
          </div>

          {taller.images.length > 0 && (
            <div className="mt-16 grid grid-cols-2 gap-4">
              {taller.images.map((img, index) => (
                <div key={index} className="relative aspect-[4/3] overflow-hidden">
                  <MediaImage src={img.url} alt={img.alt || taller.title} sizes="40vw" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 bg-surface p-8">
            <p className="mb-4 font-serif text-lg font-medium text-neutral-900">{t.talleres.interestedTitle}</p>
            <p className="mb-6 text-sm text-neutral-800">{t.talleres.interestedSubtitle}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-ink px-8 py-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#25D366] hover:text-[#0b2d18]"
            >
              {t.talleres.contactWhatsApp}
            </a>
          </div>

          <div className="mt-12">
            <Link
              href="/#services"
              className="text-sm text-neutral-800 transition-colors duration-200 hover:text-neutral-900"
            >
              {t.services.backToServices}
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
