"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { LANGUAGE_COOKIE, parseLanguage, languageToHtmlLang, SUPPORTED_LANGUAGES } from "@/lib/language"
import type { Language } from "./translations"

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = "em-language"

function persistLanguage(lang: Language) {
    try {
        window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
        // Sin persistencia, el idioma solo vive en esta página.
    }
    document.cookie = `${LANGUAGE_COOKIE}=${lang}; path=/; max-age=31536000; SameSite=Lax`
}

export function LanguageProvider({
    children,
    initialLanguage = "es",
}: {
    children: ReactNode
    initialLanguage?: Language
}) {
    const [language, setLanguageState] = useState<Language>(initialLanguage)

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY)
            const parsed = parseLanguage(stored)
            if (stored && SUPPORTED_LANGUAGES.includes(parsed) && parsed !== language) {
                setLanguageState(parsed)
                persistLanguage(parsed)
            }
        } catch {
            // localStorage bloqueado: se queda en el idioma del servidor.
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only hydrate from storage once
    }, [])

    useEffect(() => {
        document.documentElement.lang = languageToHtmlLang(language)
    }, [language])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        persistLanguage(lang)
        document.documentElement.lang = languageToHtmlLang(lang)
    }

    return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
