import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { getSiteContents } from "@/lib/db-content"
import { getLegalDocuments } from "@/lib/legal-documents"

export const metadata: Metadata = {
    title: "Términos y condiciones | Eduardo Montenegro",
    description: "Condiciones de uso del sitio web de Eduardo Montenegro Flórez, psicólogo y psicoanalista.",
}

export default async function TermsPage() {
    const { legal, seo } = await getSiteContents(["legal", "seo"])

    return <LegalPage documents={getLegalDocuments("terms", legal, seo.siteUrl)} updatedAt={legal.updatedAt} />
}
