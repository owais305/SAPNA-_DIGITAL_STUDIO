import { useRef, useState } from 'react'
import './ConfirmButton.css'

/**
 * Button with 4 requested interactions:
 * 1. Ripple  - expanding circle from the click point
 * 2. Glow    - pulsing gold glow while pressed / loading
 * 3. Loading - spinner replaces label while the "request" runs
 * 4. Success - checkmark morph once the action resolves
 *
 * Usage: <ConfirmButton label="Confirm Booking" onConfirm={async () => {...}} onSuccess={() => {}} />
 */
export default function ConfirmButton({
  label = 'Confirm',
  loadingLabel = 'Booking…',
  successLabel = 'Booked!',
  onConfirm,
  onSuccess,
  disabled = false,
}) {
  const [status, setStatus] = useState('idle') // idle | loading | success
  const btnRef = useRef(null)
  const rippleId = useRef(0)
  const [ripples, setRipples] = useState([])

  const spawnRipple = (e) => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = rippleId.current++
    setRipples((r) => [...r, { id, x, y, size }])
    setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== id))
    }, 650)
  }

  const handleClick = async (e) => {
    if (disabled || status !== 'idle') return
    spawnRipple(e)
    setStatus('loading')

    try {
      if (onConfirm) {
        await onConfirm()
      } else {
        await new Promise((res) => setTimeout(res, 1400))
      }
      setStatus('success')
      onSuccess?.()
      setTimeout(() => setStatus('idle'), 2200)
    } catch (err) {
      setStatus('idle')
    }
  }

  return (
    <button
      ref={btnRef}
      type="button"
      className={`confirm-btn confirm-btn--${status}`}
      onClick={handleClick}
      disabled={disabled || status !== 'idle'}
    >
      <span className="confirm-btn__glow" />
      {ripples.map((r) => (
        <span
          key={r.id}
          className="confirm-btn__ripple"
          style={{ width: r.size, height: r.size, left: r.x, top: r.y }}
        />
      ))}

      <span className="confirm-btn__content">
        {status === 'idle' && <span className="confirm-btn__label">{label}</span>}

        {status === 'loading' && (
          <span className="confirm-btn__label confirm-btn__label--loading">
            <span className="confirm-btn__spinner" aria-hidden="true" />
            {loadingLabel}
          </span>
        )}

        {status === 'success' && (
          <span className="confirm-btn__label confirm-btn__label--success">
            <svg className="confirm-btn__tick" viewBox="0 0 52 52" aria-hidden="true">
              <circle className="confirm-btn__tick-circle" cx="26" cy="26" r="24" />
              <path className="confirm-btn__tick-check" d="M14 27l7 7 17-17" />
            </svg>
            {successLabel}
          </span>
        )}
      </span>
    </button>
  )
}
