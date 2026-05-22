"use client"

import { useState } from "react"
import { motion } from "motion/react"

interface AnimatedInputProps {
    label: string
    placeholder: string
    type?: string
    required?: boolean
    name: string
    isTextarea?: boolean
    error?: string
    value?: string
    onChange?: (value: string) => void
}

export function AnimatedInput({
    label,
    placeholder,
    type = "text",
    required = false,
    name,
    isTextarea = false,
    error,
    value,
    onChange,
}: AnimatedInputProps) {
    const [isFocused, setIsFocused] = useState(false)
    const isControlled = value !== undefined
    const hasValue = isControlled ? value.length > 0 : false

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (onChange) {
            onChange(e.target.value)
        }
    }

    const inputClasses =
        "w-full bg-transparent border-0 border-b px-0 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-0 transition-colors duration-300" +
        (error ? " border-red-500" : " border-neutral-600 focus:border-white")

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
        >
            <label className="mb-2 block text-sm text-white">
                {label}
                {required && <span className="text-white">*</span>}
            </label>

            <div className="relative">
                {isTextarea ? (
                    <textarea
                        name={name}
                        placeholder={placeholder}
                        rows={3}
                        value={value}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={inputClasses + " resize-none"}
                    />
                ) : (
                    <input
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={inputClasses}
                    />
                )}

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-400"
                    >
                        {error}
                    </motion.p>
                )}

                <motion.div
                    className={`absolute bottom-0 left-0 h-[2px] ${error ? 'bg-red-500' : 'bg-white'}`}
                    initial={{ width: "0%" }}
                    animate={{ width: isFocused || hasValue || error ? "100%" : "0%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                />
            </div>
        </motion.div>
    )
}
