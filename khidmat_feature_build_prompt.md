# MASTER PROMPT — Khidmat Feature Build (Provider Dashboard, Images, Categories, Footer)

Paste this whole thing into Antigravity as one instruction. Reference `ARCHITECTURE.md` (already provided) for existing schema/routes — extend it, don't replace it.

---

## Summary of what's broken / missing

1. Home page shows all 21 categories at once instead of a curated few + "View More".
2. Category → provider matching flow needs to correctly filter to **online** providers only, and clicking a provider should open a dedicated profile page with full details.
3. No profile image upload anywhere (signup or profile edit) — for both customer and provider roles.
4. Provider signup currently lands on the **same home page as customers**. Providers need their own distinct home/dashboard experience.
5. No earnings/job-history tracking for providers.
6. "Learn about Safety" button on the home page does nothing — needs a real page.
7. No footer on any page.
8. Profile page shows an actual photo where there should be a neutral default avatar when no image is set.

---

## 1. Home Page — Category Pagination

**File likely involved:** `Home.tsx` (category grid section referenced in `ARCHITECTURE.md`)

- Show only the **first 12 categories** (2 rows of 6, or whatever matches the existing grid) on the home page.
- Add a **"View More Categories"** button/link below the grid.
- Clicking it routes to a new page — `/categories` — that lists **all 21 categories** in the same visual style as the home grid.
- Clicking any category (from either home or `/categories`) routes to the existing `/matching` → `/providers` flow, unchanged.

## 2. Provider Matching & Profile Flow

**Files involved:** `ProviderList.tsx`, new `ProviderProfile` route (`/provider/:id` already exists per architecture — audit and fix it)

- Confirm `ProviderList.tsx` only queries providers where `available === true` (per existing schema) AND category matches. Fix if it's currently pulling offline providers too.
- Each provider card in the list should be clickable and route to `/provider/:id`.
- `/provider/:id` (Provider Profile page) must display, pulled live from Firestore `providers` collection:
  - Profile image (see Section 4 for fallback avatar logic)
  - Full name
  - Category/specialty
  - Bio
  - Location (city, and optionally a small map preview using existing `MapSelector.tsx` in read-only mode)
  - Phone number
  - Hourly/base rate (`basePrice`)
  - Rating + tier badge (`TierBadge.tsx` already exists — reuse it)
  - Total jobs completed
  - A "Book Service" CTA that proceeds to the existing `/booking` flow

## 3. Firestore Schema Extensions

Extend `UserProfile` and `ProviderDoc` interfaces (in `firebase.ts`/types file) to add:

```typescript
interface UserProfile {
  // ...existing fields unchanged
  photoURL?: string;        // NEW — Firebase Storage download URL
  totalEarnings?: number;   // NEW — provider-only, running total in PKR
  jobsHistory?: string[];   // NEW — provider-only, array of completed bookingIds
}

interface ProviderDoc {
  // ...existing fields unchanged
  photoURL?: string;        // NEW — mirror from UserProfile for public listing
  totalEarnings?: number;   // NEW — provider-only
}
```

Update `firestore.rules` so `photoURL` and `totalEarnings` follow the same write-protection pattern as `rating`/`totalJobs`/`tier` — i.e., **not directly client-writable**; `totalEarnings` should only update via the completed-booking flow (Section 6), not arbitrary client writes.

## 4. Profile Image Upload + Default Avatar

**Applies to both customer and provider roles, at signup AND in profile edit.**

- Add **Firebase Storage** to the project (`storage.ts` or extend `firebase.ts`) if not already configured.
- Signup form (`Auth.tsx`): add an optional "Upload Profile Photo" field (image picker + preview) for both roles. On submit, upload to Storage at path `avatars/{userId}.jpg`, then save the resulting `photoURL` to the user's Firestore doc.
- Profile page (`Profile.tsx` / settings): add an "Edit Photo" option that lets the user upload/replace their image at any time, same Storage path.
- **Default avatar fallback:** wherever `photoURL` is missing/empty, render a neutral placeholder — a plain gray circular silhouette icon (the generic "no profile picture" icon commonly used across social platforms), NOT a random stock photo. Implement this as a small reusable `<Avatar src={photoURL} name={name} />` component in `SharedUI.tsx` so it's consistent everywhere (Navbar, Profile, Provider cards, Provider Profile page).
- Add basic validation: file type (jpg/png only), max size (~2MB), and show upload progress/loading state.

## 5. Distinct Provider Home / Dashboard

**This is the biggest gap.** Right now providers land on the same `Home.tsx` as customers — that's wrong. Role-based routing needs to branch at the root route.

- After login/signup, check `role` from the user's Firestore doc:
  - `role === 'customer'` → existing `Home.tsx` (search + categories)
  - `role === 'provider'` → new `ProviderHome.tsx` (dashboard, described below)
