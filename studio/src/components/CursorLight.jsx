import { useEffect, useRef, useState } from 'react'
import './CursorLight.css'

export default function CursorLight() {
  const glowRef = useRef(null)
  const dotRef = useRef(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isCoarse || reduceMotion) {
      setEnabled(false)
      return
    }

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let tx = x
    let ty = y
    let raf

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      if (glowRef.current) glowRef.current.style.opacity = '1'
    }

    const onLeave = () => {
      if (glowRef.current) glowRef.current.style.opacity = '0'
    }

    const animate = () => {
      x += (tx - x) * 0.14
      y += (ty - y) * 0.14
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${x - 260}px, ${y - 260}px, 0)`
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${tx - 3}px, ${ty - 3}px, 0)`
      }
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (!enabled) return null

  return (
    <>
      <div ref={glowRef} className="cursor-glow" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  )
}
