# ServiHub

**Reliable. Trusted. Delivered.**

A cleaning/home services booking web app with three user roles: Customer, Worker, and Admin.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Routing | React Router v6 |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Hosting | Netlify |
| CI/CD | GitHub → Netlify auto-deploy |

---

## Quick Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/servihub.git
cd servihub
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and paste + run the entire contents of `supabase_schema.sql`
3. Go to **Project Settings > API** and copy:
   - Project URL
   - `anon` public key

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create your admin account

1. In Supabase → **Authentication → Users**, click **Invite User** with your email
2. Accept the invite email and set your password
3. In Supabase **SQL Editor**, run:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'your-admin@email.com';
   ```
4. Your admin login is at `/admin` (secret — never linked publicly)

### 5. Run locally

```bash
npm run dev
```

---

## Deploying to Netlify via GitHub

1. Push your code to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Select your GitHub repo
4. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Go to **Site settings → Environment variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy! Every push to `main` auto-deploys.

---

## Route Map

| Route | Who can access | Description |
|---|---|---|
| `/` | Public | Landing page — Customer / Worker choice |
| `/login` | Public | Customer login |
| `/signup` | Public | Customer registration |
| `/home` | Customer only | Dashboard with services & bookings |
| `/book` | Customer only | Book a service |
| `/booking-confirmed` | Customer only | Post-booking confirmation |
| `/worker/:id` | Customer only | Worker profile page |
| `/worker/login` | Public | Worker login (no signup link) |
| `/worker/dashboard` | Worker only | Jobs dashboard |
| `/worker/earnings` | Worker only | Earnings summary |
| `/worker/history` | Worker only | Job history |
| `/admin` | Secret | Admin login (not linked anywhere) |
| `/admin/dashboard` | Admin only | Stats + add worker + activity |
| `/admin/workers` | Admin only | Manage & assign workers |
| `/admin/requests` | Admin only | All bookings, update status |

---

## User Account Rules

| Role | Signup | Login |
|---|---|---|
| **Customer** | Self-service at `/signup` | `/login` |
| **Worker** | Admin creates account via dashboard | `/worker/login` |
| **Admin** | You set role manually in Supabase | `/admin` (secret) |

---

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx       # Session + role management
├── lib/
│   └── supabase.js           # Supabase client
├── components/
│   └── layout/
│       ├── MobileShell.jsx   # Centered mobile container
│       ├── CustomerNav.jsx   # Bottom nav (customer)
│       └── WorkerNav.jsx     # Bottom nav (worker)
├── pages/
│   ├── Landing.jsx           # Yellow landing screen
│   ├── customer/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── BookService.jsx
│   │   ├── BookingConfirmed.jsx
│   │   └── WorkerProfile.jsx
│   ├── worker/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Earnings.jsx
│   │   └── History.jsx
│   └── admin/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Workers.jsx
│       └── Requests.jsx
├── App.jsx                   # All routes + role guards
├── main.jsx
└── index.css                 # Tailwind + utility classes
```
