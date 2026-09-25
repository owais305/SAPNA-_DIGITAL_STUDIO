import { useEffect, useState } from 'react'
import { IMAGES } from '../data/images.js'
import api from '../api.js'
import './Services.css'

const ICONS = {
  'Portrait Photography': (
    <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 2a5 5 0 015 5v2a5 5 0 01-10 0V7a5 5 0 015-5zm0 13c4.42 0 8 2.24 8 5v2H4v-2c0-2.76 3.58-5 8-5z"/></svg>
  ),
  'Wedding Photography': (
    <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 21s-7-4.35-9.5-8.5C.7 9 2.4 5.5 6 5.5c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.6 0 5.3 3.5 3.5 7C19 16.65 12 21 12 21z"/></svg>
  ),
  'Product Photography': (
    <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M21 7l-9-4-9 4 9 4 9-4zm-9 6L3 9v8l9 4 9-4V9l-9 4z"/></svg>
  ),
  'Landscape Photography': (
    <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M4 18l5-7 3.5 4.5L15 11l5 7H4zM8 8a2 2 0 11-.001-4.001A2 2 0 018 8z"/></svg>
  ),
}
const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm8 4a4 4 0 100 8 4 4 0 000-8z"/></svg>
)
const DEFAULT_IMGS = {
  'Portrait Photography': IMAGES.servicePortrait,
  'Wedding Photography': IMAGES.serviceWedding,
  'Product Photography': IMAGES.serviceProduct,
  'Landscape Photography': IMAGES.serviceLandscape,
}

const FALLBACK_SERVICES = [
  { title: 'Portrait Photography', desc: 'Capturing your personality with perfect lighting.', img: IMAGES.servicePortrait },
  { title: 'Wedding Photography', desc: 'We capture your special moments beautifully.', img: IMAGES.serviceWedding },
  { title: 'Product Photography', desc: 'High quality shots for your products and brand.', img: IMAGES.serviceProduct },
  { title: 'Landscape Photography', desc: 'Breathtaking landscapes in perfect frame.', img: IMAGES.serviceLandscape },
]

export default function Services() {
  const [services, setServices] = useState(FALLBACK_SERVICES)

  useEffect(() => {
    api
      .getServices()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(
            data.map((s) => ({
              title: s.title,
              desc: s.description,
              img: s.thumbnail || DEFAULT_IMGS[s.title] || IMAGES.servicePortrait,
            }))
          )
        }
      })
      .catch(() => {
        // backend not reachable — keep the built-in fallback list
      })
  }, [])

  return (
    <section id="services" className="services">
      <div className="container">
        <div className="services__head">
          <span className="eyebrow">Our Services</span>
          <h2 className="section-title">What We Offer</h2>
          <div className="section-rule" />
        </div>

        <div className="services__grid">
          {services.map((s) => (
            <article className="s-card" key={s.title}>
              <div className="s-card__img-wrap">
                <img src={s.img} alt={s.title} loading="lazy" />
                <div className="s-card__icon">{ICONS[s.title] || DEFAULT_ICON}</div>
              </div>
              <h3 className="s-card__title">{s.title}</h3>
              <p className="s-card__desc">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
