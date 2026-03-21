import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import ContactNotificationEmail from '@/emails/contact-notification'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, phone, services, message, language } = body

        // Validación básica
        if (!name || !email || !phone || !services) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            )
        }

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
                message,
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
                { error: 'Error al enviar el email' },
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