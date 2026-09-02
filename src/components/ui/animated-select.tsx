"use client"

import { useId, useState } from "react"
import { motion } from "motion/react"

interface AnimatedSelectProps {
    label: string
    name: string
    options: { value: string; label: string }[]
    required?: boolean
    error?: string
}

export function AnimatedSelect({ label, name, options, required = false, error }: AnimatedSelectProps) {
    const uid = useId()
    const inputId = `${name}-${uid}`
    const errorId = `${inputId}-error`
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    const selectClasses =
        "w-full bg-transparent border-0 border-b px-0 py-3 text-white placeholder:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink transition-colors duration-300 cursor-pointer appearance-none" +
        (error ? " border-red-500" : " border-neutral-600 focus:border-white")

    return (
        <div className="relative">
            <label htmlFor={inputId} className="mb-2 block text-sm text-white">
                {label}
                {required && <span className="text-white"> *</span>}
            </label>

            <div className="relative">
                <select
                    id={inputId}
                    name={name}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        setIsFocused(false)
                        setHasValue(e.target.value.length > 0)
                    }}
                    onChange={(e) => setHasValue(e.target.value.length > 0)}
                    className={selectClasses}
                    style={{
                        color: hasValue ? "white" : "rgba(255,255,255,0.72)",
                    }}
                >
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            style={{
                                backgroundColor: "#1a1a1a",
                                color: "white",
                            }}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {error && (
                    <motion.p
                        id={errorId}
                        role="alert"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-400"
                    >
                        {error}
                    </motion.p>
                )}

                <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
                    <svg
                        className="h-5 w-5 text-white/70"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden
                    >
                        <path d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>

                <motion.div
                    className={`absolute bottom-0 left-0 h-[2px] ${error ? "bg-red-500" : "bg-white"}`}
                    initial={{ width: "0%" }}
                    animate={{ width: isFocused || hasValue || error ? "100%" : "0%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                />
            </div>
        </div>
    )
}
