/**
 * Session model.
 *
 * A login session — one user, one or more quizzes.
 */
export interface Session {
    id: string;           // unique identifier (UUID)
    user_id: string;      // reference to User.id
    start_time: string;   // ISO 8601 timestamp
    quiz_ids: string[];   // references to Quiz.id
}
