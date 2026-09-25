import { IMAGES } from '../data/images.js'
import './Hero.css'

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero__grid container">
        <div className="hero__copy">
          <span className="eyebrow">Capturing Moments</span>
          <h1 className="hero__title">
            We Frame
            <br />
            Your Story
          </h1>
          <p className="hero__desc">
            Sapna Digital Studio is a creative photography studio crafting timeless
            images that speak beyond words.
          </p>
          <div className="hero__actions">
            <a href="#booking" className="btn btn--gold">
              Book a Session
            </a>
            <a href="#gallery" className="btn btn--ghost">
              View Gallery
            </a>
          </div>

          <div className="hero__social">
            <a href="#" aria-label="Facebook" className="hero__social-link">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.7c-.28-.04-1.25-.12-2.37-.12-2.35 0-3.96 1.43-3.96 4.06v2.26H7.6V13h2.77v8h3.13z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="hero__social-link">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 8.4a3.6 3.6 0 100 7.2 3.6 3.6 0 000-7.2zM12 2c-2.72 0-3.06.01-4.13.06-1.06.05-1.79.22-2.43.47a4.9 4.9 0 00-1.77 1.15A4.9 4.9 0 002.53 5.4c-.25.64-.42 1.37-.47 2.43C2 8.9 2 9.24 2 12s.01 3.1.06 4.17c.05 1.06.22 1.79.47 2.43.26.66.6 1.22 1.15 1.77.55.55 1.11.9 1.77 1.15.64.25 1.37.42 2.43.47C8.94 22 9.28 22 12 22s3.06-.01 4.13-.06c1.06-.05 1.79-.22 2.43-.47a4.9 4.9 0 001.77-1.15 4.9 4.9 0 001.15-1.77c.25-.64.42-1.37.47-2.43.05-1.07.06-1.41.06-4.17s-.01-3.1-.06-4.17c-.05-1.06-.22-1.79-.47-2.43a4.9 4.9 0 00-1.15-1.77A4.9 4.9 0 0018.56 2.5c-.64-.25-1.37-.42-2.43-.47C15.06 2 14.72 2 12 2z"/></svg>
            </a>
            <a href="#" aria-label="Camera" className="hero__social-link">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 3l-1.5 2H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-3.5L15 3H9zm3 5a5 5 0 110 10 5 5 0 010-10z"/></svg>
            </a>
          </div>
        </div>

        <div className="hero__art">
          <div className="hero__aperture-wrap">
            <img src={IMAGES.lens} alt="Camera lens aperture blades" className="hero__lens-img" />
            <svg className="hero__aperture-ring" viewBox="0 0 400 400">
              <circle cx="200" cy="200" r="188" />
              <circle cx="200" cy="200" r="150" className="hero__aperture-ring--dashed" />
            </svg>
          </div>
        </div>
      </div>

      <button
        className="hero__scroll"
        aria-label="Scroll down"
        onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="hero__scroll-pill">
          <span className="hero__scroll-dot" />
        </span>
      </button>
    </section>
  )
}
