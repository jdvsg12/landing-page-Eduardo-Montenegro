import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { render } from "@react-email/render"
import ContactNotificationEmail from "@/emails/contact-notification"
import { createServiceLeadSchema, formatZodErrors } from "@/lib/validation"
import { getServiceBySlug, saveServiceLead } from "@/lib/db-services"
import { pickLocale } from "@/lib/i18n-field"
import type { Language } from "@/lib/translations"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const service = await getServiceBySlug(slug)

    if (!service || !service.published) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const language = (body.language as Language) || "es"
    const result = createServiceLeadSchema(language).safeParse(body)

    if (!result.success) {
      const errors = formatZodErrors(result.error)
      return NextResponse.json(
        { error: "Error de validación", errors, message: Object.values(errors)[0] },
        { status: 400 }
      )
    }

    const { name, email, phone, message } = result.data
    const serviceName = pickLocale(service.title, language) || slug

    await saveServiceLead({
      id: crypto.randomUUID(),
      serviceSlug: slug,
      name,
      email,
      phone,
      message: message || "",
    })

    const cleanPhone = phone.replace(/\D/g, "")
    const whatsappPhone = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`

    try {
      const emailHtml = await render(
        ContactNotificationEmail({
          name,
          email,
          phone: whatsappPhone,
          services: serviceName,
          message: message || "",
          language,
          contactId: Date.now().toString(),
        })
      )

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        subject: `Nueva inscripción a "${serviceName}" de ${name}`,
        html: emailHtml,
      })
    } catch (emailError) {
      // El lead ya quedó guardado en la base; el correo es la notificación,
      // no la fuente de verdad, así que no se pierde la inscripción.
      console.error("Error enviando email de inscripción:", emailError)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error en API de inscripción a servicio:", error)
    return NextResponse.json({ error: "Error procesando la solicitud" }, { status: 500 })
  }
}
