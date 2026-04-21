# PoolRides 🚗

**PoolRides** is a premium, campus-verified commute platform designed specifically for students in Bengaluru. It enables students from colleges like RVCE, PES, and others to split cab/auto fares, reduce travel costs, and build a reliable commute community.

![PoolRides Branding](/Pool-rides_logo.png)

## 🌟 Key Features

- **Campus-Verified Community**: Access restricted to verified student emails (`.edu.in`) to ensure safety and trust.
- **Smart Pool Matching**: Find rides based on origin areas, campus destinations, and commute timings.
- **Cost Splitting**: Automated estimation of per-person shares to ensure fair splits.
- **Real-Time Coordination**: In-app activity feed with status updates (e.g., "On my way", "Reached pickup").
- **Premium Dark Aesthetic**: A sleek, modern dark-mode interface built for a desktop-class experience.
- **Financial Tracking**: Track weekly and monthly savings achieved through pooling.
- **Google SSO**: Swift authentication via college-linked Google accounts.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript 6](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend Services**: [Firebase 12](https://firebase.google.com/) (Auth & Data)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pool-rides
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root and add your Firebase configuration (see `src/config/firebase.ts` for expected keys).

### Development
Start the development server:
```bash
npm run dev
```

### Build
Generate a production-ready bundle:
```bash
npm run build
```

## 📂 Project Structure

```text
pool-rides/
├── public/              # Static assets (logos, icons)
├── src/
│   ├── components/      # Reusable UI, Layout, and Feature components
│   ├── data/            # Seed data and constants (Colleges, Areas)
│   ├── services/        # Firebase and business logic services
│   ├── store/           # Zustand state management
│   ├── pages/           # Application views (Auth, Dashboard, Discover...)
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Helper functions and calculations
├── tests/               # Unit and integration tests
├── index.html           # Main entry point
└── tailwind.config.ts   # Design system tokens (Slate/Teal palette)
```

## 🛡️ Admin Access
The platform includes an admin portal to manage student verifications and pool reports.
- **Demo Admin**: `admin@poolrides.in` / `admin123`

---
© 2026 PoolRides · Built with ❤️ for the Bengaluru student community.
