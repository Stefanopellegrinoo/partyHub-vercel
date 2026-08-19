# PartyHub — Web Client

The official frontend client for **PartyHub**, a distributed event ticketing and real-time coordination platform. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Socket.io.

This application interacts directly with the [PartyHub Microservices Backend](https://github.com/Stefanopellegrinoo/partyHub_microservicios) via the unified API Gateway.

---

## Features

- **Organizer Dashboard**: Create and configure events, define ticket batches (*tandas*), set quotas, and manage assigned sellers.
- **Seller Terminal**: Fast ticket reservation flow with real-time stock counters and temporary inventory locks.
- **Real-Time Synchronization**: Live stock, batch transitions, and attendee check-ins powered by WebSockets (`socket.io-client`).
- **QR Check-in Scanner**: Camera-integrated QR code reader using `@zxing/browser` for instant ticket validation at venue entrances.
- **Authentication & Roles**: Dual JWT token handling (Access + Refresh token rotation) and role-based route protection (Organizer vs. Seller vs. Customer).

---

## Tech Stack

- **Framework**: Next.js (App Router), React 19
- **Language**: TypeScript
- **Styling & UI**: Tailwind CSS, Radix UI primitives, Lucide Icons
- **State & Data Fetching**: SWR, Axios, React Hook Form, Zod
- **Real-Time Communication**: Socket.io Client
- **Scanning & Charts**: ZXing Browser, Recharts

---

## Project Structure

```
partyHub-vercel/
├── app/                  # Next.js App Router pages and layouts
│   ├── dashboard/        # Organizer & Seller control panels
│   ├── login/            # Authentication views
│   └── register/
├── components/           # UI and feature components
│   ├── auth/             # Login, register, and password forms
│   ├── check-in/         # QR scanner and entry verification
│   ├── parties/          # Event management and batch tabs
│   ├── seller/           # Seller reservation terminals
│   └── ui/               # Radix / shadcn reusable UI primitives
├── context/              # Global React Contexts (Auth, Socket)
├── hooks/                # Custom React hooks (useAuth, useSocket, useDebounce)
├── lib/                  # Utilities, API Axios instance, validation schemas
├── services/             # HTTP client services per domain
└── types/                # TypeScript interfaces and domain models
```

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- Running instance of the [PartyHub Backend](https://github.com/Stefanopellegrinoo/partyHub_microservicios)

### 1. Installation
```bash
cd partyHub-vercel
npm install
```

### 2. Environment Configuration
Create a `.env.local` file based on the example:
```bash
cp .env.example .env.local
```

Set the API Gateway URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3055
```

### 3. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3013`.

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js in development mode on port 3013 |
| `npm run build` | Builds the production bundle |
| `npm run start` | Runs the production build |
| `npm run lint` | Runs ESLint checks |

---

## Related Repositories

- **Backend (Microservices & Gateway)**: [Stefanopellegrinoo/partyHub_microservicios](https://github.com/Stefanopellegrinoo/partyHub_microservicios)

## License
MIT
