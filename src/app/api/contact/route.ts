import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import ContactNotificationEmail from '@/emails/contact-notification'
import { createContactFormSchema, formatZodErrors } from '@/lib/validation'
import type { Language } from '@/lib/translations'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validación con Zod
        const contactFormSchema = createContactFormSchema((body.language as Language) || 'es')
        const result = contactFormSchema.safeParse(body)

        if (!result.success) {
            const errors = formatZodErrors(result.error)
            return NextResponse.json(
                {
                    error: 'Error de validación',
                    errors,
                    message: Object.values(errors)[0] // Primer mensaje de error
                },
                { status: 400 }
            )
        }

        const { name, email, phone, services, message, language } = result.data

        // Formatear teléfono para WhatsApp (eliminar espacios, guiones, etc.)
        const cleanPhone = phone.replace(/\D/g, '')
        const whatsappPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`

        // Enviar email de notificación
        try {
            const emailHtml = await render(ContactNotificationEmail({
                name,
                email,
                phone: whatsappPhone,
                services,
                message: message || '',
                language,
                contactId: Date.now().toString(),
            }))

            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL!,
                to: 'e.montenegroflorez@gmail.com',
                subject: `Nueva consulta de ${name}`,
                html: emailHtml,
            })
        } catch (emailError) {
            console.error('Error enviando email:', emailError)
            return NextResponse.json(
                { error: 'Error al enviar el email. Por favor intenta de nuevo.' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Consulta enviada exitosamente',
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error en API de contacto:', error)
        return NextResponse.json(
            { error: 'Error procesando la solicitud' },
            { status: 500 }
        )
    }
}