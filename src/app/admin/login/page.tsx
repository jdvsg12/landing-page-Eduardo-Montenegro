"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push("/admin")
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a] text-white">
      <div className="w-full max-w-sm px-6">
        <h1 className="mb-1 text-2xl font-light">Eduardo Montenegro</h1>
        <p className="mb-10 text-sm text-neutral-400">Panel de administración</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Contraseña"
              className="w-full border-0 border-b border-white/30 bg-transparent pb-2 text-white placeholder-neutral-500 focus:border-white focus:outline-none"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">Contraseña incorrecta</p>
          )}

          <button
            type="submit"
            className="w-full border border-white py-3 text-sm font-medium tracking-wider text-white transition-colors duration-200 hover:bg-white hover:text-black"
          >
            INGRESAR
          </button>
        </form>
      </div>
    </div>
  )
}
