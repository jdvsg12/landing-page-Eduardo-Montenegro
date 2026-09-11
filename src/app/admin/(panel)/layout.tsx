import type { Metadata } from "next"
import type { ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export const metadata: Metadata = {
  title: "Administración | Eduardo Montenegro",
  robots: { index: false, follow: false },
}

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-neutral-900 lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pt-12">{children}</main>
      </div>
    </div>
  )
}
