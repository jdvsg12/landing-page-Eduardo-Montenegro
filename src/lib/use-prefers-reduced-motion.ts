"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"

/** False on the server and first paint so reduced-motion branching cannot hydrate-mismatch. */
export function usePrefersReducedMotion() {
    const reduce = useReducedMotion()
    const [ready, setReady] = useState(false)

    useEffect(() => {
        setReady(true)
    }, [])

    return ready && !!reduce
}
