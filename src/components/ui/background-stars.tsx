"use client"
import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type Star = {
    x: number
    size: number
    duration: number
    delay: number
    opacity: number
}

export const BackgroundStars = ({ className }: { className?: string }) => {
    const stars = useMemo<Star[]>(() => {
        return Array.from({ length: 120 }).map(() => ({
            x: Math.random() * 100,
            size: Math.random() * 1.5 + 0.5,
            duration: Math.random() * 20 + 15,
            delay: Math.random() * -20,
            opacity: Math.random() * 0.6 + 0.2,
        }))
    }, [])

    return (
        <div
            className={cn(
                "absolute inset-0 overflow-hidden pointer-events-none",
                className
            )}
        >
            {stars.map((star, i) => (
                <motion.span
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${star.x}%`,
                        width: star.size,
                        height: star.size,
                        opacity: star.opacity,
                    }}
                    initial={{ y: "-10%", x: -20 }}
                    animate={{ y: "110%", x: 20 }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: star.delay,
                    }}
                />
            ))}
        </div>
    )
}
