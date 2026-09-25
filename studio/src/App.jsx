import { useState } from 'react'
import Loader from './components/Loader.jsx'
import CursorLight from './components/CursorLight.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Services from './components/Services.jsx'
import Gallery from './components/Gallery.jsx'
import Booking from './components/Booking.jsx'
import Footer from './components/Footer.jsx'
import MyBookings from './components/MyBookings.jsx'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [myBookingsOpen, setMyBookingsOpen] = useState(false)

  return (
    <>
      {loading && <Loader onFinish={() => setLoading(false)} />}
      <div className={`site ${loading ? 'site--hidden' : 'site--visible'}`}>
        <CursorLight />
        <Navbar onOpenMyBookings={() => setMyBookingsOpen(true)} />
        <main>
          <Hero />
          <Services />
          <Gallery />
          <Booking />
        </main>
        <Footer />
        <MyBookings open={myBookingsOpen} onClose={() => setMyBookingsOpen(false)} />
      </div>
    </>
  )
}
