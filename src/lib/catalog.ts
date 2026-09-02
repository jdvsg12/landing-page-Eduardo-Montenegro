import { getPublishedServices } from "@/lib/db-services"
import { getAllTalleres } from "@/lib/db-talleres"
import type { Service } from "@/lib/services"
import type { Taller } from "@/lib/talleres"

export type HomeCatalog = {
    services: Service[]
    talleres: Taller[]
    loadError: boolean
}

export async function getHomeCatalog(): Promise<HomeCatalog> {
    try {
        const [services, talleres] = await Promise.all([
            getPublishedServices(),
            getAllTalleres(),
        ])
        return { services, talleres, loadError: false }
    } catch {
        return { services: [], talleres: [], loadError: true }
    }
}
