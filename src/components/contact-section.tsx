"use client"

import { useRef, useState } from "react"
import { motion } from "motion/react"
import { z } from "zod"
import { AnimatedInput } from "@/components/ui/animated-input"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { AnimatedSelect } from "./ui/animated-select"
import { socialLinks } from "@/lib/social-links"
import { createContactFormSchema, formatZodErrors } from "@/lib/validation"

export function ContactSection() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const termsRef = useRef<HTMLInputElement>(null)
    const { language } = useLanguage()
    const t = getTranslation(language)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitStatus("idle")
        setValidationErrors({})

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            services: formData.get("services") as string,
            message: formData.get("message") as string,
            terms: termsRef.current?.checked || false,
            language: language,
        }

        const contactFormSchema = createContactFormSchema(language)

        try {
            contactFormSchema.parse(data)
        } catch (validationError) {
            const errors = formatZodErrors(validationError as z.ZodError)
            setValidationErrors(errors)
            setIsSubmitting(false)
            return
        }

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
                console.error("API Error:", errorData)
                throw new Error(errorData.error || "Error al enviar el formulario")
            }

            setSubmitStatus("success")
            const form = e.target as HTMLFormElement
            form?.reset()
        } catch (error) {
            console.error("Error:", error)
            setSubmitStatus("error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section
            ref={sectionRef}
            id="contact"
            className="relative min-h-screen bg-ink"
        >
            <div className="flex min-h-screen items-center py-24 lg:py-32">
                <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-16 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-12 font-serif text-3xl font-light text-white lg:text-4xl">
                                {t.contact.title}
                            </h2>

                            <form className="space-y-8" onSubmit={handleSubmit} noValidate>
                                {Object.keys(validationErrors).length > 0 && (
                                    <div
                                        role="alert"
                                        className="rounded border border-red-500 bg-red-500/10 p-4 text-red-400"
                                    >
                                        <p className="mb-2 font-medium">{t.contact.validation.formTitle}</p>
                                        <ul className="list-inside list-disc space-y-1 text-sm">
                                            {Object.entries(validationErrors).map(([field, message]) => (
                                                <li key={field}>{message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="grid gap-8 md:grid-cols-2">
                                    <AnimatedInput
                                        label={t.contact.name}
                                        placeholder={t.contact.namePlaceholder}
                                        name="name"
                                        required
                                        error={validationErrors.name}
                                    />
                                    <AnimatedInput
                                        label={t.contact.email}
                                        placeholder={t.contact.emailPlaceholder}
                                        name="email"
                                        type="email"
                                        required
                                        error={validationErrors.email}
                                    />
                                </div>

                                <div className="grid gap-8 md:grid-cols-2">
                                    <AnimatedInput
                                        label={t.contact.phone}
                                        placeholder="+57 300 123 4567"
                                        name="phone"
                                        type="tel"
                                        required
                                        error={validationErrors.phone}
                                    />
                                    <AnimatedSelect
                                        label={t.contact.servicesLabel}
                                        name="services"
                                        required
                                        options={[
                                            { value: "", label: t.contact.servicesPlaceholder },
                                            { value: "Psicoanálisis adulto", label: t.contact.optionPsychoanalysis },
                                            {
                                                value: "Supervisión clínica profesionales",
                                                label: t.contact.optionSupervision,
                                            },
                                            { value: "Grupos de estudio", label: t.contact.optionStudyGroup },
                                        ]}
                                        error={validationErrors.services}
                                    />
                                </div>

                                <AnimatedInput
                                    label={t.contact.message}
                                    placeholder={t.contact.messagePlaceholder}
                                    name="message"
                                    isTextarea
                                    error={validationErrors.message}
                                />

                                <div className="flex items-start gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                                        <input
                                            ref={termsRef}
                                            type="checkbox"
                                            id="terms"
                                            name="terms"
                                            className={`h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-green-500 focus:ring-green-500 focus:ring-offset-neutral-900 ${validationErrors.terms ? "border-red-500 ring-2 ring-red-500" : ""}`}
                                        />
                                    </span>
                                    <label htmlFor="terms" className="pt-2.5 text-sm text-white/80">
                                        {t.contact.termsBefore}{" "}
                                        <a
                                            href="/Politica_Proteccion_Datos_Colombia.pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-400 underline hover:text-green-300"
                                        >
                                            {t.contact.termsLink}
                                        </a>{" "}
                                        {t.contact.termsAfter}
                                    </label>
                                </div>
                                {validationErrors.terms && (
                                    <p role="alert" className="-mt-6 text-sm text-red-400">
                                        {validationErrors.terms}
                                    </p>
                                )}

                                {submitStatus === "success" && (
                                    <p role="status" className="rounded border border-green-500 bg-green-500/10 p-4 text-green-400">
                                        {t.contact.success}
                                    </p>
                                )}

                                {submitStatus === "error" && (
                                    <p role="alert" className="rounded border border-red-500 bg-red-500/10 p-4 text-red-400">
                                        {t.contact.error}
                                    </p>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{
                                        scale: isSubmitting ? 1 : 1.02,
                                        backgroundColor: isSubmitting ? "transparent" : "#ffffff",
                                        color: isSubmitting ? "#ffffff" : "#1a1a1a",
                                    }}
                                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                    className="mt-8 w-full border border-white bg-transparent py-4 text-center text-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? t.contact.sending : t.contact.send}
                                </motion.button>
                            </form>
                        </div>

                        <div className="lg:pl-12">
                            <div>
                                <h3 className="mb-6 text-2xl font-semibold text-white">{t.contact.contactTitle}</h3>
                                <div className="mb-8 space-y-2">
                                    <p>
                                        <span className="sr-only">{t.contact.phoneLabel}: </span>
                                        <a href="tel:+573142793431" className="text-white/80 underline-offset-4 hover:text-white hover:underline">
                                            +57 314 279 3431
                                        </a>
                                    </p>
                                    <p>
                                        <a
                                            href="https://wa.me/573142793431"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/80 underline-offset-4 hover:text-white hover:underline"
                                        >
                                            {t.contact.whatsappLabel}: +57 314 279 3431
                                        </a>
                                    </p>
                                </div>

                                <h3 className="mb-6 text-2xl font-semibold text-white">{t.contact.socialMedia}</h3>
                                <div className="space-y-2">
                                    {socialLinks.map((link) => (
                                        <a
                                            key={link.name}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-white/80 transition-colors hover:text-white"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
