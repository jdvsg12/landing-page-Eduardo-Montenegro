import Link from "next/link"

/** Aviso para el administrador cuando abre un servicio o taller privado: el público no lo ve. */
export function PrivatePreviewBanner({ editHref }: { editHref: string }) {
    return (
        <div
            role="status"
            className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 bg-ink px-5 py-3 text-sm text-white shadow-lg"
        >
            <span>
                <strong className="font-medium">Privado.</strong> Solo tú lo ves porque iniciaste sesión.
            </span>
            <Link href={editHref} className="underline underline-offset-4 hover:text-white/80">
                Editar
            </Link>
        </div>
    )
}
