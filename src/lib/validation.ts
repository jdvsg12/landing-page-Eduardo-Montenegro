import { z } from 'zod'

export const contactFormSchema = z.object({
    name: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
    
    email: z.string()
        .min(1, 'El correo electrónico es obligatorio')
        .email('Por favor ingresa un correo electrónico válido')
        .max(254, 'El correo es demasiado largo'),
    
    phone: z.string()
        .min(1, 'El teléfono es obligatorio')
        .regex(/^[\d\s\-\+\(\)]+$/, 'El teléfono solo puede contener números, espacios, guiones y paréntesis')
        .refine((val) => val.replace(/\D/g, '').length >= 7, 'El teléfono debe tener al menos 7 dígitos')
        .refine((val) => val.replace(/\D/g, '').length <= 15, 'El teléfono no puede tener más de 15 dígitos'),
    
    services: z.string()
        .min(1, 'Debes seleccionar un servicio'),
    
    message: z.string()
        .max(1000, 'El mensaje no puede exceder 1000 caracteres')
        .optional()
        .or(z.literal('')),
    
    terms: z.boolean()
        .refine((val) => val === true, 'Debes aceptar los términos y condiciones'),
    
    language: z.enum(['es', 'en', 'fr']).default('es'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

// Helper function to format validation errors
export function formatZodErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {}
    error.errors.forEach((err) => {
        const field = err.path[0] as string
        errors[field] = err.message
    })
    return errors
}
