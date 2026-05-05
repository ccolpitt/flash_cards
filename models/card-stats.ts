/**
 * CardStats model.
 *
 * Tracks per-user, per-card performance metrics.
 * The `id` is a composite key: `${user_id}:${card_id}`
 */
export interface CardStats {
    id: string;              // composite key: "user_id:card_id"
    user_id: string;
    card_id: string;
    impressions: number;     // total times shown
    correct_count: number;   // total correct answers
    first_impression: string; // ISO date of first time seen
    last_impression: string;  // ISO date of most recent time seen
    last_n_correct: number;   // correct count in last N impressions
    last_n_incorrect: number; // incorrect count in last N impressions
}
