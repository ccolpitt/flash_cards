/**
 * User model.
 *
 * Represents a player in the flashcard app.
 */
export interface User {
    id: string;           // unique identifier (UUID)
    name: string;         // display name
    create_date: string;  // ISO 8601 timestamp
    num_sessions: number; // total games played
}
