import { Navbar } from "@/components/navbar"
import { HeroBanner } from "@/components/hero-banner"
import { AboutSection } from "@/components/about-section"
import { MessageSection } from "@/components/message-section"
import { ServicesSection } from "@/components/services-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { FaqSection } from "@/components/faq-section"
import { getHomeCatalog } from "@/lib/catalog"

export default async function HomePage() {
    const catalog = await getHomeCatalog()

    return (
        <main id="main" className="bg-paper">
            <Navbar />
            <HeroBanner />
            {/* Una sola lámina opaca sobre el hero sticky: sin huecos al sage. */}
            <div className="relative z-10 isolate bg-paper">
                <AboutSection />
                <MessageSection />
                <ServicesSection
                    services={catalog.services}
                    talleres={catalog.talleres}
                    loadError={catalog.loadError}
                />
                <FaqSection />
                <ContactSection />
                <Footer />
            </div>
        </main>
    )
}
