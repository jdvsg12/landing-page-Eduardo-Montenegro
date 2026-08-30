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
  const [isOpen, setIsOpen] = useState(true)
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start 78%", "end 18%"] })
  const imageHeight = useTransform(scrollYProgress, [0, 0.2, 0.78, 1], ["42vh", "42vh", "10vh", "0vh"])
  const imageScale = useTransform(scrollYProgress, [0, 0.45, 1], [1.08, 1, 0.92])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.12, 0.82, 1], [0, 1, 1, 0])
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "5%"])

  return (
    <motion.article ref={cardRef} className="relative min-h-[105vh] motion-reduce:min-h-0">
      <div className="sticky top-36 z-10 motion-reduce:static">
        <div className="overflow-hidden bg-background shadow-xl">
          <motion.div
            id={`service-image-${slug}`}
            style={{ height: isOpen ? imageHeight : "0vh", opacity: isOpen ? imageOpacity : 0 }}
            className="relative w-full overflow-hidden transition-[height,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <motion.div style={{ scale: imageScale, y: imageY }} className="absolute inset-[-8%]">
              <Image src={image} alt="" fill sizes="100vw" className="object-cover grayscale-[18%]" />
            </motion.div>
          </motion.div>

          <div className="bg-muted">
            <div className="flex min-h-20 items-center gap-4 px-5 py-4 md:min-h-24 md:px-8 lg:px-10">
              <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-controls={`service-image-${slug}`}
                className="group flex min-w-0 flex-1 items-center gap-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <h3 className="shrink-0 font-serif text-xl font-light leading-none text-foreground transition-all duration-700 group-hover:italic md:text-2xl lg:text-3xl">{title}</h3>
                <span className="h-px min-w-4 flex-1 bg-border" aria-hidden="true" />
                <p className="max-w-[44%] truncate text-sm leading-snug text-muted-foreground md:max-w-[42%] md:text-base">{subtitle}</p>
              </button>
              <Link href={`/servicios/${slug}`} aria-label={`Ver servicio: ${title}`} className="flex size-10 shrink-0 items-center justify-center text-xl text-muted-foreground outline-none transition-transform hover:translate-x-1 focus-visible:ring-2 focus-visible:ring-primary">↗</Link>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export type { ServiceCardProps }
