"use client"

import { useRef, useState } from "react"
import { motion } from "motion/react"
import { AnimatedInput } from "@/components/ui/animated-input"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"

interface ServiceLeadFormProps {
    slug: string
}

export function ServiceLeadForm({ slug }: ServiceLeadFormProps) {
    const { language } = useLanguage()
    const t = getTranslation(language)

    const termsRef = useRef<HTMLInputElement>(null)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [message, setMessage] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})
        setStatus("idle")

        try {
            const res = await fetch(`/api/services/${slug}/lead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    message,
                    terms: termsRef.current?.checked || false,
                    language,
                }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setErrors(data.errors ?? {})
                setStatus("error")
                return
            }

            setStatus("success")
            setName("")
            setEmail("")
            setPhone("")
            setMessage("")
            if (termsRef.current) termsRef.current.checked = false
        } catch {
            setStatus("error")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (status === "success") {
        return (
            <div className="bg-[#1a1a1a] p-8 text-white">
                <p className="text-lg">{t.services.detailFormSuccess}</p>
            </div>
        )
    }

    return (
        <div className="bg-[#1a1a1a] p-8">
            <p className="mb-2 text-lg font-medium text-white">{t.services.detailFormTitle}</p>
            <p className="mb-8 text-sm text-neutral-400">{t.services.detailFormSubtitle}</p>

            <form className="space-y-8" onSubmit={handleSubmit} noValidate>
                <AnimatedInput
                    label={t.contact.name}
                    placeholder={t.contact.namePlaceholder}
                    name="name"
                    required
                    value={name}
                    onChange={setName}
                    error={errors.name}
                />

                <AnimatedInput
                    label={t.contact.email}
                    placeholder={t.contact.emailPlaceholder}
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                />

                <AnimatedInput
                    label={t.contact.phone}
                    placeholder={t.contact.phonePlaceholder}
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={setPhone}
                    error={errors.phone}
                />

                <AnimatedInput
                    label={t.contact.message}
                    placeholder={t.contact.messagePlaceholder}
                    name="message"
                    isTextarea
                    value={message}
                    onChange={setMessage}
                    error={errors.message}
                />

                <div className="flex items-start gap-3">
                    <input
                        ref={termsRef}
                        type="checkbox"
                        id="service-lead-terms"
                        name="terms"
                        className={`mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-green-500 focus:ring-green-500 focus:ring-offset-neutral-900 ${errors.terms ? "border-red-500 ring-2 ring-red-500" : ""}`}
                    />
                    <label htmlFor="service-lead-terms" className="text-sm text-neutral-400">
                        Acepto los{" "}
                        <a
                            href="/Politica_Proteccion_Datos_Colombia.pdf"
                            target="_blank"
                            className="text-green-400 underline hover:text-green-300"
                        >
                            términos y condiciones
                        </a>{" "}
                        y la política de privacidad
                    </label>
                </div>
                {errors.terms && <p className="text-sm text-red-400">{errors.terms}</p>}

                {status === "error" && !Object.keys(errors).length && (
                    <p className="text-sm text-red-400">{t.services.detailFormError}</p>
                )}

                <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="w-full border border-white px-8 py-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-white hover:text-[#1a1a1a] disabled:opacity-50"
                >
                    {isSubmitting ? t.services.detailFormSending : t.services.detailFormSubmit}
                </motion.button>
            </form>
        </div>
    )
}
