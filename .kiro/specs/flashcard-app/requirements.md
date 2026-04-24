# Requirements Document

## Introduction

A flashcard learning application designed to maximize learning efficiency through spaced repetition and intelligent card orchestration. The application supports manual and batch card creation, answer evaluation, encouragement mechanics, and curriculum organization. The platform strategy targets local-first deployment, with a progressive path toward web and mobile applications.

## Glossary

- **Card**: A learning unit consisting of front content (the prompt) and back content (the correct answer).
- **Deck**: A named collection of Cards.
- **Curriculum**: A top-level organizational grouping that contains one or more Classes.
- **Class**: A grouping of Decks within a Curriculum, representing a subject or topic area.
- **Session**: A single continuous study period identified by a unique Session ID.
- **Card_Creator**: The subsystem responsible for creating and batch-importing Cards.
- **Card_Editor**: The subsystem responsible for modifying existing Card content.
- **Answer_Evaluator**: The subsystem responsible for comparing a user response to the correct answer and producing a score.
- **Display_Engine**: The subsystem responsible for rendering Cards, soliciting user responses, and presenting feedback.
- **Orchestrator**: The subsystem that selects which Card to present next based on answer history and spaced repetition logic.
- **Answer_History_Store**: The persistent storage subsystem that records every answer event.
- **Encouragement_Engine**: The subsystem that detects streaks, milestones, and mastery and delivers motivational feedback.
- **Mastered_Card**: A Card that the user has answered correctly a configurable number of consecutive times.
- **Storage_File**: A structured file (e.g., JSON or CSV) used for batch import and export of Cards.
- **Front_Content**: The prompt side of a Card, consisting of plain text.
- **Back_Content**: The answer side of a Card, consisting of plain text that represents the correct response.
- **Score**: A value representing the evaluation result — either a binary correct/incorrect or a percentage (0–100).
- **Streak**: A consecutive sequence of correct answers across Cards within a Session or across Sessions.

## Requirements

### Requirement 1: Card Creation

**User Story:** As a learner, I want to create flashcards individually or in batch, so that I can quickly build my study material.

#### Acceptance Criteria

1. WHEN the user submits front content and back content, THE Card_Creator SHALL create a new Card and persist it to the active Deck.
2. WHEN the user provides a valid Storage_File containing one or more Card definitions, THE Card_Creator SHALL create all Cards defined in the file and persist them to the specified Deck.
3. IF the user submits a Card with empty front content or empty back content, THEN THE Card_Creator SHALL reject the Card and return a validation error indicating which field is missing.
4. IF the user provides a Storage_File with malformed entries, THEN THE Card_Creator SHALL skip the malformed entries, create all valid Cards, and return a report listing the skipped entries with line numbers and error descriptions.
5. THE Card_Creator SHALL assign a unique identifier to each Card upon creation.

### Requirement 2: Card Content Format

**User Story:** As a learner, I want a clear definition of what valid card content looks like, so that I can create well-formed flashcards.

#### Acceptance Criteria

1. THE Card_Creator SHALL accept Front_Content as non-empty plain text with a maximum length of 1000 characters.
2. THE Card_Creator SHALL accept Back_Content as non-empty plain text with a maximum length of 2000 characters.
3. WHEN a Card is created or updated, THE Card_Creator SHALL trim leading and trailing whitespace from both Front_Content and Back_Content.
4. THE Storage_File SHALL conform to a documented JSON schema where each entry contains a "front" field and a "back" field, both of type string.
5. FOR ALL valid Card objects, parsing a Storage_File then serializing it back to a Storage_File then parsing again SHALL produce an equivalent set of Card objects (round-trip property).

### Requirement 3: Card Editing

**User Story:** As a learner, I want to edit my flashcards one at a time through the UI or in batch by editing the storage file, so that I can correct mistakes and refine my study material.

#### Acceptance Criteria

1. WHEN the user modifies the front content or back content of an existing Card via the UI, THE Card_Editor SHALL persist the updated content and retain the Card's unique identifier.
2. WHEN the user provides an updated Storage_File, THE Card_Editor SHALL apply all valid modifications to existing Cards matched by unique identifier.
3. IF the user submits an edit that results in empty front content or empty back content, THEN THE Card_Editor SHALL reject the edit and return a validation error.
4. IF the Storage_File references a Card identifier that does not exist, THEN THE Card_Editor SHALL skip that entry and include it in a report of unmatched identifiers.
5. WHEN a Card is edited, THE Card_Editor SHALL preserve the Card's existing answer history in the Answer_History_Store.

