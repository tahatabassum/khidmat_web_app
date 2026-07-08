# Antigravity Master Build Prompt — Khidmat Hackathon MVP

Paste this as your first prompt in Antigravity. It's written as one complete brief so the agent understands full scope before generating code — but expect to follow up with the phase prompts below as it builds, rather than expecting one shot to produce everything perfectly.

---

## MASTER PROMPT (paste this first)

```
Build a full-stack web application called "Khidmat" — an on-demand home
services and labor booking marketplace for Pakistan. It must be a fully
responsive React web app that works identically on mobile browsers and
desktop/laptop screens (no separate native app, one responsive codebase).

TECH STACK:
- React + Vite for the frontend
- TailwindCSS for styling, with full dark mode support (class-based strategy,
  toggle switch in the navbar, persisted in localStorage)
- Framer Motion for page transitions, card hover effects, and modal animations
- React Router for navigation
- Lucide React for icons
- Firebase Auth (email/password) for signup/login
- Firebase Firestore for the database and real-time chat
- Google Gemini API (via a Google AI Studio key stored in an environment
  variable) for three AI features described below
- Browser-native Web Speech API for voice input (SpeechRecognition) and
  voice output (SpeechSynthesisUtterance) — no external voice API

CORE SCREENS:
1. Auth screen (Sign up / Log in) using Firebase Auth
2. Home screen: grid of 18 service categories with icons — Electrician,
   Plumber, Carpenter, Painter, AC Technician, House Cleaner, Appliance
   Repair Technician, Mechanic, Gardener, Movers & Packers, Pest Control,
   CCTV/Internet Technician, Welder, Mason, Handyman, Photographer,
   Videographer, Event Decorator, DJ, Caterer, Waiter/Server. Also include
   a prominent search bar with a microphone icon for voice input, and a
   text field for typing a free-text description of what the user needs.
3. AI Matching screen: after the user describes their need (text or voice),
   show a loading animation, then display the AI's interpreted category,
   urgency level, a short summary of the request, and an estimated price
   range in PKR.
4. Provider List screen: show 3-5 matched provider cards (photo, name,
   rating, price range, one-line AI-generated reason why they were matched),
   ranked best to worst.
5. Provider Detail screen: full profile, bio, past job count, a "Book Now"
   button.
6. Booking screen: pick date/time, enter address and notes, confirm booking
   (cash on delivery, no payment gateway needed).
7. Chat screen: real-time chat between the user and their assigned provider,
   using Firestore listeners, with a clean message-bubble UI.
8. My Bookings dashboard: list of bookings grouped by status (pending,
   confirmed, completed, cancelled).

DESIGN DIRECTION:
- Clean, modern, trustworthy feel — think a professional service marketplace,
  not a generic template. Rounded cards, soft shadows, clear visual hierarchy.
- Primary brand color: a trustworthy green (like #16A34A) with a neutral
  dark mode background (#0F172A range), not pure black.
- Smooth micro-animations on button presses, card entrances, and screen
  transitions using Framer Motion — nothing excessive, just polish.
- Mobile-first layout that scales up cleanly to desktop with a wider grid
  and side navigation on larger screens.

Start by scaffolding the project structure and routing, then build the Home
screen with the category grid and dark mode toggle first, before moving to
authentication and the AI features.
```

---

## FOLLOW-UP PHASE PROMPTS (use these one at a time as the build progresses)

**Phase 2 — Auth**
```
Add Firebase Authentication with email/password signup and login. Create
a users collection in Firestore that stores name, email, phone, and city
on signup. Protect all routes except the auth screen so unauthenticated
users are redirected to login.
```

**Phase 3 — Seed provider data**
```
Create a providers collection in Firestore and seed it with 15-20 realistic
Faisalabad-based providers spread across the 18 categories (name, category,
city, rating out of 5, price range in PKR, a short bio, and available: true).
Write a one-time seed script to populate this data.
```

**Phase 4 — Gemini Intent Parser**
```
Add a Gemini API call that takes the user's free-text or voice-transcribed
input and returns a JSON object with: category (must match one of the 18
service categories exactly), urgency ("low", "medium", or "high"), and a
one-line summary of the request. Display this on the AI Matching screen
with a clean loading state while the API call is in progress.
```

**Phase 5 — Gemini Provider Matcher + Pricing**
```
Add two more Gemini calls: one that takes the matched category and city,
fetches matching providers from Firestore, and asks Gemini to rank the top
3-5 with a one-sentence reason for each; and another that takes the category
and job summary and returns a realistic PKR price range with a short
explanation. Show both results together on the Provider List screen.
```

**Phase 6 — Voice input**
```
Add a microphone button next to the search bar on the Home screen that uses
the browser's SpeechRecognition API to convert spoken input into text,
which then flows into the same Intent Parser pipeline as typed text. Add a
subtle pulsing animation on the mic button while listening.
```

**Phase 7 — Booking + Chat**
```
Build the booking flow: date/time picker, address field, notes field, and
a confirm button that writes a new document to the bookings collection with
status "pending". After confirming, redirect to a chat screen for that
booking, using Firestore real-time listeners so messages appear instantly
for both the user and provider side (simulate the provider side with a
second demo account for testing).
```

**Phase 8 — Dashboard + polish**
```
Build the "My Bookings" dashboard showing all the current user's bookings
grouped by status. Add empty states, loading skeletons, and make sure every
screen is fully responsive and tested in both dark and light mode.
```

**Phase 9 — Deploy**
```
Prepare this project for deployment on Vercel. Confirm all environment
variables (Firebase config, Gemini API key) are properly referenced via
.env and not hardcoded. Generate a clean README explaining setup steps.
```
