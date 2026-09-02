import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NotFound() {
    return (
        <main id="main" className="flex min-h-screen flex-col bg-paper">
            <Navbar variant="page" />
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
                <p className="font-serif text-7xl text-sage-ink">404</p>
                <h1 className="mt-8 font-serif text-3xl font-light italic text-sage-ink">
                    Página no encontrada
                </h1>
                <Link
                    href="/"
                    className="mt-10 min-h-11 text-sage-ink underline-offset-8 hover:underline"
                >
                    Volver al inicio
                </Link>
            </div>
            <Footer />
        </main>
    )
}
