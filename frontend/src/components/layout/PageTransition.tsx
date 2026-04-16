"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useSearchParams } from "next/navigation"

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const key = pathname + searchParams.toString()

    return (
        <AnimatePresence mode="popLayout">
            <motion.div
                key={key}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
