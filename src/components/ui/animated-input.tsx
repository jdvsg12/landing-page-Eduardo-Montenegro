"use client"

import { useId, useState } from "react"
import { motion } from "motion/react"

interface AnimatedInputProps {
    label: string
    placeholder: string
    type?: string
    name: string
    isTextarea?: boolean
    error?: string
    value?: string
    required?: boolean
    onChange?: (value: string) => void
}

export function AnimatedInput({
    label,
    placeholder,
    type = "text",
    name,
    isTextarea = false,
    error,
    value,
    required = false,
    onChange,
}: AnimatedInputProps) {
    const uid = useId()
    const inputId = `${name}-${uid}`
    const errorId = `${inputId}-error`
    const [isFocused, setIsFocused] = useState(false)
    const isControlled = value !== undefined
    const hasValue = isControlled ? value.length > 0 : false

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange?.(e.target.value)
    }

    const inputClasses =
        "w-full caret-white bg-transparent border-0 border-b px-0 py-3 text-white placeholder:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink transition-colors duration-300" +
        (error ? " border-red-500" : " border-neutral-600 focus:border-white")

    return (
        <div className="relative">
            <label htmlFor={inputId} className="mb-2 block text-sm text-white">
                {label}
                {required && <span className="text-white"> *</span>}
            </label>

            <div className="relative">
                {isTextarea ? (
                    <textarea
                        id={inputId}
                        name={name}
                        placeholder={placeholder}
                        rows={3}
                        value={value}
                        required={required}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={inputClasses + " resize-none"}
                    />
                ) : (
                    <input
                        id={inputId}
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        required={required}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={inputClasses}
                    />
                )}

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
