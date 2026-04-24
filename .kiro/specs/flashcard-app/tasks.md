# Implementation Plan: Flashcard App

## Overview

Build a local-first flashcard learning application in TypeScript with CLI-based Display_Engine, JSON file persistence, spaced repetition orchestration, and encouragement mechanics. Implementation proceeds bottom-up: data models → storage → business logic subsystems → orchestrator → encouragement → CLI display → wiring.

## Tasks

- [ ] 1. Set up project structure, data models, and Result type
  - Initialize TypeScript project with `tsconfig.json`, `package.json` (include `fast-check`, `vitest` as dev dependencies, `uuid` as runtime dependency)
  - Create `src/models/` directory with all data model interfaces: `Card`, `Deck`, `Class`, `Curriculum`, `User`, `AnswerEvent`, `Session`, `StudyScope`, `Score`, `EvaluationMode`, `MasteryConfig`, `CardAnswerSummary`
  - Create `src/types/result.ts` with the `Result<T, E>` type, `ValidationError`, `StorageError`, `ParseError` types
  - Create `src/types/navigation.ts` with `NavigationAction`, `MainMenuChoice`, `EntityType` types
  - Define `MasteryConfig` defaults: `consecutiveCorrectThreshold: 3`, `masteryMilestoneThresholds: [5, 10, 25, 50, 100]`, `streakMinimum: 3`
  - _Requirements: 1.5, 2.1, 2.2, 2.4, 4.1, 6.6, 7.1, 7.7, 9.1.1_

- [ ] 2. Implement StorageInterface and JsonFileStorage
  - [ ] 2.1 Create `src/storage/storage-interface.ts` with the `StorageInterface` interface (`load`, `save`, `delete`, `list`)
    - _Requirements: 11.2_

  - [ ] 2.2 Implement `src/storage/json-file-storage.ts` with `JsonFileStorage` class
    - Read/write JSON files to a configurable local directory
    - Handle file-not-found (return null), permission errors, disk-full errors as `StorageError`
    - Implement `list` using directory listing with prefix filtering
    - _Requirements: 11.2, 7.4_

  - [ ]* 2.3 Write unit tests for JsonFileStorage
    - Test load of non-existent key returns null
    - Test save then load round-trip
    - Test delete removes key
    - Test list with prefix filtering
    - _Requirements: 11.2_

- [ ] 3. Implement Storage_File serialization and Card_Creator
  - [ ] 3.1 Implement `src/services/storage-file.ts` — serialize/deserialize Card arrays to/from JSON Storage_File format
    - Serialize: Card[] → JSON string (array of `{id, front, back}`)
    - Deserialize: JSON string → Card[] with validation, skip malformed entries, collect errors with line numbers
    - Ignore unrecognized fields during deserialization
    - _Requirements: 2.4, 2.5, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 3.2 Write property tests for Storage_File serialization
    - **Property 7: Storage_File serialization round-trip (objects → file → objects)**
    - **Validates: Requirements 2.5, 10.3**

  - [ ]* 3.3 Write property test for deserialization round-trip
    - **Property 8: Storage_File deserialization round-trip (file → objects → file)**
    - **Validates: Requirements 10.4**

  - [ ]* 3.4 Write property test for unrecognized fields
    - **Property 27: Unrecognized fields ignored on import**
    - **Validates: Requirements 10.5**

  - [ ] 3.5 Implement `src/services/card-creator.ts` — `CardCreator` class
    - `createCard`: validate front (1–1000 chars, non-whitespace-only) and back (1–2000 chars, non-whitespace-only), trim whitespace, assign UUID, persist to storage
    - `importFromFile`: parse Storage_File JSON, create valid cards, collect malformed entries into `ImportReport`
    - `exportToFile`: load deck cards, serialize to Storage_File JSON string
    - `createCurriculum`, `createClass`, `createDeck`: validate names, enforce unique names within parent scope, assign UUIDs, persist
    - `assignDeckToClass`: validate deck and class exist, associate
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 3.6 Write property test for card creation persistence
    - **Property 1: Card creation persists to deck**
    - **Validates: Requirements 1.1, 2.1, 2.2, 2.3**

  - [ ]* 3.7 Write property test for batch import
    - **Property 2: Batch import creates all valid cards**
    - **Validates: Requirements 1.2**

  - [ ]* 3.8 Write property test for invalid content rejection
    - **Property 3: Invalid card content rejection**
    - **Validates: Requirements 1.3, 2.1, 2.2, 3.3**

  - [ ]* 3.9 Write property test for malformed entry partitioning
    - **Property 4: Malformed entry partitioning**
    - **Validates: Requirements 1.4**

  - [ ]* 3.10 Write property test for unique identifiers
    - **Property 5: Unique identifier assignment**
    - **Validates: Requirements 1.5, 7.3, 9.1.1**

  - [ ]* 3.11 Write property test for whitespace trimming
    - **Property 6: Whitespace trimming on persist**
    - **Validates: Requirements 2.3**

  - [ ]* 3.12 Write property test for duplicate name rejection
    - **Property 24: Duplicate name rejection in organizational scope**
    - **Validates: Requirements 9.5**

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Card_Editor
  - [ ] 5.1 Implement `src/services/card-editor.ts` — `CardEditor` class
    - `updateCard`: validate new content (same rules as creation), trim whitespace, preserve card ID, update `updatedAt`, persist
    - `batchUpdate`: parse Storage_File with IDs, match by card ID, update matched cards, collect unmatched into `BatchUpdateReport`
    - `updateDeckName`, `updateCurriculumName`, `updateDescription`: validate and persist name/description changes, update `updatedAt` on parent entities
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.7_

  - [ ]* 5.2 Write property test for edit preserving identity and history
    - **Property 9: Card edit preserves identity and history**
    - **Validates: Requirements 3.1, 3.5**

  - [ ]* 5.3 Write property test for batch update matching
    - **Property 10: Batch update matches by identifier**
    - **Validates: Requirements 3.2, 3.4**

