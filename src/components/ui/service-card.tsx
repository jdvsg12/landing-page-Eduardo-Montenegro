"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "motion/react"
import { useRef, useState } from "react"

interface ServiceCardProps {
  title: string
  subtitle: string
  image: string
  slug: string
}

export function ServiceCard({ title, subtitle, image, slug }: ServiceCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] })
  const imageY = useTransform(scrollYProgress, [0, 0.35, 1], ["-10%", "0%", "4%"])
  const imageScale = useTransform(scrollYProgress, [0, 0.35, 1], [1.12, 1, 0.96])
  const cardY = useTransform(scrollYProgress, [0, 0.18, 0.72, 1], [72, 0, 0, -12])
  const cardScale = useTransform(scrollYProgress, [0, 0.18, 0.72, 1], [0.94, 1, 1, 0.98])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.12, 0.72, 1], [0, 1, 1, 0])
  const imageHeight = useTransform(scrollYProgress, [0, 0.18, 0.7, 1], ["42vh", "42vh", "12vh", "0vh"])
  const detailOpacity = useTransform(scrollYProgress, [0, 0.12, 0.66, 0.9], [0, 1, 1, 1])
  const [isOpen, setIsOpen] = useState(true)
  const manualHeight = isOpen ? imageHeight : "0vh"
  const manualOpacity = isOpen ? imageOpacity : 0

  return (
    <motion.article ref={cardRef} className="relative min-h-[115vh] group motion-reduce:min-h-0">
      <motion.div style={{ y: cardY, scale: cardScale }} className="sticky top-24 motion-reduce:static motion-reduce:transform-none">
        <div className="overflow-hidden bg-background shadow-2xl">
          <motion.div id={`service-image-${slug}`} style={{ opacity: manualOpacity, height: manualHeight }} className="relative min-h-0 w-full shrink-0 overflow-hidden transition-[height,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-[-10%]">
              <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover grayscale-[18%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
            </motion.div>
          </motion.div>
          <motion.div style={{ opacity: detailOpacity }} className="bg-muted">
            <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls={`service-image-${slug}`} className={`flex w-full items-end justify-between gap-6 text-left outline-none transition-[padding,background-color] duration-700 hover:bg-background focus-visible:ring-2 focus-visible:ring-primary ${isOpen ? "p-8 md:p-12 lg:p-16" : "px-8 py-5 md:px-12 md:py-6 lg:px-16"}`}>
              <span>
                <h3 className={`max-w-lg font-serif font-light leading-tight text-foreground transition-[font-size] duration-700 ${isOpen ? "text-4xl md:text-5xl lg:text-6xl" : "text-2xl md:text-3xl lg:text-4xl"}`}>{title}</h3>
                <p className={`max-w-md text-muted-foreground transition-[margin,font-size] duration-700 ${isOpen ? "mt-6 text-base leading-relaxed md:text-lg" : "mt-2 text-sm leading-relaxed md:text-base"}`}>{subtitle}</p>
              </span>
              <span aria-hidden="true" className="shrink-0 text-2xl font-light text-muted-foreground">{isOpen ? "−" : "+"}</span>
            </button>
            <Link href={`/servicios/${slug}`} className="sr-only">Ver servicio: {title}</Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.article>
  )
}

export type { ServiceCardProps }
