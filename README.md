# Khidmat (خدمت) — On-Demand Home Services Marketplace

Khidmat is a premium, security-first, on-demand home services marketplace designed for Pakistan. Styled with modern glassmorphism aesthetics, micro-animations, and responsive layouts, it simulates and integrates a dual-role (Customer & Labor/Worker) marketplace similar to Uber and InDrive, featuring automated location monitoring and real-time chat negotiations.

---

## 🌟 Key Features

### 1. Unified Search & Speech Recognition
*   **Speech-to-Text Search**: Powered by the browser-native `SpeechRecognition` API. Users can search by speaking directly into the mic.
*   **Aesthetic Audio Visualizer**: Listening triggers a blurred page overlay showing an animated voice equalizer soundwave.
*   **Demo Shortcuts**: Includes pre-recorded search shortcuts for easy offline presentation testing without active hardware requirements.

### 2. Gemini AI Intent Parser
*   Processes natural language requests (e.g. *"wiring inside the bathroom is sparking urgently"*) directly via Google Gemini API REST calls.
*   Enforces schema safety using `responseMimeType: "application/json"` to categorize jobs (across 21 Pakistan-specific worker specialties), determine urgency (low, medium, high), and generate a clean task summary.
*   **Offline Fallback Mode**: If Gemini API credentials are absent, the engine falls back to a smart regular-expression keyword parser.

### 3. Automated Geolocation & Location Monitoring
*   **Instant Browser Detection**: Upon visiting the dashboard, the application requests browser geolocation access (`navigator.geolocation.getCurrentPosition`) to determine client coordinates and update their profile dynamically.
*   **Automatic Travel Distance Estimation**: Booking confirmation automatically calculates distance (in km) to the provider and estimates travel fee (Rs. 100 base + Rs. 20/km) and travel duration without requiring manual pin-drops.

### 4. Gemini AI Provider Matcher & Price Estimator
*   **AI Ranking Engine**: Compares customer coordinates with available specialists in their city, ranking matches by proximity, rating, total completed jobs, and worker bio descriptions.
*   **AI PKR Price Ranges**: Estimates a realistic service price range in PKR based on job complexity and travel distances, incorporating detailed explanations.
*   **Offline Fallback Matcher**: Features a scoring-matrix fallback that scores and ranks candidates locally using ratings, distance penalties, and status tiers.

### 5. InDrive-style Online Availability Toggle
*   A header toggler allows providers to turn their service visibility **ONLINE** (active glowing beacon) and **OFFLINE**.
*   Offline workers are immediately filtered out from search suggestions and customer recommendations.

### 6. Distinct Provider Dashboard
*   Root route dynamically gates landing pages based on user roles. Providers land directly on a tailored dashboard.
*   **Provider Controls**: Online/Offline toggle, stats counters (jobs completed, PKR earnings, overall rating, dynamic level tier), active incoming service request cards, and chronological earnings logs.
*   **Actionable Bookings**: Providers can accept pending jobs or mark confirmed jobs as completed.

### 7. Real-Time Chat & System Notification Logs
*   A responsive message-bubble chat page with dynamic timestamps, aligning client messages on the right (brand green) and provider replies on the left (slate gray).
*   **Dev Demo Board**: A floating panel at the top of the chat area (only visible in development builds) lets you simulate provider replies and status updates with one click.

### 8. Atomic Earnings Transaction Logic
*   Reviews submitted by customers recalculate provider average ratings and Level Tiers (Bronze, Silver, Gold, Platinum) dynamically.
*   Recalculation runs inside an atomic transactional write updating provider total jobs, overall rating, appending the `bookingId` to their `jobsHistory` array, and adding the job payout value to their `totalEarnings` total.

---

## 🛡️ Production-Grade Security (Firestore Rules)

Enforces strict role-based access controls defined in `firestore.rules`:
*   **User Profiles**: Users can read/write their own document only. Prevents clients from updating administrative credentials like `role`, `rating`, `totalJobs`, and `tier`.
*   **Bookings**: Access restricted strictly to the matched customer and provider IDs. Enforces price calculations (`totalPrice == basePrice + travelFee`).
*   **Messages**: Chat text records can only be read or written by the active customer or provider matched on the parent booking record.

---

## 🛠️ Tech Stack & Architecture

*   **Frontend**: React (SPA), Vite, TypeScript (compiled with `verbatimModuleSyntax` safety).
*   **Styling & Theme**: Tailwind CSS, Vanilla CSS with custom theme variables.
*   **Animations**: Framer Motion.
*   **Icons**: Lucide Icons.
*   **Database & Auth**: Firebase Auth and Firestore Database API.
*   **Generative AI**: Google Gemini Pro (REST client).

### Hybrid Architecture: Real Firebase vs. Zero-Config Mock DB
Khidmat is built to be run instantly out-of-the-box without configuring any services. Every database, authentication, geolocation, and AI call features a **mock fallback wrapper** that saves data to `localStorage`, falls back to Canvas schematics, or parses regex. If you place real API keys in the `.env` file, the app automatically switches to live Google Maps, live Firebase Auth/Firestore, and live Gemini API requests!

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory and specify the following variables:

```properties
# Firebase Credentials (Switch to real Firebase when provided)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Google Maps Javascript SDK Key (Optional - falls back to canvas radar)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Google Gemini API Key (Optional - falls back to regex parser & local matrix)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🗄️ Database Seeding Logic
On startup, the system checks the `providers` collection. If empty (in either real Firestore or local storage mock), it automatically seeds **27 detailed, realistic service provider profiles** across 10 major Pakistani cities (Lahore, Karachi, Islamabad, Faislabad, etc.) and 21 technical specialties to ensure search results are populated and ready to test immediately!
