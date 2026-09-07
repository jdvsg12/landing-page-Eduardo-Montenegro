"use client"

import { useState } from "react"
import { z } from "zod"
import { AnimatedInput } from "@/components/ui/animated-input"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import { AnimatedSelect } from "./ui/animated-select"
import { socialLinks } from "@/lib/social-links"
import { createContactFormSchema, formatZodErrors } from "@/lib/validation"

export function ContactSection() {
    const [termsAccepted, setTermsAccepted] = useState(false)
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
            terms: termsAccepted,
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
            setTermsAccepted(false)
        } catch (error) {
            console.error("Error:", error)
            setSubmitStatus("error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section
            id="contact"
            className="relative scroll-mt-20 min-h-svh bg-ink"
        >
            <div className="flex min-h-svh items-center py-24 lg:py-32">
                <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-16 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-12 font-serif text-3xl font-light italic text-white lg:text-4xl">
                                {t.contact.title}
                            </h2>

                            <form className="space-y-8" onSubmit={handleSubmit} noValidate>
                                {Object.keys(validationErrors).length > 0 && (
                                    <div
                                        role="alert"
                                        className="border border-red-400/80 bg-red-500/10 p-4 text-red-300"
                                    >
                                        <p className="mb-2 font-medium">{t.contact.validation.formTitle}</p>
                                        <ul className="list-inside list-disc space-y-1 text-sm">
                                            {Object.entries(validationErrors).map(([field, message]) => (
                                                <li key={field}>{message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="grid gap-8 md:grid-cols-2 md:[&>*]:min-w-0">
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

                                <div className="grid gap-8 md:grid-cols-2 md:[&>*]:min-w-0">
                                    <AnimatedInput
                                        label={t.contact.phone}
                                        placeholder={t.contact.phonePlaceholder}
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
                                            type="checkbox"
                                            id="terms"
                                            name="terms"
                                            checked={termsAccepted}
                                            onChange={(event) => setTermsAccepted(event.target.checked)}
                                            className={`h-4 w-4 cursor-pointer rounded-sm border-white/40 bg-ink accent-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${validationErrors.terms ? "outline-2 outline-red-400" : ""}`}
                                        />
                                    </span>
                                    <label htmlFor="terms" className="pt-2.5 text-sm text-white/80">
                                        {t.contact.termsBefore}{" "}
                                        <a
                                            href="/Politica_Proteccion_Datos_Colombia.pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white underline underline-offset-4 hover:text-white"
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
                                    <p role="status" className="border border-white/30 bg-white/5 p-4 text-white">
                                        {t.contact.success}
                                    </p>
                                )}

                                {submitStatus === "error" && (
                                    <p role="alert" className="border border-red-400/80 bg-red-500/10 p-4 text-red-300">
                                        {t.contact.error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-8 w-full min-h-12 border border-white bg-transparent py-4 text-center text-white transition-colors duration-200 hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? t.contact.sending : t.contact.send}
                                </button>
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
                                            className="text-white/80 underline-offset-4 hover:text-[#25D366] hover:underline"
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
                                            className="block min-h-11 text-white/80 transition-colors hover:text-white"
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
