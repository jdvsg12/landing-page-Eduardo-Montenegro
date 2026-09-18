import Image from "next/image"
import { cn } from "@/lib/utils"

type MediaImageProps = {
    src: string
    alt: string
    className?: string
    sizes?: string
    priority?: boolean
}

/** Covers the fill-parent case used by hero, cards, and detail banners. */
export function MediaImage({ src, alt, className, sizes, priority }: MediaImageProps) {
    const remote = src.startsWith("http")

    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes ?? "100vw"}
            priority={priority}
            unoptimized={remote}
            className={cn("object-cover", className)}
        />
    )
}
