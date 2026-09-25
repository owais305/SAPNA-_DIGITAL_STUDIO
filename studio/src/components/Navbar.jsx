import { useEffect, useState } from 'react'
import './Navbar.css'

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Booking', href: '#booking' },
]

export default function Navbar({ onOpenMyBookings }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLink = () => setOpen(false)

  const handleCheckBooking = () => {
    setOpen(false)
    onOpenMyBookings?.()
  }

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <a href="#home" className="nav__brand">
          <span className="nav__brand-main">SAPNA DIGITAL STUDIO</span>
          <span className="nav__brand-sub">PHOTOGRAPHY</span>
        </a>

        <nav className={`nav__links ${open ? 'nav__links--open' : ''}`}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={handleLink} className="nav__link">
              {l.label}
            </a>
          ))}
          <button type="button" onClick={handleCheckBooking} className="nav__link nav__link--btn nav__link--mobile-only">
            Check Booking
          </button>
          <a href="#booking" onClick={handleLink} className="nav__cta nav__cta--mobile">
            Book Appointment
          </a>
        </nav>

        <div className="nav__actions">
          <button type="button" onClick={handleCheckBooking} className="nav__check-btn">
            Check Booking
          </button>
          <a href="#booking" className="nav__cta">
            Book Appointment
          </a>
        </div>

        <button
          className={`nav__burger ${open ? 'nav__burger--open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
