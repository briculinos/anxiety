# Calm Companion - Technical Documentation

## Project Overview

**Calm Companion** is a mobile-first PWA for anxiety management. It provides guided coping exercises, AI-powered support, and personal tracking - all with privacy-first local storage.

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
| Animations | Framer Motion |
| PWA | vite-plugin-pwa |

---

## AI Agents Architecture

The app uses a **multi-agent system** with specialized roles. Agents are in `src/agents/`.

### 1. Triage Agent (`src/agents/gemini.ts` → `triageUser`)

**Purpose**: Classify user state and route to appropriate intervention.

**Input**:
- Intensity (0-10)
- Symptoms array
- Triggers array
- Optional user message

**Output**:
```typescript
{
  severity: 'mild' | 'moderate' | 'severe' | 'crisis',
  suggestedFlow: string,
  isCrisis: boolean,
  isMedicalConcern: boolean,
  reasoning?: string
}
```

**Safety First**: Before calling Gemini, it runs local keyword detection for crisis terms. This is faster and more reliable than LLM for safety-critical detection.

**Fallback**: If Gemini fails, uses rule-based assessment based on intensity.

---

### 2. Insight Agent (`src/agents/gemini.ts` → `generateWeeklyInsight`)

**Purpose**: Generate personalized weekly insights from episode data.

**Input**:
- Episode array (last 7 days)
- Top triggers with counts
- Top tools with helpfulness ratings

**Output**:
```typescript
{
  insight: string,   // Encouraging observation about patterns
  experiment: string // One tiny, specific thing to try
}
```

**Guidelines**:
- Warm, non-judgmental tone
- Focus on what's working
- Experiments must be small and actionable
- Never diagnose

---

### 3. Reframe Agent (`src/agents/gemini.ts` → `generateReframe`)

**Purpose**: Help users reframe anxious thoughts (gentle CBT).

**Input**:
- Situation description
- Automatic thought
- Emotion felt

**Output**:
```typescript
{
  validation: string,     // Validates their feeling first
  balancedThought: string // More balanced alternative
}
```

**Key Principle**: Never says thoughts are "wrong" - offers gentler perspective.

---

### 4. Next Step Suggester (`src/agents/gemini.ts` → `suggestNextStep`)

**Purpose**: Suggest what to do after using coping tools.

**Note**: This is rule-based (no API call) for speed and reliability.

---

## Safety System

Located in `src/utils/safety.ts`.

### Crisis Detection

**Keywords that trigger crisis screen**:
- suicide, suicidal, kill myself, end my life
- self-harm, hurt myself, cutting
- can't go on, hopeless, no reason to live

**Medical concern keywords**:
- chest pain, heart attack, can't breathe
- passing out, fainting, severe pain

### Safety Events Logging

Minimal data stored for safety events:
```typescript
{
  id: string,
  timestamp: Date,
  type: 'crisis_detected' | 'medical_warning' | 'crisis_screen_shown',
  actionTaken: string
  // No raw text stored for privacy
}
```

### Crisis Screen (`src/components/CrisisScreen.tsx`)

Shows:
- 988 Suicide & Crisis Lifeline (US)
- Crisis Text Line (text HOME to 741741)
- 911 for emergencies
- "I'm safe" button to return

---

## Features & Components

### Home Page Flow (`src/pages/Home.tsx`)

```
[Home] → [Intensity] → [Symptoms] → [Tools] → [Complete]
           ↓
      (if crisis detected)
           ↓
    [Crisis Screen]
```

**State Machine** (managed by `flowStep` state):
1. `home` - Shows panic button
2. `intensity` - Slider 0-10
3. `symptoms` - Optional symptom/trigger selection
4. `tools` - List of coping tools
5. `complete` - Success message

---

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

**Common Props**:
```typescript
interface ExerciseProps {
  onComplete: () => void  // Called when exercise finishes
  onCancel: () => void    // Called when user exits early
}
```

---

### Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `src/pages/Home.tsx` | Main flow, panic button |
| Toolbox | `src/pages/Toolbox.tsx` | Personal coping items |
| Reflect | `src/pages/Reflect.tsx` | View past episodes, thoughts |
| Progress | `src/pages/Progress.tsx` | Weekly stats, insights |

---

### Data Models (`src/types/index.ts`)

**Episode** - Records each anxiety event:
```typescript
interface Episode {
  id: string
  timestamp: Date
  intensity: number        // 0-10
  durationMinutes?: number
  triggers: string[]
  symptoms: string[]
  toolsUsed: string[]
  helpfulRating?: number   // 1-5
  notes?: string
}
```

**ToolboxItem** - Personal coping tools:
```typescript
interface ToolboxItem {
  id: string
  type: 'mantra' | 'memory' | 'playlist' | 'technique'
  title: string
  content: string
  url?: string
  isFavorite: boolean
  usageCount: number
}
```

