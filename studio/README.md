# Sapna Digital Studio — React Frontend

React + Vite frontend for "Sapna Digital Studio". It is now connected to
the **backend API** (see `/server`) for services, gallery photos and the
booking form — if the backend isn't running, the site gracefully falls
back to its original built-in placeholder content so it still works
standalone.

## Run it

```bash
npm install
cp .env.example .env   # already copied — edit VITE_API_URL if your backend runs elsewhere
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).
For live data (services/gallery/bookings), start the backend first —
see `/server/README.md`.

Build for production:

```bash
npm run build
npm run preview
```

## Features implemented

1. **Loading screen** — a camera-aperture "shutter" animation plays on first
   load, with a progress bar, then curtains slide open to reveal the site.
   (`src/components/Loader.jsx`)
2. **Cursor spotlight** — a soft gold glow follows the mouse across the dark
   background (desktop/pointer devices only; automatically disabled on touch
   screens and when the OS "reduce motion" setting is on).
   (`src/components/CursorLight.jsx`)
3. **Confirm Booking button** — click it and it runs, in order: ripple from
   the click point → pulsing glow → spinner/loading state → animated success
   checkmark → a "Booking Confirmed!" modal. The booking is submitted to
   the backend (`POST /api/public/bookings`), and any server error (e.g. a
   clashing time slot or a blocked date) is shown inline on the form.
   (`src/components/ConfirmButton.jsx`, `src/components/SuccessModal.jsx`)
4. **Fully responsive** — breakpoints at 1024px / 900px / 860px / 640px /
   480px / 420px covering desktop, tablet, and mobile (including a slide-in
   mobile nav menu).
5. **Check Booking** — a "Check Booking" link in the navbar (and mobile
   menu) opens a modal where a customer enters the email + phone they
   booked with to find their booking(s), then can **reschedule** (pick a
   new date/time — this puts the booking back to "pending" so the studio
   can re-confirm it) or **cancel** it themselves, no account/login
   needed. (`src/components/MyBookings.jsx`)

## Structure

```
src/
  api.js        thin fetch() wrapper for the backend API
  components/   Navbar, Hero, Services, Gallery, Booking, Footer,
                Loader, CursorLight, ConfirmButton, SuccessModal,
                MyBookings (Check Booking modal)
  data/         images.js — placeholder Unsplash photo URLs, used as a
                fallback whenever the backend/admin hasn't set a photo
  styles/       index.css — design tokens (colors, type, spacing)
```

## Connected to the backend

- **Services** section loads live data from `GET /api/public/services`
  (managed from the admin panel → Services page).
- **Gallery** section loads live photos from `GET /api/public/gallery`
  (managed from the admin panel → Gallery page).
- **Booking** form submits to `POST /api/public/bookings`, which the
  admin then sees under Bookings / Dashboard / Calendar / Notifications.
- **Check Booking** modal uses:
  - `POST /api/public/bookings/find` — look up bookings by email + phone
  - `PATCH /api/public/bookings/:id/reschedule` — change date/time
    (verified against the same email + phone)
  - `PATCH /api/public/bookings/:id/cancel` — cancel a booking (same
    verification)

  A customer-initiated reschedule or cancel also creates an admin
  notification and (if SMTP is configured) sends the customer a
  confirmation email. Completed or already-cancelled bookings can't be
  edited or cancelled again.

If the backend is unreachable, Services/Gallery/Booking fall back to the
original built-in placeholder content, so the site never breaks. Check
Booking requires the backend to be running (there's nothing to fall back
to for looking up real bookings).

## Notes

- Photos are placeholder Unsplash URLs loaded at runtime by default —
  replace them from the admin panel's Services/Gallery pages, or edit
  the strings in `src/data/images.js`.
- Form validation is client-side (name/email/phone/date/time required)
  plus server-side checks (blocked dates, double-booked time slots).

