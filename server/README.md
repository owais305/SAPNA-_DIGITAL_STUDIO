# Sapna Digital Studio — Backend API (MongoDB)

Node.js + Express + **MongoDB (Mongoose)** backend that powers both the
customer website and the admin panel.

## Setup

```bash
cd server
npm install
```

A **real `.env` file is already included** (not just `.env.example`) with
working defaults — you only need to edit **one line**: put your MongoDB
password into `MONGODB_URI`.

Open `.env` and replace `YOUR_PASSWORD_HERE` with your actual MongoDB
Atlas password:
```
MONGODB_URI=mongodb+srv://Mohammadowais:YOUR_PASSWORD_HERE@cluster0.wdct6fn.mongodb.net/STUDIO_DATA
```

(Using local MongoDB instead? Replace the whole line with:
`MONGODB_URI=mongodb://127.0.0.1:27017/sapna_digital_studio`)

## Run it

```bash
npm start
```

The API runs on **http://localhost:5050** (not 5000 — changed to avoid
port conflicts some setups have with 5000).

You should see:
```
Using MongoDB URI from .env -> mongodb+srv://Mohammadowais:****@cluster0.wdct6fn.mongodb.net/STUDIO_DATA
MongoDB connected -> mongodb+srv://Mohammadowais:****@cluster0.wdct6fn.mongodb.net/STUDIO_DATA
Sapna Digital Studio API running on http://localhost:5050
```

Leave this terminal running — the API needs to stay up while you use the
admin panel or the customer site.

## Login

```
Username: admin
Password: Sapna@123
```

If login doesn't work (e.g. a different admin already exists in your
database from earlier testing), force it to match the credentials above:

```bash
npm run reset-admin
```

This creates the admin if missing, or resets its password if it already
exists — safe to run any time. Change the password from **Settings**
inside the admin panel after logging in.

## Useful commands

| Command | What it does |
|---|---|
| `npm start` | Start the API server |
| `npm run dev` | Start with auto-restart on file changes |
| `npm run check-env` | Diagnose `.env` loading problems |
| `npm run reset-admin` | Force-create/reset the admin login |

## Folder structure

```
server/
  server.js        entry point — connects to MongoDB, seeds, starts Express
  db.js            MongoDB connection (mongoose.connect)
  seed.js          seeds default admin / services / gallery on first run
  reset-admin.js   force-sync the admin account to .env credentials
  check-env.js     diagnostic tool for .env loading issues
  models/          Mongoose schemas: Admin, Service, Gallery, Customer,
                    Booking, BlockedDate, Payment, Review, Notification
  middleware/auth.js
  routes/
    auth.js         admin login / change password
    dashboard.js     dashboard summary numbers
    bookings.js      admin booking management (status, reschedule, search)
    services.js      services CRUD
    gallery.js       gallery CRUD + reorder
    calendar.js      calendar view + blocked dates
    customers.js     client list + notes
    payments.js      deposit/payment tracking
    reviews.js       testimonial moderation
    notifications.js in-app notifications
    upload.js        image upload (thumbnails/gallery photos)
    public.js        endpoints used by the customer website (no login needed)
  uploads/          uploaded images are stored here and served at /uploads/...
```

## Email notifications

Email sending is optional. If `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` are not
set in `.env`, the server simply logs what it *would* have sent to the
console — nothing breaks. Add real SMTP credentials (e.g. Gmail app
password, SendGrid, Mailtrap) whenever you're ready to send real emails.

## Main API groups

- `POST /api/auth/login` — admin login, returns a JWT
- `/api/public/*` — used by the **customer site** (services, gallery,
  availability, submit booking, submit/read reviews, plus customer
  self-service: `POST /bookings/find`, `PATCH /bookings/:id/reschedule`,
  `PATCH /bookings/:id/cancel` — all verified by matching email + phone,
  no login required)
- Everything else under `/api/*` requires `Authorization: Bearer <token>`
  and is used by the **admin panel**.

## Notes on the MongoDB conversion

- Every document exposes a plain string `id` field in API responses
  (instead of Mongo's `_id`/`__v`) so the existing admin panel and
  customer site code keep working exactly as before.
- Dates for bookings/blocked-dates/availability are stored as plain
  `YYYY-MM-DD` strings (not native Mongo dates) so date-range filtering
  stays simple and matches how the frontend already sends/reads dates.
- `created_at` / `updated_at` are real Mongo timestamps, added
  automatically by Mongoose.

## Troubleshooting

**"connects to 127.0.0.1 instead of my Atlas URI" / `.env` seems ignored**

Run the built-in checker:
```bash
npm run check-env
```
It tells you exactly what's wrong (missing `.env`, empty `MONGODB_URI`,
encoding issues, etc).

**Login fails even with the right username/password**

Run:
```bash
npm run reset-admin
```
This force-syncs the database's admin account to match `.env`.

**Browser shows `ERR_CONNECTION_RESET` when opening `http://localhost:5050/api/health`
(or the login request resets in DevTools → Network)**

This means something on your PC is resetting local connections to
Node before they finish — it's not a code problem. Try, in order:
1. Temporarily disable your antivirus's "Web Shield" / "Network
   Protection" (Avast, Kaspersky, McAfee, Norton, AVG, ESET, etc. all
   have this) and try again.
2. Disable any active VPN and try again.
3. Check Windows proxy settings (Windows Search → "Proxy settings") —
   turn off "Use a proxy server" if it's on.
4. Make sure Windows Firewall allowed Node.js when it first asked
   ("Windows Defender Firewall has blocked some features of this
   app…" → make sure it's **allowed**, not blocked, for both Private
   and Public networks — check under Windows Defender Firewall →
   "Allow an app through firewall").
5. As a last resort, change `PORT` in `.env` to something else (e.g.
   `8080`) and update `VITE_API_URL` in both `admin/.env` and
   `studio-noir/.env` to match, then restart everything.