### Requirement 4: Answer Evaluation

**User Story:** As a learner, I want my answers evaluated as correct/incorrect or as a percentage score, so that I get accurate feedback on my knowledge.

#### Acceptance Criteria

1. WHEN the user submits a response to a Card, THE Answer_Evaluator SHALL compare the response to the Back_Content and produce a Score.
2. THE Answer_Evaluator SHALL support a binary evaluation mode that returns "correct" when the response matches the Back_Content (case-insensitive, whitespace-normalized) and "incorrect" otherwise.
3. THE Answer_Evaluator SHALL support a percentage evaluation mode that returns a Score from 0 to 100 representing the degree of match between the response and the Back_Content.
4. WHEN the evaluation mode is not specified, THE Answer_Evaluator SHALL default to binary evaluation mode.
5. THE Answer_Evaluator SHALL normalize both the user response and the Back_Content by trimming whitespace.  The evaluator shall have a mode where case matters, but by default, will convert answer and back content to lowercase.

### Requirement 5: Display and User Experience

**User Story:** As a learner, I want to see a card, provide my answer, and receive immediate feedback, so that I can learn effectively.

#### Acceptance Criteria

1. WHEN a Card is selected for display, THE Display_Engine SHALL render the Front_Content and provide an input area for the user response.
2. WHEN the user submits a response, THE Display_Engine SHALL display the Back_Content alongside the user's response and the Score.
3. WHEN the Score indicates "correct" in binary mode, THE Display_Engine SHALL display a positive feedback indicator.
4. WHEN the Score indicates "incorrect" in binary mode, THE Display_Engine SHALL display the correct answer with a corrective feedback indicator.
5. WHEN the Score is in percentage mode, THE Display_Engine SHALL display the numeric Score and highlight discrepancies between the response and the Back_Content.
6. WHEN feedback is displayed, THE Display_Engine SHALL provide a control to advance to the next Card.
7. WHEN a user opens the application, he shall be prompted choose whether to define cards, or play.  If he chooses to play, he can choose a curriculumn, if one exists, then a deck, if it exists.  If no curriculum or set of decks exist, it will immediately jump into a session with the only existing deck.  If he wants to define cards, he can choose to enter 1:1, or upload a file specifying cards.  All cards must belong to a deck, but not all decks need to belong to a curriculum.  A user can update deck names, and assign decks to curriculums, and change curriculum names.  In addition, all decks and curriculums can have a description, with date of creation and last edit.  A card edit within a deck will also update the last update date of the deck.

### Requirement 6: Card Orchestration

**User Story:** As a learner, I want the app to show me missed cards more often and correct cards less often, so that I spend my study time where it matters most.

#### Acceptance Criteria

1. THE Orchestrator SHALL select the next Card to display based on the user's answer history, prioritizing Cards with a higher ratio of incorrect answers.
2. WHEN a Card has been answered incorrectly in the current Session, THE Orchestrator SHALL increase the probability of that Card being selected again within the same Session.
3. WHEN a Card has been answered correctly on consecutive attempts, THE Orchestrator SHALL decrease the frequency at which that Card is presented.
4. WHEN the user requests to skip a Card, THE Orchestrator SHALL defer that Card and select the next Card according to the standard selection algorithm.
5. WHEN the user requests to expunge a Card, THE Orchestrator SHALL remove that Card from future selection within the active study session and mark it as expunged.
6. WHILE a Card is marked as a Mastered_Card, THE Orchestrator SHALL exclude it from the standard selection pool unless the user explicitly requests a mastery review.
7. THE Orchestrator SHALL ensure that all non-mastered, non-expunged Cards in the active Deck are presented at least once before repeating any Card, except for Cards prioritized due to incorrect answers.

### Requirement 7: Answer History Storage

**User Story:** As a learner, I want every answer recorded with full context, so that the app can track my progress and optimize my learning.

#### Acceptance Criteria