- [ ] 6. Implement Answer_Evaluator
  - [ ] 6.1 Implement `src/services/answer-evaluator.ts` — `AnswerEvaluator` class
    - `evaluate`: trim whitespace from response and back content; in binary mode (default), compare lowercased trimmed strings; in percentage mode, compute similarity score 0–100; support optional `caseSensitive` flag
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 6.2 Write property test for binary evaluation
    - **Property 11: Binary evaluation correctness**
    - **Validates: Requirements 4.2, 4.5**

  - [ ]* 6.3 Write property test for percentage score bounds
    - **Property 12: Percentage score bounds**
    - **Validates: Requirements 4.3**

- [ ] 7. Implement Answer_History_Store
  - [ ] 7.1 Implement `src/services/answer-history-store.ts` — `AnswerHistoryStore` class
    - `record`: assign UUID, validate fields, persist AnswerEvent with ISO 8601 UTC timestamp; retry once on failure, propagate StorageError on second failure
    - `getByCard`: return events for cardId+userId, ordered by timestamp descending
    - `getBySession`: return events for sessionId, ordered by timestamp ascending
    - `getCardSummary`: compute `CardAnswerSummary` (totalAttempts, correctCount, lastAnswerDate, firstAnswerDate, consecutiveCorrect)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 7.2 Write property test for answer event persistence
    - **Property 18: Answer event persistence completeness**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 7.3 Write property test for retrieval ordering
    - **Property 19: Answer history retrieval ordering**
    - **Validates: Requirements 7.5, 7.6**

  - [ ]* 7.4 Write property test for user history isolation
    - **Property 26: User answer history isolation**
    - **Validates: Requirements 9.1.2**

