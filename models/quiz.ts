/**
 * Quiz model.
 *
 * Records a single quiz session (one user, one deck, one attempt).
 */
export interface Quiz {
    id: string;              // unique identifier (UUID)
    user_id: string;         // reference to User.id
    deck_id: string;         // reference to Deck.id
    start_time: string;      // ISO 8601 timestamp
    time_length: number;     // duration in seconds
    correct_count: number;   // number of correct answers
    incorrect_count: number; // number of incorrect answers
    mode: "sequential" | "random";
}
