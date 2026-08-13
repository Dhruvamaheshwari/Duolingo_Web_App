# Duolingo Web App — SDE Fullstack Assignment

## 1. Project Overview

Build a functional full-stack learning application inspired by the Duolingo learning experience.

The application should reproduce the major interaction patterns of a modern gamified language-learning platform:

* Learning path / skill tree
* Progressive skill unlocking
* Interactive lessons
* Multiple exercise types
* Immediate answer feedback
* Hearts/lives
* XP and streaks
* Daily goal
* Skill completion and progress
* Learner profile and statistics
* Persistent learner state

The implementation must feel polished and cohesive rather than looking like a generic quiz application.

The primary evaluation areas are functionality, UI/UX, architecture, database design, API quality, code quality, modularity, and the ability of the candidate to explain implementation decisions.

---

# 2. Main Objective

Create a small but complete language-learning product containing:

```text
Learner
   ↓
Learning Path
   ↓
Unit
   ↓
Skill
   ↓
Lesson
   ↓
Exercises
   ↓
Answer + Feedback
   ↓
Lesson Completion
   ↓
XP / Streak / Hearts / Progress
```

The application must be immediately usable after setup.

A default seeded learner should already exist so authentication does not become a blocker.

---

# 3. Required Technology Stack

## Frontend

* Next.js
* TypeScript
* React
* Modern CSS / Tailwind CSS or equivalent styling solution

## Backend

Preferred:

* Python
* FastAPI

Django is acceptable, but FastAPI is preferred for a lightweight assignment implementation.

## Database

* SQLite

The database schema must be designed rather than storing application state in static JSON files.

---

# 4. Suggested Repository Structure

```text
project-root/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── db/
│   │   └── main.py
│   ├── seed.py
│   ├── requirements.txt
│   └── ...
│
├── README.md
├── REQUIREMENTS.md
└── .gitignore
```

The exact directory structure may differ slightly, but frontend, backend, database logic, API logic, and reusable UI components should remain clearly separated.

---

# 5. User Model

Authentication may be simplified.

The application may assume a default logged-in learner.

Example seeded learner:

```text
Name: Dhruva
Language: Spanish
```

A full authentication system is not required.

However, learner-specific progress must be persisted in the database.

---

# 6. Learning Path

## 6.1 Path Structure

The main page should display a vertically progressing learning path.

Hierarchy:

```text
Course
 ├── Unit 1
 │    ├── Skill 1
 │    ├── Skill 2
 │    └── Skill 3
 │
 ├── Unit 2
 │    ├── Skill 4
 │    ├── Skill 5
 │    └── Skill 6
 │
 └── Unit 3
```

## 6.2 Skill States

Every skill must support:

### Locked

The learner cannot start the skill.

Visual indication:

* subdued appearance
* lock icon
* reduced emphasis

### Available

The learner can start the skill.

Visual indication:

* prominent interactive skill node
* clear CTA
* visible progress

### In Progress

The learner has started the skill but has not completed it.

Display:

* progress
* current crown / level
* lesson availability

### Completed

The learner has completed the required lesson(s).

Display:

* completed indicator
* XP/progress information
* crown or progress ring

---

# 7. Skill Progress

Each skill should track progress.

Minimum implementation:

```text
0% → Not Started
1-99% → In Progress
100% → Completed
```

Optional crown/level system:

```text
Crown 0
Crown 1
Crown 2
Crown 3
Crown 4
Crown 5
```

The implementation does not need the exact internal mechanics of Duolingo, but the visual concept should be represented.

---

# 8. Top Navigation / Status Bar

The learning screen should contain a persistent status area displaying:

* Streak
* XP
* Hearts
* Gems (mocked)

Example:

```text
🔥 7     ⭐ 430 XP     ❤️ 4     💎 125
```

Values must come from application state/database rather than hardcoded UI values.

---

# 9. Lesson System

## 9.1 Lesson Flow

