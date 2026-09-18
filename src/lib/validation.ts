import { z } from 'zod'
import { getTranslation } from './translations'
import type { Language } from './translations'

type ValidationMessages = ReturnType<typeof getTranslation>['contact']['validation']

/**
 * Nombres reales en los tres idiomas del sitio: cualquier letra Unicode
 * (tildes, ñ, ç, diéresis), espacios, apóstrofos y guiones, con al menos una letra.
 */
const NAME_PATTERN = /^[\p{L}\p{M}\s'’-]+$/u

function nameField(t: ValidationMessages) {
    return z.string()
        .trim()
        .min(2, t.nameMin)
        .max(100, t.nameMax)
        .regex(NAME_PATTERN, t.nameFormat)
        .refine((val) => /\p{L}/u.test(val), t.nameFormat)
}

export function createContactFormSchema(lang: Language) {
    const t = getTranslation(lang).contact.validation

    return z.object({
        name: nameField(t),

        email: z.string()
            .min(1, t.emailRequired)
            .email(t.emailInvalid)
            .max(254, t.emailMax),

        phone: z.string()
            .min(1, t.phoneRequired)
            .regex(/^[\d\s\-\+\(\)]+$/, t.phoneFormat)
            .refine((val) => val.replace(/\D/g, '').length >= 7, t.phoneMin)
            .refine((val) => val.replace(/\D/g, '').length <= 15, t.phoneMax),

        services: z.string()
            .min(1, t.servicesRequired),

        message: z.string()
            .max(1000, t.messageMax)
            .optional()
            .or(z.literal('')),

        terms: z.boolean()
            .refine((val) => val === true, t.termsRequired),

        language: z.enum(['es', 'en', 'fr']).default(lang),
    })
}

export type ContactFormData = z.infer<ReturnType<typeof createContactFormSchema>>

export function formatZodErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {}
    error.errors.forEach((err) => {
        const field = err.path[0] as string
        // El primer error de cada campo es el más útil ("obligatorio" antes que "formato inválido").
        errors[field] ??= err.message
    })
    return errors
}

export function createServiceLeadSchema(lang: Language) {
    const t = getTranslation(lang).contact.validation

    return z.object({
        name: nameField(t),

        email: z.string()
            .min(1, t.emailRequired)
            .email(t.emailInvalid)
            .max(254, t.emailMax),

        phone: z.string()
            .min(1, t.phoneRequired)
            .regex(/^[\d\s\-\+\(\)]+$/, t.phoneFormat)
            .refine((val) => val.replace(/\D/g, '').length >= 7, t.phoneMin)
            .refine((val) => val.replace(/\D/g, '').length <= 15, t.phoneMax),

        message: z.string()
            .max(1000, t.messageMax)
            .optional()
            .or(z.literal('')),

        terms: z.boolean()
            .refine((val) => val === true, t.termsRequired),

        language: z.enum(['es', 'en', 'fr']).default(lang),
    })
}

export type ServiceLeadFormData = z.infer<ReturnType<typeof createServiceLeadSchema>>
