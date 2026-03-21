"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform } from "motion/react"
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
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    })

    const { language } = useLanguage()
    const t = getTranslation(language)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    const contentY = useTransform(scrollYProgress, [0, 0.5, 1], ["10%", "0%", "-10%"])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitStatus('idle')
        setValidationErrors({})

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            services: formData.get('services') as string,
            message: formData.get('message') as string,
            terms: termsRef.current?.checked || false,
            language: language,
        }

        // Validación cliente-side con Zod usando parse y try-catch
        const contactFormSchema = createContactFormSchema(language)

        try {
            contactFormSchema.parse(data)
            // Si llega aquí, la validación pasó
        } catch (validationError) {
            const errors = formatZodErrors(validationError as z.ZodError)
            setValidationErrors(errors)
            setIsSubmitting(false)
            return
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
                console.error('API Error:', errorData)
                throw new Error(errorData.error || 'Error al enviar el formulario')
            }

            setSubmitStatus('success')
            const form = e.target as HTMLFormElement
            if (form) {
                form.reset()
            }

            // Resetear el estado después de 5 segundos
            setTimeout(() => {
                setSubmitStatus('idle')
            }, 5000)
        } catch (error) {
            console.error('Error:', error)
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section
            ref={sectionRef}
            id="contact"
            className="relative z-30 min-h-[150vh] bg-[#1a1a1a] shadow-[0_-20px_60px_rgba(0,0,0,0.3)]"
        >
            <div className="sticky top-0 flex min-h-screen items-center overflow-hidden py-24 lg:py-32">
                <motion.div style={{ y: contentY }} className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-16 lg:grid-cols-2">
                        {/* Left side - Form */}
                        <div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mb-12 font-serif text-3xl font-light text-white lg:text-4xl"
                            >
                                {t.contact.title}
                            </motion.h2>

                            <form className="space-y-8" onSubmit={handleSubmit} noValidate>
                                {/* Mensajes de error de validación */}
                                {Object.keys(validationErrors).length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded border border-red-500 bg-red-500/10 p-4 text-red-400"
                                    >
                                        <p className="font-medium mb-2">{t.contact.validation.formTitle}</p>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {Object.entries(validationErrors).map(([field, message]) => (
                                                <li key={field}>{message}</li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}

                                <div className="grid gap-8 md:grid-cols-2">
                                    <AnimatedInput
                                        label={t.contact.name}
                                        placeholder={t.contact.namePlaceholder}
                                        name="name"
                                        error={validationErrors.name}
                                    />
                                    <AnimatedInput
                                        label={t.contact.email}
                                        placeholder={t.contact.emailPlaceholder}
                                        name="email"
                                        type="email"
                                        error={validationErrors.email}
                                    />
                                </div>

                                <div className="grid gap-8 md:grid-cols-2">
                                    <AnimatedInput
                                        label={t.contact.phone}
                                        placeholder="+57 300 123 4567"
                                        name="phone"
                                        type="tel"
                                        error={validationErrors.phone}
                                    />
                                    <AnimatedSelect
                                        label={t.contact.servicesLabel}
                                        name="services"
                                        options={[
                                            { value: '', label: t.contact.servicesPlaceholder },
                                            { value: 'Psicoanálisis adulto', label: 'Psicoanálisis adulto' },
                                            { value: 'Supervisión clínica profesionales', label: 'Supervisión clínica profesionales' },
                                            { value: 'Grupos de estudio', label: 'Grupos de estudio' },
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

                                {/* Terms and Conditions Checkbox */}
                                <div className="flex items-start gap-3">
                                    <input
                                        ref={termsRef}
                                        type="checkbox"
                                        id="terms"
                                        name="terms"
                                        className={`mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-green-500 focus:ring-green-500 focus:ring-offset-neutral-900 ${validationErrors.terms ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                    />
                                    <label htmlFor="terms" className="text-sm text-neutral-400">
                                        Acepto los <a href="/Politica_Proteccion_Datos_Colombia.pdf" target="_blank" className="text-green-400 hover:text-green-300 underline">términos y condiciones</a> y la política de privacidad
                                    </label>
                                </div>
                                {validationErrors.terms && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-400 -mt-6"
                                    >
                                        {validationErrors.terms}
                                    </motion.p>
                                )}

                                {/* Status Messages */}
                                {submitStatus === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded border border-green-500 bg-green-500/10 p-4 text-green-400"
                                    >
                                        ¡Mensaje enviado exitosamente! Te contactaremos pronto.
                                    </motion.div>
                                )}

                                {submitStatus === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded border border-red-500 bg-red-500/10 p-4 text-red-400"
                                    >
                                        Hubo un error al enviar el mensaje. Por favor, intenta de nuevo. Verifica que hayas completado todos los campos y aceptado los términos.
                                    </motion.div>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: isSubmitting ? 1 : 1.02, backgroundColor: isSubmitting ? "transparent" : "#ffffff", color: isSubmitting ? "#ffffff" : "#1a1a1a" }}
                                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                    className="mt-8 w-full border border-white bg-transparent py-4 text-center text-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Enviando...' : t.contact.send}
                                </motion.button>
                            </form>
                        </div>

                        {/* Right side - Contact Info */}
                        <div className="lg:pl-12">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="mb-6 text-2xl font-semibold text-white">{t.contact.contactTitle}</h3>
                                <div className="mb-8 space-y-2">
                                    {/* <p className="text-neutral-400">psicoanalisis@eduardomontenegro.com</p>
                                    <p className="text-neutral-400">formacion@eduardomontenegro.com</p> */}
                                    <p className="text-neutral-400">+57 3142793431</p>
                                    <p className="text-neutral-400">WhatsApp: +57 3142793431</p>
                                </div>

                                <h3 className="mb-6 text-2xl font-semibold text-white">{t.contact.socialMedia}</h3>
                                <div className="space-y-2">
                                    {socialLinks.map((link) => (
                                        <motion.a
                                            key={link.name}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ x: 4, color: "#ffffff" }}
                                            className="block text-neutral-400 transition-colors"
                                        >
                                            {link.label}
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}