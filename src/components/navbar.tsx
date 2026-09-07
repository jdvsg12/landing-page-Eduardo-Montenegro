"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { getTranslation, type Language } from "@/lib/translations"
import { socialLinks, type SocialLink } from "@/lib/social-links"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

const languages: { code: Language; label: string }[] = [
    { code: "es", label: "ESP" },
    { code: "en", label: "ENG" },
    { code: "fr", label: "FRA" },
]

const SCROLL_THRESHOLD = 50
const HERO_OFFSET = 100
const CONTACT_OFFSET = 100

interface NavbarProps {
    /**
     * "page" para las páginas internas: no hay hero ni secciones que observar,
     * así que el fondo va sólido, el texto oscuro y los enlaces apuntan a la
     * home con ancla en vez de a un ancla local que no existe.
     */
    variant?: "home" | "page"
}

export function Navbar({ variant = "home" }: NavbarProps = {}) {
    const isPage = variant === "page"
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
    const [isInHero, setIsInHero] = useState(true)
    const [isInContact, setIsInContact] = useState(false)
    const [isInServices, setIsInServices] = useState(false)
    const { language, setLanguage } = useLanguage()
    const t = getTranslation(language)
    const menuButtonRef = useRef<HTMLButtonElement>(null)
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })

    const anchor = (id: string) => (isPage ? `/#${id}` : `#${id}`)

    const navLinks = [
        { name: t.nav.about, href: anchor("about") },
        { name: t.nav.services, href: anchor("services") },
        { name: t.nav.faq, href: anchor("faq") },
        { name: t.nav.contact, href: anchor("contact") },
    ]

    const updateButtonPosition = useCallback(() => {
        if (menuButtonRef.current) {
            const rect = menuButtonRef.current.getBoundingClientRect()
            setButtonPosition({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            })
        }
    }, [])

    useEffect(() => {
        if (isPage) {
            updateButtonPosition()
            window.addEventListener("resize", updateButtonPosition, { passive: true })
            return () => window.removeEventListener("resize", updateButtonPosition)
        }

        const handleScroll = () => {
            const scrollY = window.scrollY
            const navBand = 80

            setIsScrolled(scrollY > SCROLL_THRESHOLD)
            setIsInHero(scrollY < window.innerHeight - HERO_OFFSET)

            const servicesSection = document.getElementById("services")
            if (servicesSection) {
                const rect = servicesSection.getBoundingClientRect()
                setIsInServices(rect.top <= navBand && rect.bottom > navBand)
            }

            const contactSection = document.getElementById("contact")
            if (contactSection) {
                setIsInContact(contactSection.getBoundingClientRect().top <= CONTACT_OFFSET)
            }
        }

        handleScroll()
        updateButtonPosition()

        window.addEventListener("scroll", handleScroll, { passive: true })
        window.addEventListener("resize", updateButtonPosition, { passive: true })

        return () => {
            window.removeEventListener("scroll", handleScroll)
            window.removeEventListener("resize", updateButtonPosition)
        }
    }, [updateButtonPosition, isPage])

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : ""
        return () => {
            document.body.style.overflow = ""
        }
    }, [isMobileMenuOpen])

    useEffect(() => {
        const media = window.matchMedia("(min-width: 1024px)")
        const closeOnDesktop = () => {
            if (media.matches) setIsMobileMenuOpen(false)
        }
        closeOnDesktop()
        media.addEventListener("change", closeOnDesktop)
        return () => media.removeEventListener("change", closeOnDesktop)
    }, [])

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return
            setIsLangMenuOpen(false)
            setIsMobileMenuOpen(false)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    const handleMenuToggle = () => {
        updateButtonPosition()
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const handleLanguageChange = (langCode: Language) => {
        setLanguage(langCode)
        setIsLangMenuOpen(false)
    }

    const isDarkSection = !isPage && (isInHero || isInContact || isInServices)
    const textColorClass = isDarkSection ? "text-white" : "text-ink"

    const navbarBgClass = isPage
        ? "bg-paper/85 backdrop-blur-sm"
        : isInContact
        ? "bg-ink"
        : isInServices
            ? "bg-sage-deep"
            : isScrolled && !isInHero
                ? "bg-paper"
                : "bg-transparent"

    const menuButtonBgClass = isMobileMenuOpen
        ? "bg-white"
        : isDarkSection
            ? "bg-white/20 backdrop-blur-sm"
            : "bg-neutral-900/10"

    const hamburgerColorClass = isMobileMenuOpen
        ? "bg-neutral-900"
        : isDarkSection
            ? "bg-white"
            : "bg-neutral-900"

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${navbarBgClass}`}
            >
                <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
                    <Logo textColor={textColorClass} href={isPage ? "/" : "#"} />
                    <DesktopNav
                        navLinks={navLinks}
                        textColor={textColorClass}
                        isLangMenuOpen={isLangMenuOpen}
                        setIsLangMenuOpen={setIsLangMenuOpen}
                        language={language}
                        onLanguageChange={handleLanguageChange}
                        isInContact={isInContact || isInServices}
                        languageLabel={t.nav.language}
                    />
                    <MobileMenuButton
                        ref={menuButtonRef}
                        onClick={handleMenuToggle}
                        bgClass={menuButtonBgClass}
                        hamburgerClass={hamburgerColorClass}
                        isOpen={isMobileMenuOpen}
                        openLabel={t.nav.openMenu}
                        closeLabel={t.nav.closeMenu}
                    />
                </nav>
            </header>

            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                buttonPosition={buttonPosition}
                navLinks={navLinks}
                socialLinks={socialLinks}
                language={language}
                onLanguageChange={setLanguage}
                t={t}
            />
        </>
    )
}

function Logo({ textColor, href = "#" }: { textColor: string; href?: string }) {
    return (
        <a href={href} className={`transition-colors duration-300 ${textColor}`}>
            <span className="text-[1.05rem] font-semibold sm:text-lg lg:text-xl">Eduardo Montenegro</span>
        </a>
    )
}

interface DesktopNavProps {
    navLinks: Array<{ name: string; href: string }>
    textColor: string
    isLangMenuOpen: boolean
    setIsLangMenuOpen: (open: boolean) => void
    language: Language
    onLanguageChange: (lang: Language) => void
    isInContact: boolean
    languageLabel: string
}

function DesktopNav({
    navLinks,
    textColor,
    isLangMenuOpen,
    setIsLangMenuOpen,
    language,
    onLanguageChange,
    isInContact,
    languageLabel,
}: DesktopNavProps) {
    return (
        <div className="hidden items-center gap-8 lg:flex">
            <ul className="flex items-center gap-8">
                {navLinks.map((link) => (
                    <li key={link.name}>
                        <a
                            href={link.href}
                            className={`text-base font-medium transition-colors duration-300 lg:text-lg ${textColor} hover:opacity-70`}
                        >
                            {link.name}
                        </a>
                    </li>
                ))}
            </ul>
            <LanguageSelector
                isOpen={isLangMenuOpen}
                setIsOpen={setIsLangMenuOpen}
                language={language}
                onLanguageChange={onLanguageChange}
                textColor={textColor}
                isInContact={isInContact}
                languageLabel={languageLabel}
            />
        </div>
    )
}

interface LanguageSelectorProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    language: Language
    onLanguageChange: (lang: Language) => void
    textColor: string
    isInContact: boolean
    languageLabel: string
}

function LanguageSelector({
    isOpen,
    setIsOpen,
    language,
    onLanguageChange,
    textColor,
    isInContact,
    languageLabel,
}: LanguageSelectorProps) {
    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={languageLabel}
                className={`flex min-h-11 items-center gap-1 text-base font-medium transition-colors duration-300 lg:text-lg ${textColor} hover:opacity-70`}
            >
                {languages.find((l) => l.code === language)?.label}
                <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        role="listbox"
                        aria-label={languageLabel}
                        className={`absolute right-0 top-full mt-2 min-w-28 py-1 ${isInContact ? "bg-ink" : "bg-paper"}`}
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                type="button"
                                role="option"
                                aria-selected={language === lang.code}
                                onClick={() => onLanguageChange(lang.code)}
                                className={`block min-h-11 w-full px-4 py-2 text-left text-sm transition-colors ${isInContact
                                    ? `hover:bg-white/10 ${language === lang.code ? "font-semibold text-white" : "text-white/80"}`
                                    : `hover:bg-surface ${language === lang.code ? "font-semibold text-ink" : "text-sage-ink"}`
                                    }`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

interface MobileMenuButtonProps {
    onClick: () => void
    bgClass: string
    hamburgerClass: string
    isOpen: boolean
    openLabel: string
    closeLabel: string
}

const MobileMenuButton = React.forwardRef<HTMLButtonElement, MobileMenuButtonProps>(
    ({ onClick, bgClass, hamburgerClass, isOpen, openLabel, closeLabel }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                onClick={onClick}
                aria-expanded={isOpen}
                aria-label={isOpen ? closeLabel : openLabel}
                className={`relative z-[60] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 lg:hidden ${bgClass}`}
            >
                <div className="flex flex-col items-center justify-center gap-1.5">
                    <motion.span
                        animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
                        className={`block h-0.5 w-5 transition-colors duration-300 ${hamburgerClass}`}
                    />
                    <motion.span
                        animate={{ opacity: isOpen ? 0 : 1 }}
                        className={`block h-0.5 w-5 transition-colors duration-300 ${hamburgerClass}`}
                    />
                    <motion.span
                        animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
                        className={`block h-0.5 w-5 transition-colors duration-300 ${hamburgerClass}`}
                    />
                </div>
            </button>
        )
    }
)

MobileMenuButton.displayName = "MobileMenuButton"

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
    buttonPosition: { x: number; y: number }
    navLinks: Array<{ name: string; href: string }>
    socialLinks: SocialLink[]
    language: Language
    onLanguageChange: (lang: Language) => void
    t: any
}

function MobileMenu({
    isOpen,
    onClose,
    buttonPosition,
    navLinks,
    socialLinks,
    language,
    onLanguageChange,
    t
}: MobileMenuProps) {
    const reduceMotion = usePrefersReducedMotion()

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={
                        reduceMotion
                            ? { opacity: 0 }
                            : { clipPath: `circle(0px at ${buttonPosition.x}px ${buttonPosition.y}px)` }
                    }
                    animate={
                        reduceMotion
                            ? { opacity: 1 }
                            : { clipPath: `circle(150% at ${buttonPosition.x}px ${buttonPosition.y}px)` }
                    }
                    exit={
                        reduceMotion
                            ? { opacity: 0 }
                            : { clipPath: `circle(0px at ${buttonPosition.x}px ${buttonPosition.y}px)` }
                    }
                    transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed inset-0 z-[55] bg-ink lg:hidden"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white"
                        aria-label={t.nav.closeMenu}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-neutral-900">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="flex h-dvh flex-col justify-between px-8 py-16">
                        <div>
                            <a
                                href="#"
                                className="mb-8 block text-white"
                                onClick={onClose}
                            >
                                <span className="text-xl font-normal">Eduardo Montenegro</span>
                            </a>

                            <ul className="mb-8 flex flex-col gap-6">
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            onClick={onClose}
                                            className="text-4xl font-light text-white transition-colors hover:text-neutral-400"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-8">
                            <div>
                                <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-500">{t.nav.contact}</h4>
                                <a href="mailto:formacion@eduardomontenegro.com" className="mb-2 block text-sm text-white hover:text-neutral-400">
                                    formacion@eduardomontenegro.com
                                </a>
                                <a href="tel:+573142793431" className="block text-sm text-white hover:text-neutral-400">
                                    +57 314 279 3431
                                </a>
                            </div>
                            <div className="flex flex-row justify-between">
                                <div>
                                    <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-500">Social Media</h4>
                                    <ul className="flex flex-col gap-2">
                                        {socialLinks.map((link) => (
                                            <li key={link.name}>
                                                <a
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-white transition-colors hover:text-neutral-400"
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="col-span-2">
                                    <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-500">Language</h4>
                                    <div className="flex flex-col gap-4">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => onLanguageChange(lang.code)}
                                                className={`text-sm transition-colors text-left ${language === lang.code
                                                    ? "font-semibold text-white underline underline-offset-4"
                                                    : "text-neutral-500 hover:text-white"
                                                    }`}
                                            >
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}