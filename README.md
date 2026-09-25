# Sapna Digital Studio — Complete Project

This package has **three parts** that work together:

```
studio-noir/   → your customer-facing website (React + Vite) — unchanged design,
                 now connected to the backend for services/gallery/bookings
server/        → the backend API (Node + Express + MongoDB/Mongoose) — the
                 "brain" that stores bookings, services, gallery, customers,
                 payments, reviews
admin/         → the admin dashboard (React + Vite) — fully responsive,
                 styled after the dark dashboard screenshot you shared
```

## Quick start (run all three)

**0. MongoDB** — `server/.env` is already filled in and pointed at the
Atlas cluster you set up. You just need to put your actual password into
the `MONGODB_URI` line (see `server/README.md`). Using local MongoDB
instead? Swap that one line for `mongodb://127.0.0.1:27017/sapna_digital_studio`.

Open **3 terminals**:

**1. Backend (start this first):**
```bash
cd server
npm install
npm start
```
Runs on **http://localhost:5050**. Connects to MongoDB and seeds a
default admin login + your 4 services + 6 gallery photos (only if those
collections are empty). Keep this terminal running.

**2. Admin panel:**
```bash
cd admin
npm install
npm run dev
```
Runs on **http://localhost:5174**. Log in with:
- Username: `admin`
- Password: `Sapna@123`

If login fails (e.g. an admin from earlier testing already exists in
your database), run this once from the `server` folder to force it to
match:
```bash
npm run reset-admin
```

⚠️ Change this password from **Settings** inside the admin panel once
you're in.

**3. Customer website:**
```bash
cd studio-noir
npm install
npm run dev
```
Runs on **http://localhost:5173**. The Services, Gallery and Booking
sections now pull live data from the backend — anything you add/edit in
the admin panel (a new service, a new gallery photo, blocking a date)
shows up here automatically.

## How everything connects

```
Customer website  ──POST /api/public/bookings──▶   Backend API   ◀──admin login + CRUD──   Admin Panel
(studio-noir)      ──GET  /api/public/services─▶   (server)      ◀── manages bookings,
                    ──GET  /api/public/gallery──▶   MongoDB            services, gallery,
                                                                        customers, payments,
                                                                        reviews, calendar
```

- A visitor books a session on the website → it's saved to the database,
  a notification is created, and (if you configure SMTP) confirmation
  emails go out.
- You manage everything from the **admin panel**: confirm/cancel/reschedule
  bookings, add services with photos, upload & reorder gallery photos,
  block off dates you're unavailable, track deposits/payments, and
  approve reviews before they'd show on the site.

## Admin panel features (matches your requirements)

**Must-have**
- ✅ Dashboard — today/this week's bookings, pending requests, revenue snapshot
- ✅ Bookings Management — list with filter/search, status changes
  (pending → confirmed → completed → cancelled), reschedule
- ✅ Calendar/Availability — month calendar of bookings, manually block
  dates (holidays, personal leave)
- ✅ Services Management — add/edit/delete, price, description, thumbnail
- ✅ Gallery Management — upload/delete/reorder (drag & drop), assign
  category per photo

**Important**
- ✅ Customer/Client List — booking history, contact details, notes
- ✅ Notifications — in-app alert on new bookings; email confirmation to
  admin + client (works out of the box by logging to console; add real
  SMTP credentials in `server/.env` to send actual emails)
- ✅ Payments/Deposits tracking — record deposits/payments per booking,
  mark paid/pending
- ✅ Reviews/Testimonials — approve/reject client reviews before they
  appear on the website

## Responsive design

The admin panel (`/admin`) is fully responsive with dedicated
`@media` breakpoints at **1200px / 992px / 768px / 480px**:
- Sidebar collapses into a slide-in drawer with a hamburger button on
  tablet/mobile
- Stat cards and grids reflow from 4 → 2 → 1 columns
- Tables switch to a stacked card layout on small screens
- Forms, modals and buttons resize for phones

## Notes

- The backend uses **MongoDB** via Mongoose — run it locally or use a
  free MongoDB Atlas cluster (see `server/README.md`).
- Uploaded images (service thumbnails, gallery photos) are stored in
  `server/uploads/` and served at `http://localhost:5050/uploads/...`.
- Trouble logging in or connecting? `server/README.md` has a full
  Troubleshooting section (`npm run check-env`, `npm run reset-admin`,
  antivirus/firewall notes).
- Each folder has its own more detailed `README.md`.
