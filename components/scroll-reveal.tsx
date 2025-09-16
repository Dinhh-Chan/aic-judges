"use client"

import React, { useEffect, useRef } from "react"

type ScrollRevealProps = {
  children: React.ReactNode
  /** delay in ms */
  delay?: number
  /** additional className */
  className?: string
  /** once: reveal only first time */
  once?: boolean
}

export default function ScrollReveal({ children, delay = 0, className = "", once = true }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.style.setProperty("--sr-delay", `${delay}ms`)
    element.classList.add("sr-animate")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add("sr-visible")
            if (once) observer.unobserve(element)
          } else if (!once) {
            element.classList.remove("sr-visible")
          }
        })
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [delay, once])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}


