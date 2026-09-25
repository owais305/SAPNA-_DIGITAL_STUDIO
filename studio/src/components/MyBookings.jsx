import { useEffect, useState } from 'react'
import api from '../api.js'
import './SuccessModal.css'
import './Booking.css'
import './MyBookings.css'

const emptyLookup = { email: '', phone: '' }
const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function MyBookings({ open, onClose }) {
  const [lookup, setLookup] = useState(emptyLookup)
  const [bookings, setBookings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (!open) {
      // reset state whenever the modal is closed, so it starts fresh next time
      setLookup(emptyLookup)
      setBookings(null)
      setError('')
      setLoading(false)
    }
  }, [open])

  if (!open) return null

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!lookup.email.trim() || !lookup.phone.trim()) {
      setError('Please enter both the email and phone number used for the booking.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await api.findBookings(lookup)
      setBookings(data)
    } catch (err) {
      setError(err.message)
      setBookings(null)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    try {
      const data = await api.findBookings(lookup)
      setBookings(data)
    } catch {
      // keep showing the last known list if refresh fails silently
    }
  }

  const startOver = () => {
    setBookings(null)
    setError('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal mybk"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mybk-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal__close" aria-label="Close" onClick={onClose}>
          ✕
        </button>

        <h3 id="mybk-title" className="modal__title mybk__title">Check My Booking</h3>

        {!bookings ? (
          <>
            <p className="modal__desc mybk__desc">
              Enter the email and phone number you used when booking to view, reschedule, or cancel it.
            </p>
            <form className="mybk__form" onSubmit={handleLookup}>
              <div className="field">
                <label className="field__label" htmlFor="mybk-email">Email</label>
                <input
                  id="mybk-email"
                  type="email"
                  placeholder="you@example.com"
                  value={lookup.email}
                  onChange={(e) => setLookup({ ...lookup, email: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="mybk-phone">Phone</label>
                <input
                  id="mybk-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={lookup.phone}
                  onChange={(e) => setLookup({ ...lookup, phone: e.target.value })}
                />
              </div>
              {error && <p className="field__error">{error}</p>}
              <button className="btn btn--gold mybk__submit" type="submit" disabled={loading}>
                {loading ? 'Searching…' : 'Find My Booking'}
              </button>
            </form>
          </>
        ) : (
          <BookingList
            bookings={bookings}
            lookup={lookup}
            onBack={startOver}
            onRefresh={refresh}
          />
        )}
      </div>
    </div>
  )
}

function BookingList({ bookings, lookup, onBack, onRefresh }) {
  return (
    <div className="mybk__list">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} lookup={lookup} onChanged={onRefresh} />
      ))}
      <button className="btn btn--ghost mybk__back" onClick={onBack}>
        Search Another Booking
      </button>
    </div>
  )
}

function BookingCard({ booking, lookup, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [date, setDate] = useState(booking.date)
  const [time, setTime] = useState(booking.time)
  const [busy, setBusy] = useState(false)
  const [cardError, setCardError] = useState('')

  const isFinal = booking.status === 'completed' || booking.status === 'cancelled'

  const saveReschedule = async () => {
    setCardError('')
    setBusy(true)
    try {
      await api.rescheduleBooking(booking.id, { ...lookup, date, time })
      setEditing(false)
      await onChanged()
    } catch (err) {
      setCardError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const cancelBooking = async () => {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return
    setCardError('')
    setBusy(true)
    try {
      await api.cancelBooking(booking.id, lookup)
      await onChanged()
    } catch (err) {
      setCardError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mybk-card">
      <div className="mybk-card__top">
        <div>
          <div className="mybk-card__service">{booking.service_name || 'Photography Session'}</div>
          <div className="mybk-card__when">{booking.date} at {booking.time}</div>
        </div>
        <span className={`mybk-status mybk-status--${booking.status}`}>{STATUS_LABEL[booking.status] || booking.status}</span>
      </div>

      {editing ? (
        <div className="mybk-card__edit">
          <div className="booking__row">
            <div className="field">
              <label className="field__label">New Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label">New Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          {cardError && <p className="field__error">{cardError}</p>}
          <div className="mybk-card__actions">
            <button className="btn btn--ghost" onClick={() => setEditing(false)} disabled={busy}>
              Cancel Edit
            </button>
            <button className="btn btn--gold" onClick={saveReschedule} disabled={busy}>
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {cardError && <p className="field__error">{cardError}</p>}
          {!isFinal && (
            <div className="mybk-card__actions">
              <button className="btn btn--ghost" onClick={() => setEditing(true)} disabled={busy}>
                Reschedule
              </button>
              <button className="mybk-cancel-btn" onClick={cancelBooking} disabled={busy}>
                {busy ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
