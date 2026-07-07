"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export function useCountUp(
  ref: React.RefObject<HTMLDivElement | null>,
  value: number,
  duration: number = 2
) {
  const animated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || animated.current) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => {
          animated.current = true
          gsap.fromTo(
            el,
            { textContent: 0 },
            {
              textContent: value,
              duration,
              ease: "power2.out",
              snap: { textContent: 1 },
              onUpdate: () => {
                el.textContent = Math.round(Number(el.textContent)).toLocaleString()
              },
            }
          )
        },
        once: true,
      })
    })

    return () => ctx.revert()
  }, [ref, value, duration])
}