A lesson contains an ordered sequence of exercises.

Example:

```text
Exercise 1
   ↓
Exercise 2
   ↓
Exercise 3
   ↓
Exercise 4
   ↓
Exercise 5
   ↓
Lesson Complete
```

The learner should be able to:

1. Start a lesson
2. See an exercise
3. Select/type an answer
4. Submit answer
5. Receive immediate feedback
6. Continue to next exercise
7. Lose a heart on an incorrect answer
8. Finish the lesson
9. Receive XP
10. Update skill progress

---

# 10. Required Exercise Types

At least these five exercise types must exist.

## 10.1 Multiple Choice

Example:

```text
Translate:

"Hola"

○ Goodbye
○ Hello
○ Thank you
○ Please
```

Expected behavior:

* selectable options
* submit/check button
* correct/incorrect feedback

---

## 10.2 Word Bank / Tap the Words

Example:

```text
Build the sentence:

[ I ] [ love ] [ learning ] [ Spanish ]
```

The learner constructs an answer using available word chips.

Requirements:

* selectable word tiles
* selected words should move into answer area
* ability to undo/remove selected words
* answer validation

---

## 10.3 Match Pairs

Example:

```text
Hola       → Hello
Gracias    → Thank you
Adiós      → Goodbye
```

Requirements:

* left/right cards
* selecting pairs
* matched cards visually marked
* completion once all pairs are matched

---

## 10.4 Fill in the Blank

Example:

```text
Yo ___ estudiante.

[soy]
```

Requirements:

* text or option based answer
* answer validation
* feedback

---

## 10.5 Type the Answer

Example:

```text
Translate:

"Good morning"

________________
```

Requirements:

* text input
* submit button
* answer normalization
* correct/incorrect evaluation

Basic normalization may include:

* lowercase comparison
* trimming whitespace
* ignoring unnecessary punctuation

---

# 11. Exercise Feedback

Every submitted answer must immediately show a feedback state.

## Correct

Show:

* positive state
* explanation / accepted answer if useful
* Continue button

## Incorrect

Show:

* incorrect state
* expected answer
* Continue button
* heart reduction

The feedback should feel like a lesson interaction rather than a browser alert.

---

# 12. Lesson Progress

Display progress throughout a lesson.

Example:

```text
████████░░░░░░  5 / 10
```

The progress indicator must update after each exercise.

---

# 13. Hearts System

The learner starts with a limited number of hearts.

Example:

```text
❤️ ❤️ ❤️ ❤️ ❤️
```

Default:

```text
5 hearts
```

Whenever the learner answers incorrectly:

```text
hearts = hearts - 1
```

When hearts reach zero, the lesson should not continue normally.

Display an out-of-hearts state.

Possible actions:

```text
Practice to refill
Refill hearts
Return to path
```

These actions can be mocked.

---

# 14. Heart Regeneration

The assignment allows mocked regeneration.

A reasonable implementation is:

* heart regeneration based on elapsed time
* or a "Practice" button that restores one/more hearts

The mechanism must persist after refreshing the application.

---

# 15. XP System

Learners earn XP when lessons are successfully completed.

Example:

```text
Lesson XP = 10
```

XP must be persisted.

Example:

```text
Before:
XP = 230

Lesson completed:
+10 XP

After:
XP = 240
```

Avoid directly modifying frontend-only state without synchronizing the backend.

---

# 16. Streak System

The learner has a daily streak.

Example:

```text
🔥 7 day streak
```

The system should support:

* current streak
* last activity date

Suggested logic:

### Same Day

No streak change.

### Consecutive Day

```text
streak += 1
```

### Missed Day

Reset or recalculate streak according to the chosen implementation.

The exact logic should be isolated inside backend/business logic so it can be tested independently.

The assignment allows simulated/testable day logic.

---

# 17. Daily Goal

Display a daily XP goal.

Example:

```text
Daily Goal

30 / 50 XP
██████████░░░░░
```

