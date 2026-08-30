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

  return (
    <motion.article ref={cardRef} className="relative min-h-[115vh] group motion-reduce:min-h-0">
      <motion.div style={{ y: cardY, scale: cardScale }} className="sticky top-24 motion-reduce:static motion-reduce:transform-none">
        <Link
          href={`/servicios/${slug}`}
          aria-label={`Ver servicio: ${title}`}
          className="flex min-h-[62vh] flex-col overflow-hidden bg-background outline-none transition-shadow duration-500 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
        >
          <motion.div style={{ opacity: imageOpacity, height: imageHeight }} className="relative min-h-0 w-full shrink-0 overflow-hidden">
            <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-[-10%]">
              <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover grayscale-[18%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
            </motion.div>
          </motion.div>
          <motion.div style={{ opacity: detailOpacity }} className="flex flex-1 flex-col justify-between gap-12 bg-card p-8 md:p-12 lg:p-16">
            <div className="flex items-start justify-end">
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
