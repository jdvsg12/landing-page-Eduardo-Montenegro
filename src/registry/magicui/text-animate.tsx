"use client"

import React from "react"
import { motion, type Variants, useInView, useAnimation } from "motion/react"
import { useRef, useEffect } from "react"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

import { cn } from "@/lib/utils"

interface TextAnimateProps {
    children: string
    className?: string
    delay?: number
    duration?: number
    variants?: Variants
    as?: React.ElementType
    by?: "text" | "word" | "character" | "line"
    startOnView?: boolean
    once?: boolean
    animation?: "fadeIn" | "slideUp" | "typewriter" | "wave" | "blurInUp"
}

export function TextAnimate({
    children,
    className,
    delay = 0,
    duration = 0.3,
    variants,
    as: Component = "p",
    by = "word",
    startOnView = true,
    once = false,
    animation = "fadeIn",
}: TextAnimateProps) {
    const controls = useAnimation()
    const ref = useRef(null)
    const isInView = useInView(ref, { once })
    const reduceMotion = usePrefersReducedMotion()

    const text = children

    const getSegments = () => {
        switch (by) {
            case "character":
                return text.split("")
            case "line":
                return text.split("\n")
            case "text":
                return [text]
            case "word":
            default:
                return text.split(" ")
        }
    }

    const segments = getSegments()

    const defaultVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: delay,
            },
        },
    }

    const childVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: duration,
                ease: "easeOut" as const,
            },
        },
    }

    const slideUpVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: duration,
                ease: "easeOut" as const,
            },
        },
    }

    const blurInUpVariants: Variants = {
        hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                duration: duration,
                ease: "easeOut" as const,
            },
        },
    }

    const getChildVariants = (): Variants => {
        if (variants) return variants
        switch (animation) {
            case "slideUp":
                return slideUpVariants
            case "blurInUp":
                return blurInUpVariants
            default:
                return childVariants
        }
    }

    useEffect(() => {
        if (startOnView) {
            if (isInView) {
                controls.start("visible")
            } else if (!once) {
                controls.start("hidden")
            }
        } else {
            controls.start("visible")
        }
    }, [isInView, controls, startOnView, once])

    const MotionComponent = motion[Component as keyof typeof motion] as any

    if (reduceMotion) {
        const StaticComponent = Component as React.ElementType
        return (
            <StaticComponent ref={ref} className={cn(className)}>
                {text}
            </StaticComponent>
        )
    }

    return (
        <MotionComponent
            ref={ref}
            className={cn(className)}
            variants={defaultVariants}
            initial="hidden"
            animate={controls}
        >
            {segments.map((segment, index) => (
                <motion.span
                    key={index}
                    variants={getChildVariants()}
                    className={by === "line" ? "block" : by === "word" ? "inline-block mr-[0.25em]" : "inline-block"}
                >
                    {segment}
                </motion.span>
            ))}
        </MotionComponent>
    )
}
