# Flashcard App

A simple CLI flashcard quiz app with user tracking, card management, and quiz stats.

## How to play

```bash
npx tsx generate-cards.ts   # generate 100 cards into data/cards.json (run once)
npx tsx generate-deck.ts    # create the "All Cards" deck (run once)
npx tsx quiz.ts              # play the quiz
```

Type `q` or `quit` at any answer prompt to exit early and see your score.

---

## TO DO LIST -- Agent to write below

### 1. User CRUD
- [x] Define `User` model: `unique_id`, `name`, `create_date`, `num_sessions`
- [x] Implement `createUser(name)` → generates unique_id, sets create_date, num_sessions=0
- [x] Implement `readUser(unique_id)` → returns User or null
- [x] Implement `updateUser(unique_id, fields)` → partial update (name, num_sessions)
- [x] Implement `deleteUser(unique_id)` → removes user from store
- [x] Implement `listUsers()` → returns all users
- [x] Persist users to `data/users.json`
- [x] Write tests for User CRUD operations

### 2. Card Store CRUD
- [x] Define `Card` model: `unique_id`, `question`, `answers` (string[]), `version_id`
- [x] Implement `createCard(question, answers)` → generates unique_id, version_id=1
- [x] Implement `readCard(unique_id)` → returns Card or null
- [x] Implement `updateCard(unique_id, fields)` → updates question/answers, increments version_id
- [x] Implement `deleteCard(unique_id)` → removes card from store
- [x] Implement `listCards()` → returns all cards
- [x] Persist cards to `data/cards.json`
- [x] Write tests for Card CRUD operations

### 3. Deck CRUD
- [x] Define `Deck` model: `unique_id`, `name`, `card_ids` (string[]), `card_count`, `version_id`
- [x] Implement `createDeck(name, card_ids)` → generates unique_id, sets card_count, version_id=1
- [x] Implement `readDeck(unique_id)` → returns Deck or null
- [x] Implement `updateDeck(unique_id, fields)` → update name/card_ids, recalculate card_count, increment version_id
- [x] Implement `deleteDeck(unique_id)` → removes deck from store
- [x] Implement `listDecks()` → returns all decks
- [x] Persist decks to `data/decks.json`
- [x] Write tests for Deck CRUD operations

### 4. Card Stats
- [x] Define `CardStats` model: `user_id`, `card_id`, `impressions`, `correct_count`, `first_impression` (ISO date), `last_impression` (ISO date), `last_n_correct` (number), `last_n_incorrect` (number)
- [x] Implement `getCardStats(user_id, card_id)` → returns stats or default zeros
- [x] Implement `recordImpression(user_id, card_id, correct: boolean)` → updates all metrics
- [x] Implement `getUserStats(user_id)` → returns all card stats for a user
- [x] Persist stats to `data/card-stats.json`
- [x] Write tests for Card Stats operations

### 5. Quiz CRUD (consolidated — replaces "Game Table")
- [x] Define `Quiz` model: `id`, `user_id`, `deck_id`, `start_time` (ISO), `time_length` (seconds), `correct_count`, `incorrect_count`, `mode` ("sequential" | "random")
- [x] Implement `createQuiz(user_id, deck_id, mode)` → starts a new quiz
- [x] Implement `finishQuiz(quiz_id, correct_count, incorrect_count, time_length)` → saves final results
- [x] Implement `getQuizHistory(user_id)` → returns all quizzes for a user
- [x] Persist quizzes to `data/quizzes.json`
- [x] Write tests for Quiz operations

### 6. Session & Quiz Orchestration

#### 6a. Session Model
- [x] Define `Session` model: `id`, `user_id`, `start_time` (ISO), `quiz_ids` (string[])
- [x] Implement `createSession(user_id)` → starts a new session
- [x] Implement `addQuizToSession(session_id, quiz_id)` → appends quiz to session
- [x] Persist sessions to `data/sessions.json`

#### 6b. Login Flow
- [x] On app start, check for last logged-in user (persist `last_user_id` in `data/app-state.json`)
- [x] If found, display "Welcome back, <username>!" with option to "login as someone else"
- [x] If "login as someone else" or no last user: prompt for existing user (by name) or create new
- [x] After login, create a new Session for this user
- [x] Increment user's `num_sessions`

