import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { cookies } from "next/headers"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/language-context"
import { parseLanguage, languageToHtmlLang } from "@/lib/language"
import { LANGUAGE_COOKIE } from "@/lib/language"
import { SkipToContent } from "@/components/skip-to-content"
import "./globals.css"

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
})

export const metadata: Metadata = {
    title: "Eduardo Montenegro Flórez | Psicólogo y Psicoanalista",
    description:
        "Especialista en Psicopatología y Salud Mental. Acompañamiento en malestar persistente, duelos y experiencias que dejan huella. Ningún sufrimiento es insignificante.",
    openGraph: {
        title: "Eduardo Montenegro Flórez | Psicólogo y Psicoanalista",
        description: "Ningún sufrimiento es insignificante. Atención clínica para adultos, presencial y online.",
        url: "https://www.eduardomontenegroflorez.com",
        siteName: "Eduardo Montenegro Flórez",
        locale: "es_CO",
        type: "website",
        images: [
            {
                url: "/image_c4bc3f.jpeg",
                width: 1200,
                height: 630,
                alt: "Eduardo Montenegro Flórez - Psicólogo y Psicoanalista",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Eduardo Montenegro Flórez | Psicólogo y Psicoanalista",
        description: "Especialista en Psicopatología y Salud Mental. Ningún sufrimiento es insignificante.",
        images: ["/image_c4bc3f.jpeg"],
    },

    icons: {
        icon: [
            {
                url: "/favicon.ico",
                media: "(prefers-color-scheme: light)",
            },
            {
                url: "/icon-dark.png",
                media: "(prefers-color-scheme: dark)",
            },
        ],
    },
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const cookieStore = await cookies()
    const language = parseLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value)
    const htmlLang = languageToHtmlLang(language)

    return (
        <html lang={htmlLang} className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
            <body className="font-sans antialiased">
                <LanguageProvider initialLanguage={language}>
                    <SkipToContent />
                    {children}
                </LanguageProvider>
                <Analytics />
            </body>
        </html>
    )
}