The goal can reset according to the current date.

A learner should be able to see whether today's target has been achieved.

---

# 18. Leaderboard

Implement a simple seeded leaderboard.

Example:

```text
1. Alex       540 XP
2. Sarah      510 XP
3. Dhruva     430 XP
4. Rahul      390 XP
```

Full social functionality is not required.

Seeded users are sufficient.

The leaderboard should preferably be backed by database data rather than a hardcoded frontend array.

---

# 19. Learner Profile

Create a profile/statistics page.

Display:

* learner name
* total XP
* streak
* completed skills
* completed lessons
* achievements if implemented
* current course

Example:

```text
Dhruva

🔥 7 Day Streak
⭐ 430 XP

Lessons Completed: 12
Skills Completed: 4
```

---

# 20. Achievements

Optional but recommended.

Examples:

```text
🔥 7 Day Streak
⭐ 500 XP
🎯 Completed 5 Skills
🏆 Finished First Lesson
```

Achievements should be data-driven when implemented.

---

# 21. Course Content

The database must contain seeded course content.

Minimum:

```text
1 course
3 units
6+ skills
multiple lessons
multiple exercises
```

Each lesson should contain varied exercise types.

Recommended seed structure:

```text
Course: Spanish

Unit 1: Basics
    Skill: Greetings
    Skill: Introductions

Unit 2: Food
    Skill: Food Basics
    Skill: Drinks

Unit 3: Everyday Life
    Skill: Family
    Skill: Daily Activities
```

A smaller implementation is acceptable as long as the entire lesson workflow is demonstrable.

---

# 22. Database Requirements

The database should model relationships properly.

Recommended conceptual schema:

```text
User
Course
Unit
Skill
Lesson
Exercise
UserSkillProgress
UserLessonProgress
UserStats
LeaderboardEntry
Achievement
UserAchievement
```

Possible relationship graph:

```text
Course
  └── Unit
       └── Skill
            └── Lesson
                 └── Exercise

User
 ├── UserStats
 ├── UserSkillProgress
 ├── UserLessonProgress
 └── UserAchievement
```

---

# 23. Suggested Database Tables

## users

```text
id
name
email
created_at
```

## courses

```text
id
name
language
description
```

## units

```text
id
course_id
title
description
position
```

## skills

```text
id
unit_id
title
description
position
xp_reward
```

## lessons

```text
id
skill_id
title
position
```

## exercises

```text
id
lesson_id
type
question
answer
options
metadata
position
```

`type` may be:

```text
multiple_choice
word_bank
match_pairs
fill_blank
type_answer
```

## user_stats

```text
id
user_id
total_xp
current_streak
last_activity_date
hearts
daily_xp
daily_goal
updated_at
```

## user_skill_progress

```text
id
user_id
skill_id
progress
crown_level
completed
updated_at
```

## user_lesson_progress

```text
id
user_id
lesson_id
completed
attempts
best_score
completed_at
```

## leaderboard_entries

Can either be derived from users/user_stats or implemented as a separate table if there is a clear reason.

---

# 24. API Requirements

Backend APIs should be REST-based.

Example endpoints:

## User

```http
GET /api/user
GET /api/user/stats
```

## Course

```http
GET /api/course
GET /api/course/path
GET /api/units
GET /api/skills/{skill_id}
```

## Lesson

```http
GET /api/lessons/{lesson_id}
POST /api/lessons/{lesson_id}/start
POST /api/lessons/{lesson_id}/complete
```

## Exercise

A separate exercise endpoint is optional.

The lesson payload can contain the required exercise sequence.

## Progress

```http
GET /api/progress
POST /api/progress/skill
POST /api/progress/lesson
```

## Hearts

```http
GET /api/hearts
POST /api/hearts/refill
```

## Leaderboard

```http
GET /api/leaderboard
```

The exact routes can differ, but APIs should be logically organized.

---

