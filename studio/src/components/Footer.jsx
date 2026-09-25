import './Footer.css'

const QUICK_LINKS = ['Home', 'Services', 'Gallery', 'Booking', 'About']
const SERVICE_LINKS = ['Portrait Photography', 'Wedding Photography', 'Product Photography', 'Landscape Photography']

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <span className="footer__brand-main">SAPNA DIGITAL STUDIO</span>
          <span className="footer__brand-sub">PHOTOGRAPHY</span>
          <p className="footer__tagline">
            We don't just take photos, we capture emotions and create memories.
          </p>
          <div className="footer__social">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>

        <div className="footer__col">
          <h4>Quick Links</h4>
          <ul>
            {QUICK_LINKS.map((l) => (
              <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>Services</h4>
          <ul>
            {SERVICE_LINKS.map((l) => (
              <li key={l}><a href="#services">{l}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>Contact Us</h4>
          <ul className="footer__contact">
            <li>123 Sapna Street,<br />New York, NY 10001</li>
            <li>+1 234 567 8900</li>
            <li>info@sapnadigitalstudio.com</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} Sapna Digital Studio. All Rights Reserved.</p>
      </div>
    </footer>
  )
}
