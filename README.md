# Unplanned

Group travel, finally organised.

Create a trip, find companions, plan the itinerary, split expenses, and coordinate everything — without a single WhatsApp group spiralling out of control.

---

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS
- **Database** — PostgreSQL via Prisma ORM
- **Auth** — NextAuth v5 (Google OAuth)
- **UI** — Lucide icons, react-hook-form, TanStack Query

---

## Features

- **Trip creation & discovery** — post trips with destination, dates, budget, and rules; browse and filter all open trips
- **Join requests & invite links** — request to join (host approves/rejects) or join instantly via a shareable invite link
- **Itinerary builder** — day-by-day planning; members suggest stops, host approves
- **Expense tracker** — log shared expenses, auto-calculate who owes whom
- **Group polls** — create votes on dates, activities, or anything
- **Pre-trip task list** — assign tasks to members with due dates
- **Packing lists** — host curates essentials; each member has their own checklist
- **Emergency info** — members share contacts and blood group privately with the host
- **Real-time chat** — dedicated group chat per trip
- **Weather forecast** — 7-day forecast for the destination via Open-Meteo
- **Trip status** — Planning → Confirmed → Ongoing → Completed lifecycle
- **Traveler profiles** — travel style, languages, bio, Instagram, trip history
- **Notifications** — in-app alerts for join requests and approvals

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Copy the example env file and fill in your values
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Your app URL (e.g. `http://localhost:3000`) |
| `AUTH_SECRET` | Random secret, min 32 chars |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # API route handlers
│   ├── trips/            # Trip pages (list, detail, create, edit)
│   ├── profile/          # User profile pages
│   ├── dashboard/        # User dashboard
│   └── ...
├── components/           # Shared UI components
│   ├── layout/           # Navbar, Footer
│   └── shared/           # Avatar, Badge, TripCard, TripNav
├── features/             # Feature-specific components
│   ├── trips/            # Expense tracker, polls, tasks, packing, weather
│   ├── itinerary/        # Itinerary timeline and map
│   ├── chat/             # Real-time chat
│   └── profile/          # Edit profile form
├── lib/                  # Utilities and helpers
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── ...
├── types/                # Shared TypeScript types and enums
└── stores/               # Zustand state stores
prisma/
├── schema.prisma         # Database schema
└── migrations/           # Migration history
```

---

## Database

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply a new migration (development)
npm run db:migrate:dev

# Apply migrations (production)
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

---

## Deployment

Deploy to [Vercel](https://vercel.com) with one click. Set the environment variables in the Vercel dashboard and point `DATABASE_URL` to a managed Postgres provider such as [Neon](https://neon.tech).

Don't forget to update your Google OAuth callback URL to your production domain:
```
https://your-domain.com/api/auth/callback/google
```
