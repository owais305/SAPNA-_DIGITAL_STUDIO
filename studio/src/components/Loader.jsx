import { useEffect, useState } from 'react'
import './Loader.css'

// Timings (ms) — kept in one place so JS + CSS transitions stay in sync
const FOCUS_DURATION = 1450
const HOLD_DURATION = 320
const FLASH_DURATION = 110
const IRIS_DURATION = 780

export default function Loader({ onFinish }) {
  const [phase, setPhase] = useState('focusing') // focusing -> held -> flash -> iris -> done
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let raf

    const tick = (now) => {
      const t = Math.min(1, (now - start) / FOCUS_DURATION)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.round(eased * 100))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setPhase('held')
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (phase !== 'held') return
    const t1 = setTimeout(() => setPhase('flash'), HOLD_DURATION)
    return () => clearTimeout(t1)
  }, [phase])

  useEffect(() => {
    if (phase !== 'flash') return
    const t2 = setTimeout(() => setPhase('iris'), FLASH_DURATION)
    return () => clearTimeout(t2)
  }, [phase])

  useEffect(() => {
    if (phase !== 'iris') return
    const t3 = setTimeout(() => {
      setPhase('done')
      onFinish?.()
    }, IRIS_DURATION)
    return () => clearTimeout(t3)
  }, [phase, onFinish])

  const sharp = phase !== 'focusing'

  return (
    <div className={`loader loader--${phase}`} aria-hidden={phase === 'done'}>
      <div className="loader__sweep" />

      <div className="loader__iris">
        <div
          className={`loader__stage ${sharp ? 'loader__stage--sharp' : ''}`}
          style={{ '--focus': progress / 100 }}
        >
          <div className="loader__ring-wrap">
            <svg className="loader__ring" viewBox="0 0 240 240">
              <circle className="loader__ring-track" cx="120" cy="120" r="108" />
              <circle
                className="loader__ring-arc"
                cx="120"
                cy="120"
                r="108"
                style={{ '--progress': progress / 100 }}
              />
            </svg>
            <div className="loader__ring-center">
              <span className="loader__mark">SD</span>
            </div>
          </div>

          <div className="loader__brand">
            <span className="loader__word">SAPNA</span>
            <span className="loader__word loader__word--accent">DIGITAL</span>
          </div>

          <div className="loader__meta">
            <span className="loader__caption">Bringing your story into focus</span>
            <span className="loader__percent">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="loader__flash" />
    </div>
  )
}
