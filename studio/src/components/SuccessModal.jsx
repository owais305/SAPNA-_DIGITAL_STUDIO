import { useEffect } from 'react'
import './SuccessModal.css'

export default function SuccessModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal__close" aria-label="Close" onClick={onClose}>
          ✕
        </button>

        <div className="modal__check">
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <circle className="modal__check-circle" cx="26" cy="26" r="24" />
            <path className="modal__check-mark" d="M14 27l7 7 17-17" />
          </svg>
        </div>

        <h3 id="modal-title" className="modal__title">Booking Confirmed!</h3>
        <p className="modal__desc">
          Thank you for booking with Sapna Digital Studio. We have received your
          appointment details and will contact you soon.
        </p>

        <button className="btn btn--gold modal__cta" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