- [ ] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Orchestrator
  - [ ] 9.1 Implement `src/services/orchestrator.ts` — `Orchestrator` class
    - `startSession`: create Session with scope, userId, empty tracking sets
    - `getNextCard`: select next card using spaced repetition logic — prioritize cards with higher incorrect ratios, ensure full deck coverage before repeats (except incorrect-prioritized cards), exclude expunged and mastered cards, return null when no cards remain
    - `recordAnswer`: update session tracking (streak, incorrectCardIds, presentedCardIds), delegate to AnswerHistoryStore
    - `skipCard`: defer card, add to skippedCardIds, select next per standard algorithm
    - `expungeCard`: add to expungedCardIds, exclude from future selection in session
    - `startMasteryReview`: switch session to mastery-review mode, select only mastered cards
    - `isMastered`: check if card has >= `consecutiveCorrectThreshold` consecutive correct answers
    - Scope filtering: resolve decks from StudyScope (deck, class, curriculum, all), only present cards within scope
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 8.5, 9.6_

  - [ ]* 9.2 Write property test for incorrect-answer prioritization
    - **Property 13: Incorrect-answer prioritization**
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 9.3 Write property test for correct-answer frequency reduction
    - **Property 14: Correct-answer frequency reduction**
    - **Validates: Requirements 6.3**

  - [ ]* 9.4 Write property test for expunged card exclusion
    - **Property 15: Expunged card exclusion**
    - **Validates: Requirements 6.5**

  - [ ]* 9.5 Write property test for mastered card exclusion
    - **Property 16: Mastered card exclusion**
    - **Validates: Requirements 6.6**

  - [ ]* 9.6 Write property test for full deck coverage
    - **Property 17: Full deck coverage before repeats**
    - **Validates: Requirements 6.7**

  - [ ]* 9.7 Write property test for scoped card selection
    - **Property 25: Scoped card selection**
    - **Validates: Requirements 9.6**

- [ ] 10. Implement Encouragement_Engine
  - [ ] 10.1 Implement `src/services/encouragement-engine.ts` — `EncouragementEngine` class
    - `checkStreak`: detect N >= 3 consecutive correct answers in session, reset on incorrect
    - `checkFirstTry`: return true if card has no prior answer history and was answered correctly
    - `checkMasteryMilestone`: check if mastered card count crosses a configured threshold
    - `getMasteredCount`: return total mastered cards for user
    - `getMessage`: return a message from a pool of >= 5 distinct messages per encouragement type, with variety
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 10.2 Write property test for streak detection
    - **Property 20: Streak detection**
    - **Validates: Requirements 8.1**

  - [ ]* 10.3 Write property test for first-try detection
    - **Property 21: First-try detection**
    - **Validates: Requirements 8.2**

  - [ ]* 10.4 Write property test for mastery milestone detection
    - **Property 22: Mastery milestone detection**
    - **Validates: Requirements 8.3, 8.4**

  - [ ]* 10.5 Write property test for message variety
    - **Property 23: Encouragement message variety**
    - **Validates: Requirements 8.6**

- [ ] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement CLI Display_Engine
  - [ ] 12.1 Implement `src/cli/display-engine.ts` — `CliDisplayEngine` class implementing `DisplayEngine` interface
    - `promptMainMenu`: prompt user to choose "define" or "play"
    - `promptDeckSelection`: show curricula/classes/decks hierarchy, let user pick a study scope; if only one deck exists, auto-select it
    - `showCard`: render front content, prompt for response
    - `getResponse`: read user input from stdin
    - `showFeedback`: display back content, user response, score, encouragement message; positive indicator for correct, corrective indicator for incorrect, percentage display for percentage mode
    - `showEncouragement`: display encouragement message
    - `promptNavigation`: prompt for next/skip/expunge/quit
    - Define flow: prompt for 1:1 card entry or file upload, deck creation, curriculum/class management, deck name updates, description edits
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 11.1_

- [ ] 13. Implement multi-user support
  - [ ] 13.1 Implement `src/services/user-service.ts` — user creation, lookup, username uniqueness validation
    - Persist users via StorageInterface
    - CLI prompt for user selection/creation at app startup
    - _Requirements: 9.1.1, 9.1.2, 9.1.3_

- [ ] 14. Wire everything together and implement main entry point
  - [ ] 14.1 Create `src/index.ts` — application entry point
    - Initialize JsonFileStorage with configurable data directory
    - Instantiate all subsystems with dependency injection (StorageInterface → CardCreator, CardEditor, AnswerHistoryStore, AnswerEvaluator, Orchestrator, EncouragementEngine, CliDisplayEngine)
    - Implement main loop: user login → main menu → define or play flow → session loop (show card → get response → evaluate → record → encourage → navigate)
    - Handle graceful session end when Orchestrator returns null
    - Handle EncouragementEngine failures gracefully (continue without encouragement)
    - _Requirements: 5.7, 11.1, 11.3, 11.4_

- [ ] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use `fast-check` with minimum 100 iterations per property
- Unit tests use `vitest`
- All 27 correctness properties from the design are covered as property-based test sub-tasks