#### 6c. Deck Selection
- [x] Show "Resume" option with last 5 decks played (from user's quiz history)
- [x] Show "Search decks" option — search by deck name (substring match)
- [x] After deck is selected, prompt for quiz mode: sequential or random

#### 6d. Quiz Orchestrator
- [x] Implement `QuizOrchestrator` class that:
  - Loads cards for the selected deck
  - Orders them based on quiz mode (sequential by card order, random via shuffle)
  - Exposes `nextCard()` → returns next Card or null
  - Exposes `isDone()` → returns true when all cards have been shown
  - Tracks correct_count/incorrect_count internally
- [x] On each card: display question, wait for input
- [x] If user types "q" or "quit": end quiz early
- [x] After each answer: record CardStats impression, update orchestrator counts
- [x] When `isDone()` or quit: display summary (correct_count, incorrect_count, % correct, time elapsed)

#### 6e. Mastery Flag
- [x] Add `is_mastered` computed property per user+deck
- [x] `is_mastered` = true if the user's most recent quiz on that deck got 100% correct
- [x] Display mastery status in deck selection menu (e.g., "✓ Mastered" next to deck name)

### 7. Seed Data
- [x] Update `generate-cards.ts` to use the new Card CRUD (creates cards in `data/cards.json`)
- [x] Add a `generate-deck.ts` script that creates a default deck from all cards
- [x] Remove old `cards.json` from project root once migration is done

### 8. Web App (React + Vite)

#### Architecture
```
flashcard-app/
├── api/             # Express API server (business logic lives here)
│   ├── routes/      # REST endpoints: /users, /cards, /decks, /quizzes, /sessions
│   └── server.ts   # Express app entry point
├── web/             # React frontend (display only — no business logic)
│   ├── src/
│   │   ├── pages/   # Login, DeckSelect, Quiz, Import
│   │   ├── components/  # Reusable UI pieces
│   │   └── api.ts   # Fetch wrapper to call the API
│   └── index.html
├── models/          # Shared type definitions (used by both API and web)
├── services/        # Business logic (used by API only)
├── stores/          # Data layer (used by API only)
└── ...
```

**Key principle:** Frontend calls API → API calls services → services call stores. Frontend never touches business logic directly.

#### 8a. API Server
- [ ] Set up Express server in `api/server.ts`
- [ ] Add routes: POST/GET/PUT/DELETE for /users, /cards, /decks, /quizzes
- [ ] Add GET /quiz/next-card/:quizId — returns next card (mode logic lives here)
- [ ] Add GET /decks/:deckId/modes — returns available quiz modes (extensible)
- [ ] Add POST /quiz/answer — submit answer, returns correct/incorrect + stats
- [ ] Add POST /import/csv — accepts CSV file, creates cards + deck

#### 8b. React Frontend
- [ ] Set up React + Vite in `web/` directory
- [ ] Login page: welcome back / switch user / create new
- [ ] Deck selection page: recent decks, search, mastery badges
- [ ] Quiz page: shows question number (Q1, Q2, ...), answer input, quit button
- [ ] Results page: correct/incorrect count, %, time
- [ ] Import page: file picker for CSV, deck name input, preview, create

#### 8c. Navigation (React Router)
- [ ] `/login` → Login/user selection
- [ ] `/decks` → Deck selection
- [ ] `/quiz/:deckId` → Active quiz
- [ ] `/results/:quizId` → Quiz results
- [ ] `/import` → CSV deck import

#### 8d. CSV Import
- [ ] CSV format: `question,answers` (answers pipe-separated: "Paris|paris")
- [ ] Frontend: file picker + deck name input + preview table
- [ ] API: parse CSV, create cards, create deck with those card IDs
- [ ] Validation: reject rows with empty question or no answers

#### 8e. Extensible Quiz Modes
- [ ] API returns available modes from a config (not hardcoded in frontend)
- [ ] Frontend renders mode buttons dynamically based on API response
- [ ] Adding a new mode = add it to the API config + implement the ordering logic
- [ ] Current modes: "sequential", "random". Easy to add "worst-first", "spaced", etc.
---

## Architecture

```
flashcard-app/
├── api/             # Express API server (business logic access point)
├── web/             # React frontend (display only)
├── models/          # Shared type definitions (User, Card, Deck, Quiz, Session, CardStats)
├── services/        # Business logic (CRUD, orchestrator, stats)
├── stores/          # Data access layer (JsonFileStore now, DB later)
├── tests/           # Tests structured as API calls
├── data/            # Runtime JSON files (gitignored)
├── generate-cards.ts
├── generate-deck.ts
├── quiz.ts          # CLI entry point (still works independently)
├── package.json
└── tsconfig.json
```

**Folder roles:**
- `models/` = "what is a User?" (shape/schema, no logic)
- `services/` = "how do I create a User?" (business logic, APIs)
- `stores/` = "where do I save a User?" (JSON files now, Postgres later)
- `api/` = HTTP layer that exposes services to the frontend
- `web/` = React UI that calls the API and renders results
