import { useEffect, useState } from 'react'
import ConfirmButton from './ConfirmButton.jsx'
import SuccessModal from './SuccessModal.jsx'
import { IMAGES } from '../data/images.js'
import api from '../api.js'
import './Booking.css'

const FALLBACK_SERVICES = ['Portrait Photography', 'Wedding Photography', 'Product Photography', 'Landscape Photography']

const initialForm = {
  name: '',
  email: '',
  phone: '',
  service: FALLBACK_SERVICES[0],
  date: '',
  time: '',
}

export default function Booking() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [services, setServices] = useState(FALLBACK_SERVICES)

  useEffect(() => {
    api
      .getServices()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const titles = data.map((s) => s.title)
          setServices(titles)
          setForm((f) => ({ ...f, service: titles[0] }))
        }
      })
      .catch(() => {
        // backend not reachable — keep the built-in fallback list
      })
  }, [])

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Please enter your name'
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.phone.trim()) next.phone = 'Please enter your phone number'
    if (!form.date) next.date = 'Pick a date'
    if (!form.time) next.time = 'Pick a time'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleConfirm = () =>
    new Promise((resolve, reject) => {
      if (!validate()) {
        reject(new Error('validation'))
        return
      }
      api
        .createBooking(form)
        .then(() => resolve())
        .catch((err) => {
          setErrors((er) => ({ ...er, submit: err.message }))
          reject(err)
        })
    })

  const handleSuccess = () => {
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setForm(initialForm)
  }

  return (
    <section id="booking" className="booking">
      <div className="container booking__grid">
        <div className="booking__form-col">
          <span className="eyebrow">Book an Appointment</span>
          <h2 className="section-title">Schedule Your Session</h2>
          <div className="section-rule" />

          <form
            className="booking__form"
            onSubmit={(e) => e.preventDefault()}
            noValidate
          >
            <div className="booking__row">
              <Field label="Full Name" error={errors.name}>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={update('name')}
                />
              </Field>
              <Field label="Email Address" error={errors.email}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={update('email')}
                />
              </Field>
            </div>

            <Field label="Phone Number" error={errors.phone}>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={update('phone')}
              />
            </Field>

            <div className="booking__row booking__row--three">
              <Field label="Select Service">
                <select value={form.service} onChange={update('service')}>
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Select Date" error={errors.date}>
                <input type="date" value={form.date} onChange={update('date')} />
              </Field>
              <Field label="Select Time" error={errors.time}>
                <input type="time" value={form.time} onChange={update('time')} />
              </Field>
            </div>

            {errors.submit && <p className="field__error booking__submit-error">{errors.submit}</p>}

            <ConfirmButton
              label="Confirm Booking"
              loadingLabel="Confirming…"
              successLabel="Confirmed!"
              onConfirm={handleConfirm}
              onSuccess={handleSuccess}
            />
          </form>
        </div>

        <div className="booking__art">
          <img src={IMAGES.heroPhotographer} alt="Photographer holding a camera" />
          <div className="booking__art-overlay" />
        </div>
      </div>

      <SuccessModal open={modalOpen} onClose={closeModal} />
    </section>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__error">{error}</span>}
    </label>
  )
}