# 25. Backend Architecture

Prefer separation similar to:

```text
API Route
   ↓
Schema Validation
   ↓
Service / Business Logic
   ↓
Repository / Database
```

Business rules such as:

* streak calculation
* XP reward
* heart loss
* skill unlocking
* lesson completion

should not live directly inside route handlers whenever practical.

---

# 26. Frontend Architecture

The frontend should use reusable components.

Possible components:

```text
TopStatsBar
LearningPath
UnitSection
SkillNode
ProgressRing
LessonHeader
ExerciseRenderer
MultipleChoiceExercise
WordBankExercise
MatchPairsExercise
FillBlankExercise
TypeAnswerExercise
FeedbackBar
HeartIndicator
LessonCompleteModal
OutOfHeartsModal
DailyGoalCard
Leaderboard
ProfileStats
```

A central exercise renderer may use:

```text
exercise.type
```

to select the correct exercise component.

Example:

```text
ExerciseRenderer
   ├── MultipleChoiceExercise
   ├── WordBankExercise
   ├── MatchPairsExercise
   ├── FillBlankExercise
   └── TypeAnswerExercise
```

---

# 27. Frontend State Management

Do not put the entire application state into one giant React component.

Separate concerns such as:

```text
lesson state
user stats
exercise state
feedback state
UI modal state
```

Context, hooks, or a lightweight state library may be used where appropriate.

Do not introduce a state-management library simply for the sake of using one.

---

# 28. UI / UX Expectations

The application should have a playful, modern, gamified visual language.

Important characteristics:

* rounded cards
* friendly typography
* strong hierarchy
* bright accents
* clear CTAs
* animated transitions
* progress indicators
* large touch-friendly answer controls
* celebratory completion states
* consistent spacing
* clear feedback

The result should feel like a polished language-learning product, not a raw CRUD application.

---

# 29. Important Design Constraint

Do not simply copy an existing open-source implementation.

The implementation must be written specifically for this assignment.

The visual direction can be inspired by the Duolingo experience, but code, structure, seeded content, and implementation should be original.

---

# 30. Animation

Use animation selectively.

Recommended:

* skill unlock animation
* answer selection transitions
* correct answer feedback
* incorrect answer feedback
* progress bar transition
* lesson completion celebration
* modal entrance/exit
* heart loss animation

Animations should enhance interaction rather than make the interface distracting.

---

# 31. Responsive Design

Bonus feature.

The application should work reasonably on:

```text
Desktop
Tablet
Mobile
```

Desktop is the primary evaluation target, but mobile layouts should not completely break.

---

# 32. Loading / Error States

Every backend-driven page should consider:

### Loading

Show a skeleton, spinner, or placeholder.

### Empty

Display a meaningful empty state.

### Error

Show a user-friendly error message and retry option when appropriate.

Avoid uncaught errors appearing directly in the UI.

---

# 33. Persistence Requirements

Refreshing the browser must not reset:

* XP
* streak
* hearts
* completed lessons
* skill progress
* achievements

These values must persist in SQLite through backend APIs.

---

# 34. Lesson Completion Rules

A lesson should only be marked completed when:

```text
all required exercises are completed
AND
learner still has a valid completion state
```

Upon completion:

```text
award XP
update skill progress
update learner statistics
update streak
update daily XP
record lesson completion
```

These operations should preferably happen in one backend transaction.

---

# 35. Skill Unlocking

Basic progression:

```text
Skill 1 → unlocked
Skill 2 → locked

Complete Skill 1

Skill 2 → unlocked
```

The unlocking rule should be deterministic and database-backed.

A reasonable implementation:

```text
Skill N is available when previous required skill is completed.
```

---

# 36. Seed Data

The project must include a seed command.

Example:

```bash
python seed.py
```

or:

```bash
python -m app.seed
```

Seed should create:

* default learner
* course
* units
* skills
* lessons
* exercises
* leaderboard users
* initial progress

