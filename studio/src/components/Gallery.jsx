import { useCallback, useEffect, useRef, useState } from 'react'
import { IMAGES } from '../data/images.js'
import api from '../api.js'
import './Gallery.css'

const FALLBACK_PHOTOS = [
  { src: IMAGES.galleryPortrait, alt: 'Studio portrait of a woman', label: 'Portrait Session' },
  { src: IMAGES.galleryLake, alt: 'Mountain lake with a small boat', label: 'Landscape Escape' },
  { src: IMAGES.galleryPhotographer, alt: 'Photographer at work', label: 'Behind the Lens' },
  { src: IMAGES.galleryBride, alt: 'Bride in veil', label: 'Wedding Story' },
  { src: IMAGES.galleryCity, alt: 'City street at night', label: 'Night Streets' },
  { src: IMAGES.galleryMountain, alt: 'Mountain range at sunset', label: 'Golden Hour' },
]

export default function Gallery() {
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [photos, setPhotos] = useState(FALLBACK_PHOTOS)

  useEffect(() => {
    api
      .getGallery()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPhotos(
            data.map((p) => ({
              src: p.image_url,
              alt: p.alt || p.category || 'Studio photo',
              label: p.category || 'Gallery',
            }))
          )
        }
      })
      .catch(() => {
        // backend not reachable — keep the built-in fallback photos
      })
  }, [])

  const updateEdges = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    setAtStart(track.scrollLeft <= 4)
    setAtEnd(track.scrollLeft >= max - 4)

    const children = Array.from(track.children)
    const center = track.scrollLeft + track.clientWidth / 2
    let closest = 0
    let closestDist = Infinity
    children.forEach((child, i) => {
      const dist = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setActive(closest)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    updateEdges()
    let raf
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(updateEdges)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [updateEdges])

  const scrollByAmount = (dir) => {
    const track = trackRef.current
    if (!track) return
    const amount = Math.min(track.clientWidth * 0.7, 420)
    track.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  const scrollToIndex = (i) => {
    const track = trackRef.current
    const child = track?.children[i]
    if (!child) return
    track.scrollTo({
      left: child.offsetLeft - (track.clientWidth - child.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }

  return (
    <section id="gallery" className="gallery">
      <div className="container">
        <div className="gallery__head">
          <span className="eyebrow">Our Gallery</span>
          <h2 className="section-title">Moments We Captured</h2>
          <div className="section-rule" />
        </div>
      </div>

      <div className="gallery__viewport">
        <button
          className="gallery__arrow gallery__arrow--prev"
          aria-label="Scroll gallery left"
          onClick={() => scrollByAmount(-1)}
          disabled={atStart}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="gallery__strip">
          <div className="gallery__track" ref={trackRef}>
            {photos.map((p, i) => (
              <figure
                className={`gallery__frame ${i === active ? 'gallery__frame--active' : ''}`}
                key={p.src}
              >
                <img src={p.src} alt={p.alt} loading="lazy" />
                <figcaption className="gallery__caption">
                  <span className="gallery__caption-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="gallery__caption-label">{p.label}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <button
          className="gallery__arrow gallery__arrow--next"
          aria-label="Scroll gallery right"
          onClick={() => scrollByAmount(1)}
          disabled={atEnd}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="gallery__dots">
        {photos.map((p, i) => (
          <button
            key={p.src}
            className={`gallery__dot ${i === active ? 'gallery__dot--active' : ''}`}
            aria-label={`Go to photo ${i + 1}`}
            onClick={() => scrollToIndex(i)}
          />
        ))}
      </div>
    </section>
  )
}
