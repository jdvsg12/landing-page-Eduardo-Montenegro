"use client"

import { motion } from "motion/react"
import type { Taller } from "@/lib/talleres"

interface TallerCardProps {
  taller: Taller
  index: number
}

export function TallerCard({ taller, index }: TallerCardProps) {
  const formatDate = (date: string) => {
    return new Date(date + "T12:00:00").toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <div className="h-full border-t-2 border-neutral-400 pt-6">
        <span className="mb-3 inline-block border border-neutral-400 px-3 py-1 text-xs font-medium text-neutral-600">
          Taller
        </span>

        <h3 className="mb-3 text-xl font-semibold text-neutral-900">
          {taller.title}
        </h3>

        <div className="mb-3 flex gap-3 text-sm text-neutral-500">
          <span>{formatDate(taller.date)}</span>
          <span>{taller.cost}</span>
        </div>

        <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-neutral-600">
          {taller.excerpt}
        </p>

        <a
          href={`/talleres/${taller.slug}`}
          className="inline-block text-sm font-medium text-neutral-700 transition-colors duration-200 hover:text-neutral-900"
        >
          <span className="border-b border-neutral-400 pb-0.5 transition-all duration-200 hover:border-neutral-900">
            Ver taller →
          </span>
        </a>
      </div>
    </motion.div>
  )
}
