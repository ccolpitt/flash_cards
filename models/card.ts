/**
 * Card model.
 *
 * A single flashcard with a question and one or more accepted answers.
 */
export interface Card {
    id: string;           // unique identifier (UUID)
    question: string;     // the question text
    answers: string[];    // accepted answers (any match = correct)
    version_id: number;   // increments on each update
}
