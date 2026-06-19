# 🌍 CulturalVault — World Heritage Explorer

CulturalVault is a production-ready, full-stack web application designed to explore, map, and preserve endangered cultural heritage sites, oral histories, and community traditions. Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **React Leaflet**, it features a beautiful, glassmorphic Editorial design tailored for immersive heritage exploration.

![CulturalVault Cover](https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80)

---

## ✨ Features

### 🏛️ Core Platform & Exploration
*   **Responsive Heritage Grid** — Staggered, grid-based card layout showcasing cultural monuments, artifacts, and literature with mobile-first responsiveness.
*   **Interactive Geolocation Map** — Powered by Leaflet/React-Leaflet, highlighting cultural assets and endangered heritage zones geographically.
*   **Debounced Smart Search** — Instantly query terms across titles, descriptions, and tags with a optimized 350ms debounce layer.
*   **Multi-Category Filtering** — Switch seamlessly between 8 custom cultural disciplines (*Architecture, Art, Music, Literature, Cuisine, Traditions, Crafts, and Dance*) using animated pill buttons.
*   **Dynamic Sorting & Pagination** — Sort artifacts alphabetically, by highest rating, newest discovery, or oldest origin, backed by paginated layouts.
*   **Bookmarks System** — Save favorite heritage files directly to personal collections via a custom React Context + LocalStorage wrapper.

### 👤 Personalized User Dashboard & Accounts
*   **Gmail Authentication Flow** — Fast local sign-in and sign-up flows tracking accounts with session tokens.
*   **Personal Profile Controls** — Interactive user profiles enabling real-time name edits, customizable email addresses, and an interactive interest selector.
*   **Profile Avatar Management** — Interactive profile picture change capability saving avatar base64 strings locally.
*   **Account Age Tracker** — Displays relative dates for account duration (e.g. *Active for 3 days*, *Joined yesterday*).
*   **Interest-Based Content Recommendations** — Displays custom recommended oral stories, articles, and artifacts prioritized based on selected active interest categories.

### 🕒 Recently Viewed History
*   **Interactive Session Logger** — Automatically logs user view history for Stories, Articles, Community posts, and Risk events.
*   **Real-time Type Filter** — A premium dropdown filter (**All Views**, **Blogs & Articles**, **Stories**, **Community Heritage**, and **Risk Dashboard**) next to the history header.
*   **Dynamic Empty States** — Informative dashed-border placeholders indicating missing history categories dynamically.

### 🛡️ Risk Intelligence & Management
*   **Risk Dashboard Map** — Interactive map detailing endangered cultural monuments facing climate, environmental, or conflict threats.
*   **Real-time Risk Metrics** — View localized vulnerability indicators and risk reports.

### 🎙️ Oral Stories & Archive
*   **Audio Playbacks** — Native audio player integration for listening to recorded oral folklore from regional narrators.
*   **Multimedia Story Galleries** — Displays high-resolution photographic slides matching each storytelling item.

### 🤖 AI Cultural Companion (Advanced AI-Based Capabilities)
*   **Real-time Streaming Engine** — Integrates Vercel's AI SDK stream pipelines mapping to the high-speed **Gemini 2.5 Flash** model for smooth, sub-second latency markdown responses.
*   **Multimodal Visual Recognition** — Native file upload attachments parsed on-the-fly via a client-side `FileReader` base64 converter. Users can upload images of monuments, scripts, or relics and ask the AI model to explain their historical significance.
*   **Voice Input Dictation (Speech-to-Text)** — Custom dictation triggers using the browser's web Speech Recognition API to translate user spoken word queries into text inputs in real time.
*   **Multi-Language Translators** — A select dropdown dynamically instructing the LLM to process and output responses entirely in the user's preferred language (**English, Spanish, Hindi, Bengali, French, or Arabic**), syncing voice capture language configurations to match.
*   **Session State Cache** — Session logs are cached locally on client devices (`cultural_vault_chat_<id>`) and indexed inside sidebars, letting users manage, load, or delete separate conversations.
*   **Reasoning & Citations Pipeline** — Direct visual indicators (`<Reasoning>` and `<Sources>`) extracting source citations and logical deduction steps returned by the model stream.

### 📊 Admin Control Center
*   **Operational Analytics** — System telemetry dashboards reporting items explored, active collections, and curator rankings.
*   **Content Moderation & Security Logs** — Panel displaying database size, contribution metrics, and security checkpoints.

---

## 🛠️ Technical Stack & Architecture

