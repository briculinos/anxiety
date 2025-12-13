# Calm Companion - Technical Documentation

## Project Overview

**Calm Companion** is a mobile-first PWA for anxiety management. It provides guided coping exercises, AI-powered support, and personal tracking - all with privacy-first local storage.

**Live URL**: https://anxiety-away.vercel.app

**GitHub**: https://github.com/briculinos/anxiety

**Target Users**: People experiencing anxiety (initially your wife and brother-in-law)

**Core Philosophy**:
- During crisis: Fast relief, structured flows, no open-ended chat
- After crisis: Reflection and pattern recognition
- Between episodes: Build resilience through tracking

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | Dexie.js (IndexedDB wrapper) |
| AI | Google Gemini API |
| Backend | Vercel Serverless Functions |
| Animations | Framer Motion |
| PWA | vite-plugin-pwa |
| Hosting | Vercel (auto-deploy from GitHub) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React PWA)                     │
│  - All UI/UX components                                      │
│  - Coping exercises (breathing, grounding, etc.)             │
│  - Local storage (IndexedDB via Dexie)                       │
│  - Calls /api/* endpoints                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Vercel Serverless)                  │
│  /api/triage.ts   - Classify anxiety severity                │
│  /api/reframe.ts  - Generate CBT reframes                    │
│  /api/insights.ts - Generate weekly insights                 │
│                                                              │
│  Environment Variable: GEMINI_API_KEY (secure)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Gemini API                         │
│  Model: gemini-1.5-flash                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend API Endpoints

Located in `/api/` folder. These are Vercel serverless functions.

### POST /api/triage

Classifies user anxiety state and suggests intervention.

**Request:**
```json
{
  "intensity": 7,
  "symptoms": ["Racing heart", "Tight chest"],
  "triggers": ["Work"],
  "userMessage": "optional text"
}
```

**Response:**
```json
{
  "severity": "severe",
  "suggestedFlow": "stabilize",
  "isCrisis": false,
  "isMedicalConcern": false,
  "reasoning": "High intensity with physical symptoms"
}
```

### POST /api/reframe

Generates CBT-style thought reframe.

**Request:**
```json
{
  "situation": "Presentation tomorrow",
  "automaticThought": "I'll fail and everyone will judge me",
  "emotion": "Anxious"
}
```

**Response:**
```json
{
  "validation": "It makes sense to feel anxious about presentations.",
  "balancedThought": "You've prepared well, and even if it's not perfect, one presentation doesn't define you."
}
```

### POST /api/insights

Generates weekly insights from episode data.

**Request:**
```json
{
  "episodeCount": 5,
  "avgIntensity": "6.2",
  "topTriggers": [{"trigger": "Work", "count": 3}],
  "topTools": [{"tool": "Box breathing", "count": 4, "avgHelpfulness": 4.2}]
}
```

**Response:**
```json
{
  "insight": "Box breathing seems to be your go-to tool, and it's working well for you.",
  "experiment": "Try using it before stressful meetings, not just during anxiety."
}
```

---

## AI Agents (Frontend)

Located in `src/agents/gemini.ts`. These call the backend API.

### triageUser()
- Checks for crisis keywords locally first (faster, safer)
- Calls `/api/triage` for AI assessment
- Falls back to rule-based if API fails

### generateReframe()
- Calls `/api/reframe`
- Falls back to generic CBT prompts if API fails

### generateWeeklyInsight()
- Calls `/api/insights`
- Falls back to simple stats summary if API fails

### suggestNextStep()
- Rule-based only (no API call)
- Fast suggestions based on current state

---

## Safety System

Located in `src/utils/safety.ts`.

### Crisis Detection (Local - No API)

**Keywords that trigger crisis screen:**
- suicide, suicidal, kill myself, end my life
- self-harm, hurt myself, cutting
- can't go on, hopeless, no reason to live

**Medical concern keywords:**
- chest pain, heart attack, can't breathe
- passing out, fainting, severe pain

### Crisis Screen (`src/components/CrisisScreen.tsx`)

Shows:
- 988 Suicide & Crisis Lifeline (US)
- Crisis Text Line (text HOME to 741741)
- 911 for emergencies
- "I'm safe" button to return

---

## Navigation Flow

```
[Home] ←──────────────────────────────────────┐
   │                                          │
   ▼                                          │
[Intensity] ──X (cancel)──────────────────────┤
   │                                          │
   ▼                                          │
[Symptoms] ──← (back to intensity)            │
   │                                          │
   ▼                                          │
[Tools] ──← (back to symptoms)                │
   │                                          │
   ▼                                          │
[Exercise] ──X (cancel, back to tools)        │
   │                                          │
   ▼                                          │
[Complete] ───(auto-redirect after 3s)────────┘
```

**Navigation buttons:**
- X button: Cancel flow, return to home
- ← button: Go back one step
- All exercises have X button to cancel

---

## Features & Components

### Coping Exercises

| Exercise | File | Duration | Description |
|----------|------|----------|-------------|
| Box Breathing | `src/components/breathing/BoxBreathing.tsx` | 4 cycles | 4-4-4-4 pattern |
| Paced Breathing | `src/components/breathing/PacedBreathing.tsx` | 6 cycles | 4s in, 6s out |
| Physiological Sigh | `src/components/breathing/PhysiologicalSigh.tsx` | 3 cycles | Double inhale + long exhale |
| 5-4-3-2-1 Grounding | `src/components/grounding/FiveFourThreeGrounding.tsx` | ~2 min | Sensory awareness |
| Muscle Relaxation | `src/components/exercises/MuscleRelaxation.tsx` | ~3 min | Tense/release |
| Worry Postponement | `src/components/exercises/WorryPostponement.tsx` | - | Save worry for later |
| Thought Helper | `src/components/exercises/ThoughtHelper.tsx` | - | CBT reframing |

### Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `src/pages/Home.tsx` | Main flow, panic button |
| Toolbox | `src/pages/Toolbox.tsx` | Personal coping items |
| Reflect | `src/pages/Reflect.tsx` | View past episodes, thoughts |
| Progress | `src/pages/Progress.tsx` | Weekly stats, insights |

---

## File Structure

```
anxiety/
├── api/                       # Vercel serverless functions
│   ├── triage.ts              # Severity classification
│   ├── reframe.ts             # CBT thought reframing
│   └── insights.ts            # Weekly insights generation
├── src/
│   ├── agents/
│   │   └── gemini.ts          # Frontend API calls
│   ├── components/
│   │   ├── common/            # Button, Card, Chip, etc.
│   │   ├── breathing/         # Breathing exercises
│   │   ├── grounding/         # Grounding exercises
│   │   ├── exercises/         # Other exercises
│   │   └── CrisisScreen.tsx
│   ├── db/
│   │   └── index.ts           # Dexie database
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Toolbox.tsx
│   │   ├── Reflect.tsx
│   │   └── Progress.tsx
│   ├── stores/
│   │   └── appStore.ts        # Zustand state
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── utils/
│   │   └── safety.ts          # Crisis detection
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example               # Template for env vars
├── .env.local                 # Local env vars (gitignored)
├── vercel.json                # Vercel config
└── package.json
```

---

## Environment Variables

### Local Development
Create `.env.local`:
```
GEMINI_API_KEY=your_key_here
```

### Production (Vercel)
Set in Vercel Dashboard → Settings → Environment Variables:
- `GEMINI_API_KEY` = your Gemini API key

---

## Deployment

### Auto-Deploy Setup
1. Code is on GitHub: `briculinos/anxiety`
2. Vercel watches the `main` branch
3. Every `git push` triggers auto-deploy
4. Live at: https://anxiety-away.vercel.app

### Manual Deploy
```bash
npm run build
vercel --prod
```

### Development
```bash
npm run dev
# Opens at http://localhost:5173
```

---

## What's Next (V1 Features)

- [ ] Onboarding flow for first-time users
- [ ] Settings page (emergency contacts, preferences)
- [ ] Audio guidance for breathing exercises
- [ ] Personalized "If X → do Y" suggestions
- [ ] Partner mode (support scripts for helpers)
- [ ] Exposure planning assistant
- [ ] Cloud sync (opt-in only)

---

## Design System

### Color Palette (Warm Theme)

The app uses a warm, calming color palette designed to reduce anxiety:

| Token | Hex | Usage |
|-------|-----|-------|
| warm-50 | #FFF8F0 | Main background (cream) |
| warm-100 | #FEF3E2 | Cards, inputs (soft peach) |
| warm-200 | #FDE7C7 | Borders, disabled states |
| warm-300 | #F2CC8F | Highlights, accents (soft gold) |
| warm-400 | #E9B97A | Warm gold accents |
| warm-500 | #E07A5F | Primary actions (warm coral) |
| warm-600 | #C96A52 | Hover states |
| warm-700 | #81B29A | Success/complete (sage green) |
| warm-800 | #6B9A85 | Darker sage |
| warm-900 | #3D405B | Text (warm dark blue-gray) |

### Component Patterns

- **Backgrounds**: `bg-warm-50` for pages, `bg-warm-100` for cards
- **Text**: `text-warm-900` primary, `text-warm-900/60` secondary
- **Buttons**: `bg-warm-500` primary, `bg-warm-100` secondary
- **Progress bars**: `from-warm-500 to-warm-400` gradient
- **Success states**: `bg-warm-700/20` with `text-warm-700`

---

## Changelog

### December 2024 - UX Improvements (Phase 4)
- **Background sounds**: App-wide ambient sound system
  - 4 sound options: Ocean Waves, Rain, Forest, Meditation
  - Floating control button (bottom-right)
  - Volume control slider
  - Bilingual labels (Romanian/English)
  - Auto-loops, remembers selection
  - New files: `src/hooks/useAmbientSound.ts`, `src/components/common/SoundControl.tsx`

### December 2024 - UX Improvements (Phase 3)
- **Mantras page**: Dedicated section for calming mantras
  - 12 pre-loaded mantras in Romanian and English
  - Swipe navigation between mantras
  - Random mantra button
  - Favorites system (saved to localStorage)
  - New tab in navigation (Sparkles icon)
  - New files: `src/pages/Mantras.tsx`, `src/utils/defaultMantras.ts`

### December 2024 - UX Improvements (Phase 2)
- **Encouraging messages**: Added motivational messages during exercises
  - Auto-detects device language (Romanian or English)
  - Messages: "Bravo!", "Foarte bine!", "Mai poți!" / "Great!", "Keep going!", "Almost there!"
  - Shows encouragement on cycle/step completion
  - New files: `src/utils/language.ts`, `src/components/common/Encouragement.tsx`

### December 2024 - UX Improvements (Phase 1)
- **Warm calming theme**: Replaced dark slate theme with warm cream/coral colors
  - New color palette: cream background, coral accents, sage green for success
  - All components updated: breathing exercises, grounding, exercises, pages
  - Improved readability and soothing visual experience
- Based on user testing feedback ("E plictiseală!" - It's boring!)

### December 2024 - Initial Release
- Full MVP with all coping exercises
- AI-powered triage, reframing, and insights
- Crisis detection and safety screen
- Local-first storage with IndexedDB
- PWA installable on mobile
- Secure backend API (API key not exposed)
- Back button navigation in flow

---

## Troubleshooting

**API not working:**
- Check Vercel environment variable `GEMINI_API_KEY` is set
- Check Vercel function logs for errors

**Build fails:**
```bash
npx tsc --noEmit  # Check TypeScript errors
```

**Database issues:**
Clear IndexedDB: Browser DevTools → Application → Storage → IndexedDB → Delete

**PWA not updating:**
Clear service worker: Browser DevTools → Application → Service Workers → Unregister

---

*Last updated: December 2024*
*Built with Claude Code*
