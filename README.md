# Streaks — Daily Habit Tracker

A minimal, modern habit tracker built with React + Vite.

## Features

- Monthly calendar view with per-habit completion dots
- Daily sheet to check off habits with animations
- Current streak, best streak, and monthly stats
- Evening reminder banner
- Full settings: add/edit/delete habits, reminder time, theme, CSV export
- Dark mode auto-detect
- localStorage persistence — no backend needed

## Tech stack

- React 18 + Vite
- lucide-react for icons
- DM Serif Display + DM Sans fonts
- No other dependencies

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Deploy to Vercel

### Option A — GitHub + Vercel (recommended)

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "init: habit tracker"
git remote add origin git@github.com:YOUR_USERNAME/habit-tracker.git
git push -u origin main
```

2. **Connect to Vercel**

- Go to https://vercel.com/new
- Import your GitHub repo
- Framework: **Vite** (auto-detected)
- Build command: `npm run build`
- Output directory: `dist`
- Click **Deploy**

That's it. Every push to `main` auto-deploys.

### Option B — Vercel CLI (no GitHub needed)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel detects Vite automatically.

---

## Project structure

```
habit-tracker/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── CalendarGrid.jsx   # Monthly calendar with dot indicators
│   │   ├── DailySheet.jsx     # Slide-up habit checklist
│   │   ├── Onboarding.jsx     # 3-step setup flow
│   │   ├── ReminderBanner.jsx # Evening nudge banner
│   │   └── Settings.jsx       # Habit + reminder + data settings
│   ├── hooks/
│   │   └── useHabits.js       # All state, localStorage, streak logic
│   ├── App.jsx                # Root: routing between screens
│   ├── index.css              # Design tokens + animations
│   └── main.jsx               # ReactDOM entry
├── index.html
├── vite.config.js
├── vercel.json                # SPA rewrite rule
└── package.json
```

## Customisation notes

- Colors and design tokens are all in `src/index.css` as CSS variables
- Habit colors and icons are defined in `src/hooks/useHabits.js`
- The reminder banner fires when: evening hour reached + habits incomplete + not dismissed today
- All data lives in `localStorage` under keys `streaks_habits`, `streaks_log`, `streaks_settings`
