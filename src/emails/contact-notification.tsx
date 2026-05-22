import React from 'react'

interface ContactEmailProps {
    name: string
    email: string
    phone?: string
    services: string
    message?: string
    language: string
    contactId: string
}

const ContactNotificationEmail = ({
    name,
    email,
    phone,
    services,
    message,
    language,
    contactId,
}: ContactEmailProps) => {
    const replyEmailLink = `mailto:${email}?subject=Re: Consulta desde el sitio web&body=Hola ${name},%0D%0A%0D%0AGracias por contactarnos...`
    const whatsappLink = phone ? `https://wa.me/${phone}?text=Hola ${encodeURIComponent(name)}, gracias por contactarnos desde nuestro sitio web.` : ''

    return (
        <html>
            <body style={{
                backgroundColor: '#212529',
                color: '#d4d4d8',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                margin: 0,
                padding: '32px 16px'
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{
                            fontSize: '28px',
                            color: '#f4f4f5',
                            margin: 0,
                            fontWeight: 400
                        }}>
                            Eduardo <span style={{ fontWeight: 700, fontStyle: 'italic' }}>Montenegro</span>
                        </h1>
                    </div>

                    <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        padding: '32px',
                        borderRadius: '8px',
                        border: '1px solid #3f3f46',
                        marginBottom: '24px'
                    }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 600,
                            color: '#fafafa',
                            marginTop: 0,
                            marginBottom: '24px'
                        }}>
                            Nueva Consulta del Sitio Web
                        </h2>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '4px' }}>Nombre</div>
                            <div style={{ color: '#e4e4e7', fontSize: '15px' }}>{name}</div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '4px' }}>Email</div>
                            <a href={`mailto:${email}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                                {email}
                            </a>
                        </div>

                        {phone && (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '4px' }}>Teléfono</div>
                                <div style={{ color: '#e4e4e7', fontSize: '15px' }}>{phone}</div>
                            </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '4px' }}>Servicio</div>
                            <div style={{ color: '#e4e4e7', fontSize: '15px' }}>{services}</div>
                        </div>

                        {message && (
                            <>
                                <hr style={{ border: 'none', borderTop: '1px solid #3f3f46', margin: '24px 0' }} />
                                <div>
                                    <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>Mensaje</div>
                                    <div style={{ color: '#e4e4e7', fontSize: '15px', lineHeight: '1.6' }}>
                                        {message}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                        <a
                            href={replyEmailLink}
                            style={{
                                flex: 1,
                                padding: '14px 24px',
                                borderRadius: '6px',
                                backgroundColor: '#3f3f46',
                                color: '#f4f4f5',
                                fontWeight: 500,
                                textDecoration: 'none',
                                textAlign: 'center',
                                fontSize: '14px'
                            }}
                        >
                            📧 Email
                        </a>
                        {phone && (
                            <a
                                href={whatsappLink}
                                style={{
                                    flex: 1,
                                    padding: '14px 24px',
                                    borderRadius: '6px',
                                    backgroundColor: '#16a34a',
                                    color: '#ffffff',
                                    fontWeight: 500,
                                    textDecoration: 'none',
                                    textAlign: 'center',
                                    fontSize: '14px'
                                }}
                            >
                                💬 WhatsApp
                            </a>
                        )}
                    </div>

                    <div style={{ fontSize: '12px', color: '#71717a', textAlign: 'center' }}>
                        <div>ID: {contactId}</div>
                        <div style={{ marginTop: '4px' }}>
                            {new Date().toLocaleString('es-CO', {
                                timeZone: 'America/Bogota',
                                dateStyle: 'short',
                                timeStyle: 'short'
                            })}
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}

export default ContactNotificationEmail