# Sapna Digital Studio — Admin Panel

A responsive React (Vite) admin dashboard for managing bookings, services,
gallery, customers, payments and reviews. Styled to match a dark
dashboard theme, fully responsive with dedicated media queries for
desktop, tablet and mobile.

## Setup

```bash
cd admin
npm install
cp .env.example .env    # already copied — edit VITE_API_URL if your backend runs elsewhere
npm run dev              # runs on http://localhost:5174
```

Make sure the **backend server** (`/server`) is running first — the admin
panel talks to it at `VITE_API_URL` (defaults to `http://localhost:5050`).

## Login

Default admin login (created automatically the first time the backend
runs):

- **Username:** `admin`
- **Password:** `Sapna@123`

If login fails (e.g. an admin already exists in the database from
earlier testing), run `npm run reset-admin` from the `server` folder to
force it to match these credentials.

Change this immediately from **Settings** inside the admin panel.

## Pages

| Page       | What it does |
|------------|--------------|
| Dashboard  | Today/this-week bookings, pending requests, revenue snapshot, trend chart |
| Bookings   | Full list with search/filter, status changes, reschedule, delete |
| Calendar   | Month view of bookings, block out dates (holidays/leave) |
| Services   | Add/edit/delete services, price, description, thumbnail |
| Gallery    | Upload/delete/reorder (drag & drop) photos, assign a category |
| Customers  | Client list with booking history, contact info and notes |
| Payments   | Track deposits/payments per booking, mark paid/pending |
| Reviews    | Approve or reject testimonials submitted from the website |
| Settings   | Change the admin password |

## Responsive design

`src/styles/global.css` and every page's own `.css` file include explicit
`@media` breakpoints at **1200px, 992px, 768px and 480px**:
- Sidebar becomes a slide-in drawer (with hamburger toggle) below 992px
- Stat cards / grids collapse from 4 → 2 → 1 columns
- Tables switch to a stacked "label: value" card layout below 768px
- Modals, buttons and forms resize for small phones (≤480px)
