# Flashcard App

A simple CLI flashcard quiz app with user tracking, card management, and quiz stats.

## How to play

```bash
npx tsx generate-cards.ts   # generate the card deck (run once)
npx tsx quiz.ts              # take the quiz
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
- [ ] Define `Session` model: `id`, `user_id`, `start_time` (ISO), `quiz_ids` (string[])
- [ ] Implement `createSession(user_id)` → starts a new session
- [ ] Implement `addQuizToSession(session_id, quiz_id)` → appends quiz to session
- [ ] Persist sessions to `data/sessions.json`

#### 6b. Login Flow
- [ ] On app start, check for last logged-in user (persist `last_user_id` in `data/app-state.json`)
- [ ] If found, display "Welcome back, <username>!" with option to "login as someone else"
- [ ] If "login as someone else" or no last user: prompt for existing user (by name) or create new
- [ ] After login, create a new Session for this user
- [ ] Increment user's `num_sessions`

#### 6c. Deck Selection
- [ ] Show "Resume" option with last 5 decks played (from user's quiz history)
- [ ] Show "Search decks" option — search by deck name (substring match)
- [ ] After deck is selected, prompt for quiz mode: sequential or random

#### 6d. Quiz Orchestrator
- [ ] Implement `QuizOrchestrator` class that:
  - Loads cards for the selected deck
  - Orders them based on quiz mode (sequential by card order, random via shuffle)
  - Exposes `nextCard()` → returns next Card or null
  - Exposes `isDone()` → returns true when all cards have been shown
  - Tracks correct_count/incorrect_count internally
- [ ] On each card: display question, wait for input
- [ ] If user types "q" or "quit": end quiz early
- [ ] After each answer: record CardStats impression, update orchestrator counts
- [ ] When `isDone()` or quit: display summary (correct_count, incorrect_count, % correct, time elapsed)

#### 6e. Mastery Flag
- [ ] Add `is_mastered` computed property per user+deck
- [ ] `is_mastered` = true if the user's most recent quiz on that deck got 100% correct
- [ ] Display mastery status in deck selection menu (e.g., "✓ Mastered" next to deck name)

### 7. Seed Data
- [ ] Update `generate-cards.ts` to use the new Card CRUD (creates cards in `data/cards.json`)
- [ ] Add a `generate-deck.ts` script that creates a default deck from all cards
- [ ] Remove old `cards.json` from project root once migration is done

---

## Architecture (kept simple)

```
flashcard-app/
├── models/          # Type definitions only (User, Card, Deck, CardStats, Game, Session, Quiz)
├── services/        # Business logic / APIs (CRUD operations, orchestrator)
├── stores/          # Data access layer (JsonFileStore today, swap to DB later)
├── tests/           # Tests structured as API calls (input → expected output)
├── data/            # Created at runtime — persisted JSON files (gitignored)
├── node_modules/    # npm packages (auto-installed, gitignored)
├── generate-cards.ts
├── quiz.ts          # Main CLI entry point
├── package.json
└── tsconfig.json
```

**Folder roles:**
- `models/` = "what is a User?" (shape/schema, no logic)
- `services/` = "how do I create a User?" (business logic, APIs)
- `stores/` = "where do I save a User?" (JSON files now, Postgres later)

All data stored as flat JSON files in `data/`. No database needed yet.