**ThoughtRecord** - CBT journal entries:
```typescript
interface ThoughtRecord {
  id: string
  timestamp: Date
  situation: string
  automaticThought: string
  emotion: string
  emotionIntensity: number
  balancedThought?: string
}
```

---

## Database (`src/db/index.ts`)

Uses **Dexie.js** for IndexedDB access.

**Tables**:
- `episodes` - Anxiety episode logs
- `userProfile` - Preferences
- `safetyEvents` - Crisis event logs (minimal)
- `postponedWorries` - Scheduled worries
- `toolboxItems` - Personal tools
- `thoughtRecords` - CBT journal
- `weeklyInsights` - Generated insights

**Key Functions**:
```typescript
logEpisode(episode)           // Save new episode
getRecentEpisodes(days)       // Get episodes from last N days
getWeeklyStats()              // Aggregate stats for Progress page
addPostponedWorry(worry, scheduledFor)
saveThoughtRecord(record)
```

---

## State Management (`src/stores/appStore.ts`)

Global state via **Zustand**:

```typescript
interface AppState {
  flowState: FlowState           // Current flow step
  currentSeverity: Severity      // From triage
  currentEpisode: CurrentEpisode // Active episode being tracked
  activeBreathing: BreathingType // Which breathing exercise
  showCrisisScreen: boolean      // Crisis modal visible
  activeTab: 'home' | 'toolbox' | 'reflect' | 'progress'
  hapticEnabled: boolean
  soundEnabled: boolean
}
```

**Helper Hook**:
```typescript
const haptic = useHaptic()
haptic.light()   // 10ms vibration
haptic.medium()  // 25ms vibration
haptic.heavy()   // 50ms vibration
```

---

## File Structure

```
src/
├── agents/
│   └── gemini.ts          # All Gemini API interactions
├── components/
│   ├── common/            # Button, Card, Chip, IntensitySlider, Navigation
│   ├── breathing/         # BoxBreathing, PacedBreathing, PhysiologicalSigh
│   ├── grounding/         # FiveFourThreeGrounding
│   ├── exercises/         # MuscleRelaxation, WorryPostponement, ThoughtHelper
│   └── CrisisScreen.tsx
├── db/
│   └── index.ts           # Dexie database + helper functions
├── pages/
│   ├── Home.tsx
│   ├── Toolbox.tsx
│   ├── Reflect.tsx
│   └── Progress.tsx
├── stores/
│   └── appStore.ts        # Zustand global state
├── types/
│   └── index.ts           # TypeScript interfaces
├── utils/
│   └── safety.ts          # Crisis detection, emergency resources
├── App.tsx
├── main.tsx
└── index.css              # Tailwind + custom styles
```

---

## Configuration

### Gemini API Key

Currently hardcoded in `src/agents/gemini.ts`:
```typescript
const genAI = new GoogleGenerativeAI('AIzaSyCIN_STz1D2N2-sDzTj_Sqp4lDuy1bI6Dg')
```

**TODO**: Move to environment variable for production.

### PWA Config

In `vite.config.ts`:
- App name: "Calm Companion"
- Theme color: #6366f1 (indigo)
- Background: #0f172a (slate-900)

---

## Running the App

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## What's Next (V1 Features)

These features are planned but not yet implemented:

1. **Personalized "If X → do Y"** - Learn from usage patterns
2. **Exposure Planning Assistant** - Graded exposure ladders (optional)
3. **Partner Mode** - Support scripts for helpers
4. **Audio Guidance** - Voiced breathing instructions
5. **Cloud Sync** - Optional backup (opt-in only)
6. **Onboarding Flow** - First-time user setup
7. **Settings Page** - Configure emergency contacts, preferences

---

## Design Decisions

1. **No free-form LLM chat during crisis** - Structured flows with buttons only
2. **Local-first storage** - Privacy is non-negotiable for mental health data
3. **Pre-written clinical content** - LLM personalizes, doesn't generate scripts
4. **PWA over native** - Faster iteration, works on both platforms
5. **Minimal friction UX** - Big buttons, few steps, auto-save everything

---

## Testing with Users

When testing with your wife and brother-in-law:

**Metrics to track**:
- "Did intensity drop within 5 minutes?"
- "Would you use it next time?"
- "Which step felt annoying/too slow?"

**A/B test ideas**:
- Different breathing pacing (slow vs fast)
- Different wording on prompts
- Order of exercise recommendations

---

## Troubleshooting

**Build fails with TypeScript errors**:
```bash
npx tsc --noEmit
```

**Dexie database issues**:
Clear IndexedDB in browser dev tools → Application → Storage → IndexedDB

**Gemini API errors**:
Check API key, quota limits, network connectivity. App has fallbacks for all AI calls.

---

*Last updated: December 2024*
*Built with Claude Code*
