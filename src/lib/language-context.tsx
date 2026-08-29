"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Language } from "./translations"

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = "em-language"
const SUPPORTED: Language[] = ["es", "en", "fr"]

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("es")

    // Se lee después del montaje para no romper la hidratación: el servidor
    // siempre renderiza en español y el cliente ajusta si hay preferencia guardada.
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null
            if (stored && SUPPORTED.includes(stored)) {
                setLanguageState(stored)
            }
        } catch {
            // localStorage bloqueado (modo privado, cookies deshabilitadas): se queda en "es".
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        try {
            window.localStorage.setItem(STORAGE_KEY, lang)
        } catch {
            // Sin persistencia, el idioma solo vive en esta página.
        }
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
