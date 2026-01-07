# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run preview  # Preview production build
```

## Environment Setup

Set `GEMINI_API_KEY` in `.env.local` (currently configured but not actively used in the app).

## Architecture

This is a React 19 + TypeScript + Vite task prioritization app based on the Eisenhower Matrix (Urgent/Important quadrants).

### Core Data Flow

1. **Task** (`types.ts`) - Base task with importance (1-10), urgency (1-10), duration, energyLevel, dueDate
2. **ScoredTask** - Task enhanced with computed `score`, `quadrant` (Q1-Q4), `rank`, and `color`
3. **Priority Engine** (`utils/priorityEngine.ts`) - Scores tasks using formula: `(importance * 1.5) + urgency` with a +0.5 bonus for quick wins (<=15 min). Sorts by score, then due date, then energy level (high first), then creation time.

### Quadrant Classification

- Q1 (Do First): importance >= 6 AND urgency >= 6
- Q2 (Schedule): importance >= 6 AND urgency < 6
- Q3 (Delegate): importance < 6 AND urgency >= 6
- Q4 (Eliminate): importance < 6 AND urgency < 6

### Component Structure

- `App.tsx` - Main container with state management, localStorage persistence, import/export
- `components/TaskForm.tsx` - Add/edit task form with importance/urgency sliders
- `components/QuadrantMatrix.tsx` - 2x2 grid visualization of tasks by quadrant
- `components/CalendarView.tsx` - Monthly calendar showing tasks by due date

### State Management

All state lives in `App.tsx` using React hooks. Tasks persist to localStorage under keys `quadrant_tasks` and `quadrant_app_name`.

### Styling

Uses Tailwind CSS with custom color palette: primary teal (#81D8D0), brown accents (#4e342e, #6abcb4). Print styles hide non-essential UI for the printable checklist view.
