"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"

interface ServiceCardProps {
  title: string
  subtitle: string
  image: string
  slug: string
  index: number
  exploreText: string
}

export function ServiceCard({ title, subtitle, image, slug, index, exploreText }: ServiceCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] })
  const imageY = useTransform(scrollYProgress, [0, 0.35, 1], ["-10%", "0%", "4%"])
  const imageScale = useTransform(scrollYProgress, [0, 0.35, 1], [1.12, 1, 0.96])
  const cardY = useTransform(scrollYProgress, [0, 0.18, 0.72, 1], [72, 0, 0, -12])
  const cardScale = useTransform(scrollYProgress, [0, 0.18, 0.72, 1], [0.94, 1, 1, 0.98])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.12, 0.72, 1], [0, 1, 1, 0.38])
  const detailOpacity = useTransform(scrollYProgress, [0, 0.16, 0.66, 0.9], [0, 1, 1, 0.8])
  const reversed = index % 2 !== 0

  return (
    <motion.article ref={cardRef} className="relative min-h-[115vh] group motion-reduce:min-h-0">
      <motion.div style={{ y: cardY, scale: cardScale }} className="sticky top-24 motion-reduce:static motion-reduce:transform-none">
        <Link
          href={`/servicios/${slug}`}
          aria-label={`${exploreText}: ${title}`}
          className={`flex min-h-[62vh] flex-col overflow-hidden bg-background outline-none transition-shadow duration-500 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 md:flex-row ${reversed ? "md:flex-row-reverse" : ""}`}
        >
          <motion.div style={{ opacity: imageOpacity }} className="relative min-h-[38vh] flex-1 overflow-hidden md:min-h-0">
            <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-[-10%]">
              <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover grayscale-[18%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
            </motion.div>
            <span className="absolute left-6 top-6 font-mono text-xs tracking-[0.2em] text-white/80">0{index + 1}</span>
          </motion.div>
          <motion.div style={{ opacity: detailOpacity }} className="flex flex-1 flex-col justify-between gap-12 bg-card p-8 md:p-12 lg:p-16">
            <div className="flex items-start justify-between gap-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{exploreText}</p>
              <span aria-hidden="true" className="text-2xl font-light text-muted-foreground transition-transform duration-500 group-hover:translate-x-2">↗</span>
            </div>
            <div>
              <h3 className="max-w-lg font-serif text-4xl font-light leading-tight text-foreground md:text-5xl lg:text-6xl">{title}</h3>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">{subtitle}</p>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    </motion.article>
  )
}

export type { ServiceCardProps }
