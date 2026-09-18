import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { getSiteContents } from "@/lib/db-content"
import { getLegalDocuments } from "@/lib/legal-documents"

export const metadata: Metadata = {
    title: "Política de privacidad | Eduardo Montenegro",
    description: "Cómo se recolectan, usan y protegen los datos personales enviados a través de este sitio.",
}

export default async function PrivacyPage() {
    const { legal, seo } = await getSiteContents(["legal", "seo"])

    return <LegalPage documents={getLegalDocuments("privacy", legal, seo.siteUrl)} updatedAt={legal.updatedAt} />
}