1. WHEN the user submits a response to a Card, THE Answer_History_Store SHALL persist a record containing: the Card identifier, the user response, the Score, the Session identifier, and a timestamp.
2. THE Answer_History_Store SHALL record the timestamp in ISO 8601 format with UTC timezone.
3. THE Answer_History_Store SHALL assign each record a unique identifier.
4. IF the Answer_History_Store fails to persist a record, THEN THE Answer_History_Store SHALL retry the write operation once and, upon second failure, notify the Display_Engine of the storage error.
5. THE Answer_History_Store SHALL support retrieval of all records for a given Card identifier, ordered by timestamp descending.
6. THE Answer_History_Store SHALL support retrieval of all records for a given Session identifier, ordered by timestamp ascending.
7. The answer_history_store shall consider an implementation where each card has a single answer history that takes up fixed space.  For example, number of tries, number of correct answers, last answer date, first answer date, etc.

### Requirement 8: Encouragement and Motivation

**User Story:** As a learner, I want to be encouraged when I'm on a streak, get new cards right, or master cards, so that I stay motivated.

#### Acceptance Criteria

1. WHEN the user answers three or more Cards correctly in a row within a Session, THE Encouragement_Engine SHALL display a streak notification indicating the current streak length.
2. WHEN the user answers a Card correctly on the first attempt (no prior history for that Card), THE Encouragement_Engine SHALL display a "first try" congratulatory message.
3. WHEN the number of Mastered_Cards exceeds a configurable threshold, THE Encouragement_Engine SHALL display a mastery milestone notification.
4. THE Encouragement_Engine SHALL track the total count of Mastered_Cards and make it visible to the user on demand.
5. WHEN the user requests a mastery review, THE Orchestrator SHALL present only Mastered_Cards and THE Encouragement_Engine SHALL indicate that the user is in mastery review mode.
6. THE Encouragement_Engine SHALL vary the congratulatory messages to avoid repetitive feedback, drawing from a pool of at least five distinct messages per encouragement type.

### Requirement 9: Curriculum and Class Organization

**User Story:** As a learner, I want to organize my cards into curricula and classes, so that I can structure my learning by subject area.

#### Acceptance Criteria

1. WHEN the user creates a Curriculum, THE Card_Creator SHALL persist the Curriculum with a unique identifier and a user-provided name.
2. WHEN the user creates a Class within a Curriculum, THE Card_Creator SHALL associate the Class with the specified Curriculum and assign it a unique identifier and name.
3. WHEN the user assigns a Deck to a Class, THE Card_Creator SHALL associate the Deck with the specified Class.
4. THE Card_Creator SHALL enforce that each Deck belongs to exactly one Class.
5. IF the user attempts to create a Curriculum or Class with a duplicate name within the same parent scope, THEN THE Card_Creator SHALL reject the creation and return a descriptive error.
6. WHEN the user selects a Curriculum or Class for study, THE Orchestrator SHALL limit Card selection to the Decks within the selected scope.

### Requirement 9.1: Multiple users

**User Story:** As a system owner, I want the system to support multiple users, who are all at different parts of their learning journey

#### Acceptance Criteria
1. Each user shall have a username and a unique user_id
2. Each user shall have a separate answer history
3. P1: Each user shall have a separate set of curriculum and decks available to try.  As a V0, all users will have access to all decks and curricula.

### Requirement 10: Storage File Serialization

**User Story:** As a developer, I want reliable serialization and deserialization of card data, so that batch operations and data portability work correctly.

#### Acceptance Criteria

1. THE Card_Creator SHALL serialize Card data to the Storage_File format using the documented JSON schema.
2. THE Card_Creator SHALL deserialize Storage_File content into Card objects using the documented JSON schema.
3. FOR ALL valid sets of Card objects, serializing to a Storage_File then deserializing SHALL produce an equivalent set of Card objects (round-trip property).
4. FOR ALL valid Storage_Files, deserializing then serializing SHALL produce a semantically equivalent Storage_File (round-trip property).
5. IF a Storage_File contains fields not defined in the schema, THEN THE Card_Creator SHALL ignore unrecognized fields and process all recognized fields.

### Requirement 11: Platform Portability

**User Story:** As a product owner, I want the application architecture to support local, web, and mobile deployment, so that we can progressively expand our platform reach.

#### Acceptance Criteria

1. THE Display_Engine SHALL separate presentation logic from business logic to enable platform-specific UI implementations.
2. THE Answer_History_Store SHALL use an abstracted storage interface so that the underlying persistence mechanism can be swapped between local file storage, a database, or a cloud service.
3. THE Orchestrator SHALL operate independently of the presentation layer, receiving Card selection requests and returning Card identifiers without knowledge of the rendering platform.
4. THE Card_Creator SHALL expose its functionality through a defined API boundary that can be consumed by local, web, or mobile front ends.
