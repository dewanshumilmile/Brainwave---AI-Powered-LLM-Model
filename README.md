# Brainwave — Full-Stack AI Search Engine Clone

> A production-grade Perplexity AI clone built with **Next.js 14**, **TypeScript**, **Clerk Auth**, **Groq (Llama 3)**, **PostgreSQL**, and **Tailwind CSS + Shadcn UI**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![Groq](https://img.shields.io/badge/LLM-Llama_3.3_70B-orange)
![PostgreSQL](https://img.shields.io/badge/DB-Neon_PostgreSQL-green?logo=postgresql)

---

## ✨ Features

### Core
- 🔍 Perplexity-style AI search interface
- ⚡ Streaming responses (SSE) via Groq — Llama 3.3-70B (free)
- 🌐 Real-time web search + citations via Tavily API
- 💬 Chat memory — context retention across turns
- 📜 Conversation history sidebar — rename, delete
- 🔐 Authentication via Clerk (email + Google OAuth, MFA, magic link)
- 🌙 Dark / Light mode with system-aware toggle
- 📱 Fully responsive — mobile + tablet + desktop

### Advanced
- 📄 Document Q&A — upload PDF, DOCX, TXT and ask questions
- 🖼️ Image understanding — Gemini Vision API (explain charts, extract text from screenshots)
- 📋 Markdown rendering — syntax-highlighted code blocks, tables, LaTeX

### UX Polish
- Skeleton loaders, Framer Motion animations
- Copy / share AI responses
- Drag & drop file upload
- Toast notifications (Sonner)
- Auto-growing textarea

---

## 🛠 Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript            |
| Styling     | Tailwind CSS, Shadcn UI, Framer Motion         |
| Auth        | **Clerk** (email, Google OAuth, MFA)           |
| AI / LLM    | Groq API — Llama 3.3-70B (FREE)               |
| Image AI    | Google Gemini 1.5 Flash (FREE tier)            |
| Web Search  | Tavily API (FREE tier)                         |
| ORM         | Prisma                                         |
| Database    | PostgreSQL — Neon.tech (FREE)                  |
| File Parse  | pdf-parse, mammoth                             |
| Deploy      | Vercel + Neon DB                               |

---

## 📁 Project Structure

```
Brainwave-clone/
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout — ClerkProvider + ThemeProvider
│   │   ├── page.tsx                        # Landing page (redirects if signed in)
│   │   ├── globals.css
│   │   ├── sign-in/[[...sign-in]]/page.tsx # Clerk sign-in page
│   │   ├── sign-up/[[...sign-up]]/page.tsx # Clerk sign-up page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                  # Auth guard + sidebar
│   │   │   └── chat/
│   │   │       ├── page.tsx                # New chat
│   │   │       └── [id]/page.tsx           # Existing conversation
│   │   └── api/
│   │       ├── chat/route.ts               # Groq streaming (SSE)
│   │       ├── upload/route.ts             # File upload + parsing
│   │       └── conversations/
│   │           ├── route.ts                # GET list / POST create
│   │           └── [id]/route.ts           # GET / PATCH rename / DELETE
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx           # Core chat UI + SSE consumer
│   │   │   ├── MessageBubble.tsx           # Message + markdown + copy
│   │   │   ├── SearchBar.tsx               # Input + web search toggle + attach
│   │   │   ├── SourceCards.tsx             # Citation chips with tooltips
│   │   │   ├── FileUploader.tsx            # Drag & drop uploader
│   │   │   └── SkeletonMessage.tsx         # Shimmer loading state
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                 # Conversation list + Clerk user
│   │   │   ├── Navbar.tsx                  # Landing navbar + Clerk buttons
│   │   │   └── ThemeToggle.tsx
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   └── Pricing.tsx
│   │   └── ui/                             # Shadcn primitives (button, input, label)
│   ├── lib/
│   │   ├── groq.ts                         # Groq client + system prompt builder
│   │   ├── db.ts                           # Prisma singleton
│   │   ├── search.ts                       # Tavily web search + context builder
│   │   ├── fileParser.ts                   # PDF / DOCX / TXT extraction
│   │   ├── gemini.ts                       # Gemini Vision API
│   │   └── utils.ts                        # cn, formatDate, truncate, getInitials
│   └── types/index.ts
├── prisma/schema.prisma
├── middleware.ts                            # Clerk route protection
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourusername/Brainwave-clone.git
cd Brainwave-clone
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` (see sections below for how to get each key).

### 3. Set up the database

```bash
npm run db:push       # apply schema to Neon DB
npm run db:generate   # generate Prisma client
```

### 4. Run dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔐 Clerk Authentication Setup

Clerk replaces NextAuth entirely — no custom login pages, no bcrypt, no sessions table.

**Steps:**

1. Go to [https://clerk.com](https://clerk.com) → **Create application**
2. Enable **Email/Password** + **Google** in the dashboard
3. Go to **API Keys** → copy both keys

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

4. In Clerk Dashboard → **Paths**, verify these are set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in redirect: `/dashboard/chat`
   - After sign-up redirect: `/dashboard/chat`

**That's it.** Clerk handles:
- Email/password registration and login
- Google OAuth (one toggle in dashboard)
- Email verification + magic links
- Password reset flow
- MFA / 2FA
- User profile management (`<UserButton />` component)
- Session tokens (JWT)

---

## 🔑 Getting Free API Keys

| Service        | URL                                   | Free Tier                    |
|----------------|---------------------------------------|------------------------------|
| **Clerk**      | https://clerk.com                     | 10,000 MAUs free             |
| **Groq**       | https://console.groq.com             | Generous free token limit    |
| **Gemini**     | https://aistudio.google.com          | 15 req/min free              |
| **Tavily**     | https://tavily.com                   | 1,000 searches/month free    |
| **Neon DB**    | https://neon.tech                    | 512MB free PostgreSQL        |

---

## 🗄 Database Schema

```prisma
model Conversation {
  id          String    @id @default(cuid())
  title       String
  clerkUserId String          // Clerk's user_xxx ID — no User table needed
  createdAt   DateTime
  updatedAt   DateTime
  messages    Message[]
}

model Message {
  id             String
  conversationId String
  role           String   // "user" | "assistant"
  content        String
  sources        Json?    // Source[] — title, url, snippet, favicon
  fileContext    String?  // extracted document text
  imageUrl       String?
  createdAt      DateTime
}
```

> No `User`, `Account`, or `Session` tables needed — Clerk manages all of that.

---

## 🌐 API Routes

| Method   | Endpoint                         | Auth   | Description                        |
|----------|----------------------------------|--------|------------------------------------|
| `POST`   | `/api/chat`                      | Clerk  | Groq streaming AI response (SSE)   |
| `POST`   | `/api/upload`                    | Clerk  | File upload + text extraction      |
| `GET`    | `/api/conversations`             | Clerk  | List user's conversations          |
| `POST`   | `/api/conversations`             | Clerk  | Create new conversation            |
| `GET`    | `/api/conversations/[id]`        | Clerk  | Get conversation with messages     |
| `PATCH`  | `/api/conversations/[id]`        | Clerk  | Rename conversation                |
| `DELETE` | `/api/conversations/[id]`        | Clerk  | Delete conversation                |

All routes use `const { userId } = await auth()` from `@clerk/nextjs/server`.

---

## ☁️ Deployment (Vercel)

```bash
npm i -g vercel
vercel
vercel --prod
```

**Add these in Vercel → Project → Settings → Environment Variables:**

```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard/chat
GROQ_API_KEY
GEMINI_API_KEY
TAVILY_API_KEY
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Also update in Clerk Dashboard → Domains** — add your Vercel production URL.

---

## 🧠 Architecture Notes

### Streaming (SSE)
`/api/chat` returns a `ReadableStream` with `text/event-stream` content type. Each Groq token is sent as a `data: {...}` line. The client reads via `fetch` + `ReadableStream` reader — no WebSocket needed.

### RAG Pipeline
1. User query → Tavily web search → top 5 results
2. Results injected into system prompt as numbered context `[1]`, `[2]` etc.
3. Groq generates answer with inline citations
4. Source cards rendered in UI

### Document Q&A
1. File uploaded to `/api/upload`
2. `pdf-parse` or `mammoth` extracts plain text (up to 30k chars)
3. Text prepended to user message as `fileContext`
4. AI answers based on the document

### Image Understanding
1. Image → base64 on upload
2. Sent to `Gemini 1.5 Flash` Vision API with the user's question
3. Gemini's analysis is injected as context into the Groq prompt

---

## 📝 Resume Description

**Brainwave — Full-Stack AI Search Engine** | Next.js 14 · TypeScript · Clerk · Groq · PostgreSQL

- Built a Perplexity AI-inspired search platform with Next.js 14 App Router, TypeScript, Tailwind CSS, and Shadcn UI, featuring real-time streaming LLM responses and web-cited answers
- Integrated Groq API (Llama 3.3-70B) with Server-Sent Events for token-by-token streaming; implemented RAG pipeline with Tavily search API for live source citations
- Built multi-modal file processing pipeline — PDF/DOCX text extraction and Gemini Vision API for image understanding and screenshot OCR
- Implemented Clerk authentication (email/password + Google OAuth), Prisma ORM with PostgreSQL on Neon, per-user data isolation, and route middleware protection
- Deployed on Vercel with Neon PostgreSQL; production-quality patterns: error boundaries, skeleton loaders, dark/light theming, toast notifications

### Interview talking points
- **Streaming**: SSE vs WebSockets — SSE is simpler, HTTP/1.1 compatible, perfect for one-directional token stream
- **RAG**: retrieve → inject context → generate — why LLMs need retrieval for current info
- **Clerk vs custom auth**: trade-offs of managed auth — speed vs control, compliance, edge cases handled
- **DB design**: `clerkUserId` as foreign key without a `users` table — Clerk as source of truth
- **File parsing**: chunking strategy for LLM context window limits (8k chars per chunk)

---

## 📄 License

MIT — free to use for personal and commercial projects.