### 🖥️ Frontend (Client Side)
*   **Core Framework**: [Next.js 16(App Router)](https://nextjs.org/) for single-page dynamic routing, layout nesting, and high-performance client views.
*   **Library**: [React 18](https://react.dev/) using advanced hooks (`useState`, `useEffect`, `useContext`) for interactive, responsive components.
*   **Language**: [TypeScript 5](https://www.typescriptlang.org/) for complete build-time type safety across data contracts, components, and service layers.
*   **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) utilizing absolute themes, custom ambient orange/amber palettes, and premium glassmorphism layouts (`backdrop-blur-md`).
*   **Animations**: [Framer Motion 11](https://www.framer.com/motion/) providing page load transitions, card entry lists, and responsive hover micro-interactions.
*   **Map Integrations**: [Leaflet](https://leafletjs.org/) & [React Leaflet 4](https://react-leaflet.js.org/) for loading and plotting geo-coordinates of heritage danger spots and folklore narrations.
*   **State Store**: [Zustand 4](https://github.com/pmndrs/zustand) for low-overhead client state transitions.
*   **Theme Control**: [next-themes](https://github.com/pacocoursey/next-themes) backing light-to-dark automated toggle sequences.
*   **Visual Analytics**: [Recharts 3](https://recharts.org/) rendering administrative status metrics, activity trackers, and data histograms.
*   **Icons**: [Lucide React](https://lucide.dev/) vectors.

### ⚙️ Backend (Server Side & Database)
*   **Serverless APIs**: Next.js API Routes supporting advanced queries (e.g. search, pagination, category filtering, and sorting parameters).
*   **Database Schema (ODM)**: [Mongoose 9](https://mongoosejs.com/) and [MongoDB](https://www.mongodb.com/) managing metadata, upload telemetry, and administrative logs.
*   **Storage Synchronization Layer**: Client-side `localStorage` cache supporting profile persistence, bookmarks, user interest scopes, and recently viewed filtering history directly in the browser session.

### 🤖 AI Model & Integration
*   **Underlying Model**: **Google Gemini 2.5 Flash / Pro** models, delivering lightning-fast, highly accurate context processing for heritage exploration, safety recommendations, and narrative transcriptions.
*   **Integration Layer**: [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` and `@ai-sdk/google` provider) powering continuous streaming responses (`useChat`), structural JSON generation, and smooth rendering text outputs.

### 📊 Overall Details & Data Flow
1.  **Exploration & Search Queries**: Component-based queries execute requests through centralized hooks (`useItems`) which fetch from Next.js serverless routes. Text filters are debounced by 350ms on the client.
2.  **View Logging & Filtering**: Whenever details pages load, a helper function records page actions to a `recently_viewed_history` array stored in local memory. The dashboard UI fetches this dataset and filters entries according to dropdown preferences.
3.  **Recommendations Engine**: A client-side interest mapper reads selected tags (e.g. *Art, Cuisine, Traditions*) from the active user's profile context and sorts standard database rows to match primary user tags.
4.  **Admin Telemetry**: The Admin Dashboard integrates system telemetry indicators checking database size metrics, contribution tallies, and security access logs visualized through Recharts.

---

## 📂 Project Structure

```bash
src/
├── app/
│   ├── (auth)/
│   │   ├── signin/page.tsx      # User authentication login page
│   │   └── signup/page.tsx      # User account creation page
│   ├── admin/
│   │   └── dashboard/page.tsx  # Admin moderation console with telemetry
│   ├── api/
│   │   ├── items/route.ts      # REST endpoints supporting pagination/sorting
│   │   └── stories/route.ts    # Oral story REST API
│   ├── articles/page.tsx       # Knowledge Hub articles and blogs layout
│   ├── bookmarks/page.tsx      # User bookmarked collection panel
│   ├── community-gallery/
│   │   └── [id]/page.tsx       # User-submitted gallery detail pages
│   ├── dashboard/page.tsx      # Main User dashboard page with history filtering
│   ├── item/[id]/page.tsx      # Heritage artifact details
│   ├── profile/page.tsx        # Profile configuration and avatar uploads
│   ├── risk-map/page.tsx       # Risk monitoring interactive map view
│   ├── stories/[id]/page.tsx   # Audio narration details and location mapping
│   ├── globals.css             # Global styles, variables & fonts pairing
│   └── layout.tsx              # Root HTML wrapper with providers
├── components/
│   ├── layout/                 # Navbar, Footer, and PageWrappers
│   ├── cards/                  # ItemCard, ItemGrid details
│   ├── search/                 # SearchBar component
│   ├── filters/                # Category pills and Sort selectors
│   ├── ui/                     # Toaster, Ratings, Skeletons, and States
│   └── stories/                # Map components for stories and risks
├── context/
│   └── BookmarksContext.tsx    # Bookmarks React Context
├── hooks/
│   └── index.ts                # Custom API hooks: useItems, useItem, etc.
├── services/
│   └── itemsService.ts         # Central fetch service logic
├── types/
│   └── index.ts                # Shared TypeScript models and types
└── utils/
    └── index.ts                # General utilities (recordRecentlyViewed, cn)
```

---

## 🚀 Getting Started

Follow these instructions to run the application locally on your computer.

### 📋 Prerequisites
*   **Node.js**: `v18.17.0` or higher
*   **Package Manager**: `npm` (bundled with Node.js) or `yarn` / `pnpm`

### 🔧 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/cultural-vault.git
    cd cultural-vault
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env.local` file in the root directory and add your Gemini API Key if using the AI Chat Companion:
    ```env
    GEMINI_API_KEY=your_google_gemini_api_key_here
    ```

### 💻 Running the Application

*   **Start the Local Development Server**
    ```bash
    npm run dev
    ```
    This launches the dev server. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

*   **Build the Production Bundle**
    ```bash
    npm run build
    ```
    Compiles all files for optimized production deployment.

*   **Start the Compiled Application**
    ```bash
    npm run start
    ```
    Launches the build container locally on port `3000`.

*   **Verify Types (Diagnostic Check)**
    ```bash
    npm run type-check
    ```
    Runs the TypeScript compiler diagnostics in non-emitting mode to check for any type safety violations.

*   **Linting Diagnostics**
    ```bash
    npm run lint
    ```
    Checks the code styling and architecture guidelines matching the Next.js specification.

---

## 🎨 Design System & Visuals

*   **Warm Editorial Typography**: Pairs elegant *Playfair Display* (for large heritage headers) with *DM Sans* (for structural copy), emphasizing antiquity and readability.
*   **Warm Editorial Palette**: Utilizes curated HSL amber, orange, and charcoal tones, avoiding flat defaults.
*   **Premium Glassmorphism**: Cards use translucent backdrop filters (`backdrop-blur-md`), subtle borders (`border-white/5`), and high-performance shadow elevations.
*   **Micro-Animations**: Incorporates Framer Motion animations for hover states, pill button switches, transitions, and loading skeletons.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

© 2026 CulturalVault. Designed with 🧡 to safeguard world heritage. 
