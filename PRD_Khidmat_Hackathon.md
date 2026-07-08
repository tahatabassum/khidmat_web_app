# Product Requirements Document
## Khidmat — On-Demand Home Services & Labor Marketplace (DYLP Hackathon Edition)

**Hackathon:** Digital Youth Leadership Program (DYLP) — Vibe Coding Hackathon 2026
**Category:** Automation / Civic & Social Impact
**Deadline:** July 20, 2026, 11:59 PM PKT
**Scope:** Hackathon MVP now → full production app after (not built in this phase)

---

## 1. Problem Statement

Finding a trustworthy electrician, plumber, or event photographer in Pakistan today means asking around on WhatsApp groups, calling random numbers off a signboard, or hoping a neighbor's recommendation is still in business. There's no single platform where a user describes what they need and gets matched instantly with a verified, priced, bookable professional — the way ride-hailing solved transport, Khidmat solves labor and event services.

## 2. Solution Overview

Khidmat is a web app (mobile + desktop, single responsive codebase) where users:
1. Describe their need in plain language or by voice ("my kitchen tap is leaking")
2. Get matched to the right service category and nearby providers via a Gemini AI agent
3. See an estimated price range before booking
4. Book instantly, cash-on-delivery
5. Chat directly with their assigned provider in-app

## 3. Service Categories (18 total, grouped)

**Home & Technical Labor:** Electrician, Plumber, Carpenter, Painter, AC Technician, House Cleaner, Appliance Repair Technician, Mechanic, Gardener, Movers & Packers, Pest Control, CCTV/Internet Technician, Welder, Mason, Handyman

**Events & Entertainment:** Photographer, Videographer, Event Decorator, DJ, Caterer, Waiter/Server

## 4. Why This Wins on Judging Criteria

| Criterion | How Khidmat Delivers |
|---|---|
| Originality | Real multi-agent AI system doing intent parsing + matching + pricing — not a single chatbot wrapper |
| Technical Execution | Full auth, live DB, real-time chat, voice input, working booking flow — genuinely complete product |
| Practical Applicability | Every household in Pakistan is a potential user, on day one |
| Real-World Impact | Solves a universal daily friction point — trust and access to labor services |

---

## 5. Complete Feature List

- Email/password signup & login (Firebase Auth)
- Browse 18 categories with icons, or describe need in free text/voice
- AI Intent Parser: understands free-text/voice input → maps to correct category + urgency
- AI Provider Matcher: ranks seeded providers by rating, price, proximity (simulated for demo)
- AI Pricing Estimator: gives a price range before booking
- Provider profile pages (photo, rating, past jobs, price range)
- Booking flow: select date/time, address, notes → confirm → cash on delivery
- In-app real-time chat with assigned provider (Firestore real-time listeners)
- Voice assistant: mic button using browser's native Web Speech API — speak your need instead of typing
- Dark mode / light mode toggle, persisted across sessions
- Booking history dashboard ("My Bookings": upcoming, completed, cancelled)
- Fully responsive — one codebase, works identically on mobile browser and laptop

---

## 6. Complete Tech Stack (Zero Cost)

| Layer | Tool | Why |
|---|---|---|
| Frontend | React + Vite | Fast, you already know it |
| Styling | TailwindCSS | Rapid, consistent styling + easy dark mode |
| Animation | Framer Motion | Page transitions, card hovers, modal animations |
| Icons | Lucide React | Clean, consistent icon set for all 18 categories |
| Routing | React Router | Multi-page navigation |
| Auth + DB | Firebase (Auth + Firestore) | Matches your existing Khidmat backend logic — free Spark plan covers hackathon scale |
| Real-time Chat | Firestore real-time listeners | No extra service needed, included in Firebase free tier |
| Voice Input/Output | Web Speech API (browser-native) | Zero cost, zero API key, works in Chrome/Edge |
| Generative AI | Gemini API (Google AI Studio key) | Free tier, powers Intent Parser + Matcher + Pricing agents |
| Hosting | Vercel | Free tier, satisfies hackathon deployment rule |
| State Management | React Context (or Zustand if state grows complex) | Lightweight, no extra cost |