Running seed repeatedly should either be idempotent or clearly documented.

---

# 37. README Requirements

README must contain:

## Project Overview

What the application does.

## Tech Stack

Frontend, backend, database.

## Architecture

High-level diagram.

## Setup

Frontend installation.

Backend installation.

Database initialization.

Seed instructions.

Development commands.

## API Overview

Important endpoints.

## Database Schema

Tables and relationships.

## Assumptions

For example:

* authentication simplified
* gems mocked
* one language seeded
* audio optional

## Deployment

Explain how frontend and backend are deployed.

---

# 38. Testing Expectations

At minimum test critical business rules.

Recommended tests:

```text
streak calculation
heart decrement
heart refill
XP awarding
skill unlocking
lesson completion
answer evaluation
```

Frontend interaction tests are optional but recommended.

---

# 39. Code Quality Requirements

Code should look like production-quality student/engineer work.

Requirements:

* meaningful variable names
* small functions
* reusable components
* consistent formatting
* no massive files
* no unnecessary abstractions
* no duplicated business logic
* clear types
* proper API error handling
* sensible comments only where useful

Avoid comments such as:

```text
// This function increments XP
```

when the code is already self-explanatory.

Comments should explain non-obvious decisions rather than obvious syntax.

---

# 40. AI Usage Requirement

AI tools are allowed.

However, the final implementation must be understandable by the developer submitting it.

The developer should be able to explain:

* database relationships
* API design
* state management
* lesson engine
* exercise rendering
* answer validation
* XP calculation
* heart logic
* streak calculation
* skill unlocking
* deployment architecture

---

# 41. Deployment

The project must have a hosted version.

Potential platforms:

```text
Frontend:
Vercel / Netlify

Backend:
Render / Railway / other suitable service
```

SQLite deployment should be handled carefully because many hosted environments use ephemeral filesystems.

If SQLite persistence cannot be guaranteed by the selected hosting architecture, document the limitation and choose an appropriate deployment strategy.

---

# 42. Suggested Development Milestones

## Phase 1

Project setup and architecture.

## Phase 2

Database schema and seed data.

## Phase 3

Backend course/path APIs.

## Phase 4

Learning path UI.

## Phase 5

Lesson engine.

## Phase 6

Exercise components.

## Phase 7

XP, hearts, streaks, and persistence.

## Phase 8

Profile and leaderboard.

## Phase 9

Visual polish and animation.

## Phase 10

Testing and deployment.

---

# 43. Definition of Done

The assignment is considered complete when a reviewer can:

1. Open the deployed application.
2. See a seeded learner.
3. See a learning path.
4. Identify locked and unlocked skills.
5. Start an available lesson.
6. Complete multiple exercise types.
7. Receive immediate feedback.
8. Lose hearts on incorrect answers.
9. Finish a lesson.
10. Receive XP.
11. See skill progress change.
12. See streak/daily progress update.
13. Refresh the browser and retain progress.
14. Open learner profile.
15. View leaderboard.
16. Run the project locally using README instructions.
17. Inspect a sensible database schema.
18. Understand the frontend/backend separation.
19. Understand the main business logic.

---

# 44. Priority Order

When time is limited, implement in this order:

```text
P0 — Must work
Learning Path
Lesson Flow
Exercise Types
Feedback
Hearts
XP
Progress Persistence
Database
Backend APIs

P1 — Important polish
Streak
Daily Goal
Profile
Leaderboard
Animations
Error/Loading States

P2 — Bonus
Achievements
Audio
Dark Mode
Responsive Refinement
Legendary/Timed Mode
```

Do not sacrifice P0 functionality for bonus features.

---

# 45. Engineering Principle

Prefer:

```text
simple + explicit + maintainable
```

over:

```text
clever + over-engineered + difficult to explain
```

The goal is not to maximize the number of libraries or abstractions.

The goal is to deliver a small, complete, polished product that behaves correctly.