- **`ProviderHome.tsx` must include:**
  1. **Online/Offline toggle** (prominent, top of page) — already have an `available` boolean field and an ONLINE/OFFLINE indicator in `Navbar.tsx` per your screenshots; move the primary control here and keep Navbar's indicator as a read-only reflection of the same state.
  2. **Location permission prompt**: when the provider toggles to Online, request browser geolocation permission (`navigator.geolocation.getCurrentPosition`) and update their `location: {lat, lng}` in Firestore at that moment. If permission is denied, keep them Offline and show an explanatory message (don't silently fail).
  3. **Dashboard stats cards:**
     - Total jobs done (`totalJobs`)
     - Total money earned (`totalEarnings`, formatted as PKR)
     - Current rating (`rating`)
     - Current tier (`TierBadge`)
  4. **Recent job history list**: pull from `bookings` where `providerId === currentUser.uid` and `status === 'completed'`, sorted by date descending, showing date, customer name, category, and amount earned per job.
  5. **Active/pending bookings section**: bookings with `status === 'pending'` or `'confirmed'` needing action (Accept Request / view details), matching the existing booking flow described in `ARCHITECTURE.md` Section 4B.

## 6. Earnings Trigger Logic

**File involved:** wherever `submitProviderReview` / booking-completion logic currently lives (per `ARCHITECTURE.md` Section 4C)

Current flow: provider marks booking `completed` → customer rates it → rating/tier updates.

**Add:** when a booking transitions to `completed` **and is confirmed by the customer** (i.e., the existing review-submission step, or a new explicit "Confirm Job Done" customer action if none exists yet), also:
- Increment the provider's `totalEarnings` by that booking's `totalPrice`.
- Append the `bookingId` to the provider's `jobsHistory` array.
- This must happen via a single atomic Firestore transaction/batch write alongside the existing rating/tier update, not a separate untracked write.

## 7. Suggested Additions (recommended, not mandatory — flag these to Taha before implementing)

Common patterns from real gig-economy platforms worth adding to the provider dashboard, since Section 5 dashboard is otherwise fairly bare:
- **Earnings breakdown by time period** (this week / this month / all-time) — simple date filtering on `jobsHistory`, no new backend needed.
- **Availability schedule** (optional working hours) instead of just binary online/offline — bigger scope, mention as future work only.
- **Notification badge** for new incoming booking requests while online.
- **Cancellation rate / response time** as additional trust metrics shown on their public Provider Profile (Section 2), since this builds customer trust — reuses existing `bookings` data, just needs aggregation.

Implement only the earnings-by-time-period one now if time allows; the rest are backlog notes for after the hackathon deadline.

## 8. Footer (both Customer and Provider views)

Add a persistent footer component (`Footer.tsx`), rendered inside `AppLayout` below all page content:

- Text: **"Made with ❤️ and ☕ for DYLP Hackathon"**
- Contact emails: `tahatabassum9@gmail.com` and `mabdullahramday08@gmail.com` (as `mailto:` links)
- Keep it visually minimal — small text, centered or left-aligned, subtle border-top, consistent with the existing green/cream color scheme.

## 9. "Learn about Safety" Page

- The button currently on the home page's safety banner ("Every professional undergoes a 5-step background check...") does nothing. Add a real route: `/safety`.
- Content: describe the 5-step verification process (CNIC/ID check, phone verification, address confirmation, background reference, in-app rating monitoring — write reasonable placeholder copy, doesn't need to be literally true yet for hackathon purposes, just needs to look complete).
- Link the existing button to this route.

---

## Build Order (do in this sequence to avoid breaking existing flows)

1. Schema extensions (Section 3) + Firestore rules update — do this first, nothing else works without it.
2. Avatar component + image upload (Section 4) — self-contained, low risk of breaking other pages.
3. Footer + Safety page (Sections 8, 9) — self-contained, zero risk.
4. Home category pagination (Section 1) — isolated to `Home.tsx`.
5. Provider Profile page fixes (Section 2) — depends on Section 3/4.
6. Role-based routing + ProviderHome dashboard (Section 5) — the biggest change, do after everything else is stable.
7. Earnings trigger logic (Section 6) — depends on Section 5 existing.

## Acceptance Criteria

- Signing up as a provider lands on a distinct dashboard, never the customer `Home.tsx`.
- Toggling Online requests location permission and updates Firestore `location`.
- Completing a booking (with customer confirmation) increases the provider's visible `totalEarnings` and job history without a page refresh being required to see it (or refreshes cleanly).
- Every page (`/`, `/categories`, `/providers`, `/provider/:id`, `/bookings`, `/profile`, `/safety`, provider dashboard) shows the new footer.
- No user, anywhere in the app, ever sees a real/random photo as a placeholder avatar — only the neutral silhouette icon when `photoURL` is empty.
- All new fields persist correctly in Firestore and survive a page reload / re-login.
- Report back which files were changed and a short note on any assumption made (e.g., if "customer confirms job done" required adding a brand-new UI button that didn't exist before).
