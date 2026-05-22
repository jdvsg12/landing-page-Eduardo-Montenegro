import { z } from 'zod'
import { getTranslation } from './translations'
import type { Language } from './translations'

export function createContactFormSchema(lang: Language) {
    const t = getTranslation(lang).contact.validation

    return z.object({
        name: z.string()
            .min(2, t.nameMin)
            .max(100, t.nameMax)
            .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, t.nameFormat),

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
        errors[field] = err.message
    })
    return errors
}
