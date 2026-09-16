# KanyaKriti (कन्याकृति)
> *"Your Skill. Your Voice. Your Local Market."*

KanyaKriti is an AI-first hyperlocal commerce platform designed specifically for informal women artisans, tailors, cooks, and craftswomen across Indian neighborhoods (e.g., Koramangala, HSR Layout, Indiranagar in Bengaluru).

---

## 🚀 Key Architecture

### 1. Voice-to-Listing AI Engine (Powered by Groq)
- **Speech-to-Text (`/api/ai/transcribe`)**: Uses Groq Whisper (`whisper-large-v3` or `whisper-large-v3-turbo`) server-side to transcribe spoken voice notes in Hindi, Hinglish, or English.
- **Skill Extraction (`/api/ai/extract-skill`)**: Uses Groq LLaMA models (`llama-3.3-70b-versatile` or `llama-3.1-8b-instant`) with `json_object` response mode and strict **Zod** schema validation.
- **Untrusted Output Reliability**: All Groq outputs are validated against strict Zod schemas with an automated 1-step controlled self-correction loop and fallback to deterministic local heuristic engine if validation fails.
- **Listing Generation (`/api/ai/generate-listing`)**: Automatically crafts professional, grounded marketplace titles, descriptions, turnaround estimations, and hashtags.

### 2. Hyperlocal Multi-Factor Matching
Matches buyers to nearby verified artisans using a weighted formula:
$$\text{Score} = 0.40 \times \text{Skill} + 0.35 \times \text{Distance} + 0.15 \times \text{Rating} + 0.10 \times \text{Budget}$$

### 3. Order Lifecycle & Delivery Runner Workflow
- State machine: `PENDING` → `ACCEPTED` → `PREPARING` → `READY` → `PICKED_UP` → `DELIVERED` → `COMPLETED`.
- Hyperlocal runners pick up packages from artisans and deliver to buyers with real-time GPS coordinates and route map visualization.

### 4. North Star Metric & Financial Ledger
- Tracks each artisan's progress toward their **First ₹1,000 Milestone**.
- Automatically retains a 5% platform fee and credits 95% net payout to the artisan's balance upon order fulfillment.

---

## 🛠️ Environment Configuration

```bash
# Groq AI Configuration (Server-Side Only)
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_STT_MODEL=whisper-large-v3

# Authentication Secret
JWT_SECRET=

# MongoDB Database (Server-Side Only - Single Source of Truth)
MONGODB_URI=
MONGODB_DB_NAME=kanyakriti_db
```
