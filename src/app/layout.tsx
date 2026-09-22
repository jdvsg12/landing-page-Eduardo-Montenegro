import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { cookies } from "next/headers"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/language-context"
import { parseLanguage, languageToHtmlLang } from "@/lib/language"
import { LANGUAGE_COOKIE } from "@/lib/language"
import { SkipToContent } from "@/components/skip-to-content"
import { getSiteContent } from "@/lib/db-content"
import { pickLocale } from "@/lib/i18n-field"
import "./globals.css"

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
})

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
}

function safeUrl(value: string) {
    try {
        return value ? new URL(value) : undefined
    } catch {
        return undefined
    }
}

const OG_LOCALE = { es: "es_CO", en: "en_US", fr: "fr_FR" } as const

export async function generateMetadata(): Promise<Metadata> {
    const [cookieStore, seo] = await Promise.all([cookies(), getSiteContent("seo")])
    const language = parseLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value)
    const title = pickLocale(seo.title, language)
    const description = pickLocale(seo.description, language)
    const keywords = pickLocale(seo.keywords, language)
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    const images = seo.ogImage ? [{ url: seo.ogImage, width: 1200, height: 630, alt: title }] : undefined

    return {
        metadataBase: safeUrl(seo.siteUrl),
        title,
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
        openGraph: {
            title,
            description,
            url: seo.siteUrl || undefined,
            siteName: seo.siteName,
            locale: OG_LOCALE[language],
            type: "website",
            images,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: seo.ogImage ? [seo.ogImage] : undefined,
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
        <html
            lang={htmlLang}
            className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}
            // Next desactiva el smooth scroll al cambiar de ruta: la interna abre arriba sin animación.
            data-scroll-behavior="smooth"
        >
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
