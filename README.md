# Flashcard App

A simple CLI flashcard quiz app with user tracking, card management, and game stats.

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
- [ ] Define `Card` model: `unique_id`, `question`, `answers` (string[]), `version_id`
- [ ] Implement `createCard(question, answers)` → generates unique_id, version_id=1
- [ ] Implement `readCard(unique_id)` → returns Card or null
- [ ] Implement `updateCard(unique_id, fields)` → updates question/answers, increments version_id
- [ ] Implement `deleteCard(unique_id)` → removes card from store
- [ ] Implement `listCards()` → returns all cards
- [ ] Persist cards to `data/cards.json`
- [ ] Write tests for Card CRUD operations

### 3. Deck CRUD
- [ ] Define `Deck` model: `unique_id`, `name`, `card_ids` (string[]), `card_count`, `version_id`
- [ ] Implement `createDeck(name, card_ids)` → generates unique_id, sets card_count, version_id=1
- [ ] Implement `readDeck(unique_id)` → returns Deck or null
- [ ] Implement `updateDeck(unique_id, fields)` → update name/card_ids, recalculate card_count, increment version_id
- [ ] Implement `deleteDeck(unique_id)` → removes deck from store
- [ ] Implement `listDecks()` → returns all decks
- [ ] Persist decks to `data/decks.json`
- [ ] Write tests for Deck CRUD operations

### 4. Card Stats
- [ ] Define `CardStats` model: `user_id`, `card_id`, `impressions`, `correct_count`, `first_impression` (ISO date), `last_impression` (ISO date), `last_n_correct` (number), `last_n_incorrect` (number)
- [ ] Implement `getCardStats(user_id, card_id)` → returns stats or default zeros
- [ ] Implement `recordImpression(user_id, card_id, correct: boolean)` → updates all metrics
- [ ] Implement `getUserStats(user_id)` → returns all card stats for a user
- [ ] Persist stats to `data/card-stats.json`
- [ ] Write tests for Card Stats operations

### 5. Game Table
- [ ] Define `Game` model: `unique_id`, `user_id`, `deck_id`, `start_date` (ISO), `time_length` (seconds), `wins` (correct count), `misses` (incorrect count), `mode` ("sequential" | "random")
- [ ] Implement `createGame(user_id, deck_id, mode)` → starts a new game session
- [ ] Implement `finishGame(game_id, wins, misses, time_length)` → saves final results
- [ ] Implement `getGameHistory(user_id)` → returns all games for a user
- [ ] Persist games to `data/games.json`
- [ ] Write tests for Game operations

### 6. Wire Up Quiz to New Models
- [ ] Update `quiz.ts` to prompt for user selection/creation at start
- [ ] Update quiz to prompt for deck selection
- [ ] Update quiz to create a Game record on start, finish on end
- [ ] Update quiz to record CardStats after each answer
- [ ] Increment user's `num_sessions` after each game
- [ ] Show game summary at end (wins, misses, time)

### 7. Seed Data
- [ ] Update `generate-cards.ts` to use the new Card CRUD (creates cards in `data/cards.json`)
- [ ] Add a `generate-deck.ts` script that creates a default deck from all cards
- [ ] Remove old `cards.json` from project root once migration is done

---

## Architecture (kept simple)

```
flashcard-app/
├── models/          # Type definitions (User, Card, Deck, CardStats, Game)
├── stores/          # JSON file-based CRUD for each model
├── data/            # Persisted JSON files (users, cards, decks, stats, games)
├── tests/           # Property-based and unit tests
├── generate-cards.ts
├── generate-deck.ts
├── quiz.ts          # Main CLI game loop
├── package.json
└── tsconfig.json
```

All data stored as flat JSON files in `data/`. No database needed.
