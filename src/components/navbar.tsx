"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { getTranslation, type Language } from "@/lib/translations"
import { socialLinks, type SocialLink } from "@/lib/social-links"

const languages: { code: Language; label: string }[] = [
    { code: "es", label: "ESP" },
    { code: "en", label: "ENG" },
    { code: "fr", label: "FRA" },
]

const SCROLL_THRESHOLD = 50
const HERO_OFFSET = 100
const CONTACT_OFFSET = 100
const SERVICES_OFFSET = 100

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
            const heroHeight = window.innerHeight

            setIsScrolled(scrollY > SCROLL_THRESHOLD)
            setIsInHero(scrollY < heroHeight - HERO_OFFSET)

            const servicesSection = document.getElementById("services")
            if (servicesSection) {
                const servicesTop = servicesSection.offsetTop
                const servicesBottom = servicesTop + servicesSection.offsetHeight
                const isInServicesRange = scrollY >= servicesTop - 200 && scrollY < servicesBottom - 200
                setIsInServices(isInServicesRange)
            }

            const contactSection = document.getElementById("contact")
            if (contactSection) {
                const rect = contactSection.getBoundingClientRect()
                setIsInContact(rect.top <= CONTACT_OFFSET)
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

    const handleMenuToggle = () => {
        updateButtonPosition()
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const handleLanguageChange = (langCode: Language) => {
        setLanguage(langCode)
        setIsLangMenuOpen(false)
    }

    const isDarkSection = !isPage && (isInHero || isInContact) && !isInServices
    const textColorClass = isDarkSection ? "text-white" : "text-foreground"

    const navbarBgClass = isPage
        ? "bg-[#F2F1EE]/85 backdrop-blur-sm"
        : isInContact
        ? "bg-[#1a1a1a]"
        : isInServices
            ? "bg-[#D9D9D9]"
            : isScrolled && !isInHero
                ? "bg-white/60 backdrop-blur-2xl"
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
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarBgClass}`}
            >
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                    <Logo textColor={textColorClass} href={isPage ? "/" : "#"} />
                    <DesktopNav
                        navLinks={navLinks}
                        textColor={textColorClass}
                        isLangMenuOpen={isLangMenuOpen}
                        setIsLangMenuOpen={setIsLangMenuOpen}
                        language={language}
                        onLanguageChange={handleLanguageChange}
                        isInContact={isInContact}
                    />
                    <MobileMenuButton
                        ref={menuButtonRef}
                        onClick={handleMenuToggle}
                        bgClass={menuButtonBgClass}
                        hamburgerClass={hamburgerColorClass}
                        isOpen={isMobileMenuOpen}
                    />
                </nav>
            </motion.header>

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
            <span className="text-lg lg:text-xl font-semibold">Eduardo Montenegro</span>
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
}

function DesktopNav({
    navLinks,
    textColor,
    isLangMenuOpen,
    setIsLangMenuOpen,
    language,
    onLanguageChange,
    isInContact
}: DesktopNavProps) {
    return (
        <div className="hidden items-center gap-8 md:flex">
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
}

function LanguageSelector({
    isOpen,
    setIsOpen,
    language,
    onLanguageChange,
    textColor,
    isInContact
}: LanguageSelectorProps) {
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1 text-base font-medium transition-colors duration-300 lg:text-lg ${textColor} hover:opacity-70`}
            >
                {languages.find((l) => l.code === language)?.label}
                <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute right-0 top-full mt-2 rounded-md py-2 backdrop-blur-md ${isInContact ? "bg-white/10" : "bg-white shadow-lg"
                            }`}
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => onLanguageChange(lang.code)}
                                className={`block w-full px-4 py-2 text-left text-sm transition-colors ${isInContact
                                    ? `hover:bg-white/10 ${language === lang.code ? "font-semibold text-white" : "text-neutral-300"}`
                                    : `hover:bg-neutral-100 ${language === lang.code ? "font-semibold text-neutral-900" : "text-neutral-600"}`
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
}

const MobileMenuButton = React.forwardRef<HTMLButtonElement, MobileMenuButtonProps>(
    ({ onClick, bgClass, hamburgerClass, isOpen }, ref) => {
        return (
            <button
                ref={ref}
                onClick={onClick}
                className={`relative z-[60] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 md:hidden ${bgClass}`}
                aria-label="Toggle menu"
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

import React from "react"

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
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ clipPath: `circle(0px at ${buttonPosition.x}px ${buttonPosition.y}px)` }}
                    animate={{ clipPath: `circle(150% at ${buttonPosition.x}px ${buttonPosition.y}px)` }}
                    exit={{ clipPath: `circle(0px at ${buttonPosition.x}px ${buttonPosition.y}px)` }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed inset-0 z-[55] bg-neutral-900 md:hidden"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white transition-transform hover:scale-110"
                        aria-label="Close menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-neutral-900">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="flex h-dvh flex-col justify-between px-8 py-16">
                        <div>
                            <motion.a
                                href="#"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mb-8 block text-white"
                                onClick={onClose}
                            >
                                <span className="text-xl font-normal">Eduardo Montenegro</span>
                            </motion.a>

                            <ul className="flex flex-col gap-6 mb-8">
                                {navLinks.map((link, index) => (
                                    <motion.li
                                        key={link.name}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                    >
                                        <a
                                            href={link.href}
                                            onClick={onClose}
                                            className="text-4xl font-light text-white transition-colors hover:text-neutral-400"
                                        >
                                            {link.name}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-500">{t.nav.contact}</h4>
                                <a href="mailto:formacion@eduardomontenegro.com" className="mb-2 block text-sm text-white hover:text-neutral-400">
                                    formacion@eduardomontenegro.com
                                </a>
                                <a href="tel:+573142793431" className="block text-sm text-white hover:text-neutral-400">
                                    +57 314 279 3431
                                </a>
                            </motion.div>
                            <div className="flex flex-row justify-between">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
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
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="col-span-2"
                                >
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
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}