No paid API keys or credit cards required anywhere.

---

## 7. System Architecture

```
┌────────────────────┐
│   React Frontend    │
│ (Auth / Home /       │
│  Booking / Chat /    │
│  Dashboard)          │
└─────────┬───────────┘
          │
  ┌───────┼─────────────────────┐
  ▼                             ▼
┌──────────────┐        ┌──────────────────┐
│ Firebase       │        │ Gemini API         │
│ Auth + Firestore│       │ (3 agent prompts)  │
│ (users, providers,│     │ Intent → Match →   │
│ bookings, chats) │      │ Pricing            │
└──────────────┘        └──────────────────┘
```

**Flow:**
1. User signs up/logs in → Firebase Auth
2. User types or speaks their need → Web Speech API converts voice to text if used
3. Text sent to **Intent Parser agent** → returns category + short summary + urgency level
4. Category + city sent to **Provider Matcher agent** → ranks 3-5 seeded providers from Firestore
5. Job description sent to **Pricing Estimator agent** → returns estimated price range
6. User picks a provider → confirms date/time/address → booking written to Firestore
7. Chat screen opens → real-time messages between user and provider via Firestore listeners
8. Booking status updates in "My Bookings" dashboard

---

## 8. Data Model (Firestore Collections)

```
users/{userId}
  - name, email, phone, city, createdAt

providers/{providerId}
  - name, category, city, rating, priceRange, photoUrl, bio, available: bool

bookings/{bookingId}
  - userId, providerId, category, description, address,
    scheduledDate, status ('pending'|'confirmed'|'completed'|'cancelled'),
    priceEstimate, createdAt

chats/{bookingId}/messages/{messageId}
  - senderId, text, timestamp
```

---

## 9. Gemini Agent Prompt Design

**Agent 1 — Intent Parser**
```
You are a service-request classifier for a Pakistani home-services app.
Given a user's free-text or voice-transcribed description, return JSON:
{ "category": one of [18 categories], "urgency": "low"|"medium"|"high",
  "summary": "one-line restatement of the job" }
User input: "{user_text}"
```

**Agent 2 — Provider Matcher**
```
You are ranking service providers for a customer.
Given category "{category}", city "{city}", and this list of providers
with their rating/price/availability: {provider_list_json}
Return the top 3 providers ranked by best overall fit, with a one-sentence
reason for each ranking.
```

**Agent 3 — Pricing Estimator**
```
You are estimating a fair price range in PKR for a home service job in Pakistan.
Category: "{category}". Job description: "{summary}".
Return a realistic price range (e.g. "Rs 800 - Rs 1500") based on typical
market rates for this type of job, with one sentence explaining the estimate.
```

All three run in sequence during the booking flow — this is your real, meaningful multi-agent AI system, not a single wrapper call.

---

## 10. Voice Assistant Implementation Note

Use the browser's built-in `SpeechRecognition` (webkitSpeechRecognition) for voice-to-text, and `SpeechSynthesisUtterance` for the app to speak responses back (e.g. reading out the matched provider's name and price). Both are native browser APIs — no library, no API key, no cost, and they work well in Chrome on both mobile and desktop.

---

## 11. Demo Strategy for Judging (Important)

Since real providers won't be online during judging, seed 3-5 realistic Faisalabad-based provider profiles, and have one teammate log in as a "provider" account in a second browser tab during the demo video to show live chat working both directions. This proves the real-time feature works without needing actual strangers online.

---

## 12. Submission Checklist

- [ ] Project name + 1000-word description
- [ ] Google Drive link with full source code (open access)
- [ ] Demo video (2-3 min): problem → voice search demo → AI matching → booking → live chat → dark mode toggle
- [ ] Live Vercel link, tested working 24h before deadline
- [ ] Team registration form filled correctly (leader field, 3+ members)

---

## 13. Post-Hackathon Roadmap (not built now, mention in pitch as vision)

- CNIC verification + SMS OTP for real provider trust
- Payment gateway integration (JazzCash/EasyPaisa)
- Real provider onboarding across multiple cities
- Native mobile app (React Native) for offline/push notification support
- Ratings & review system with photo proof of completed jobs
