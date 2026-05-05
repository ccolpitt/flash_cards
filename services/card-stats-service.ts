import { CardStats } from "../models/card-stats.js";
import { Store } from "../stores/store-interface.js";

const LAST_N_WINDOW = 10; // track last 10 impressions

/**
 * CardStats service — tracks per-user, per-card performance.
 */
export class CardStatsService {
    constructor(private store: Store<CardStats>) { }

    private makeId(user_id: string, card_id: string): string {
        return `${user_id}:${card_id}`;
    }

    getCardStats(user_id: string, card_id: string): CardStats {
        const id = this.makeId(user_id, card_id);
        const existing = this.store.read(id);
        if (existing) return existing;

        // Return default (not persisted until first impression)
        return {
            id,
            user_id,
            card_id,
            impressions: 0,
            correct_count: 0,
            first_impression: "",
            last_impression: "",
            last_n_correct: 0,
            last_n_incorrect: 0,
        };
    }

    recordImpression(user_id: string, card_id: string, correct: boolean): CardStats {
        const id = this.makeId(user_id, card_id);
        const existing = this.store.read(id);
        const now = new Date().toISOString();

        if (!existing) {
            // First impression for this user+card
            const stats: CardStats = {
                id,
                user_id,
                card_id,
                impressions: 1,
                correct_count: correct ? 1 : 0,
                first_impression: now,
                last_impression: now,
                last_n_correct: correct ? 1 : 0,
                last_n_incorrect: correct ? 0 : 1,
            };
            return this.store.create(stats);
        }

        // Update existing stats
        const impressions = existing.impressions + 1;
        const correct_count = existing.correct_count + (correct ? 1 : 0);

        // Sliding window for last_n: simple approach — track running totals
        // When window is full, we approximate by decaying
        let last_n_correct = existing.last_n_correct + (correct ? 1 : 0);
        let last_n_incorrect = existing.last_n_incorrect + (correct ? 0 : 1);

        // If we've exceeded the window, trim the oldest (approximate)
        if (last_n_correct + last_n_incorrect > LAST_N_WINDOW) {
            if (correct) {
                // We added a correct, so trim an incorrect if possible, else trim correct
                if (last_n_incorrect > 0) last_n_incorrect--;
                else last_n_correct--;
            } else {
                if (last_n_correct > 0) last_n_correct--;
                else last_n_incorrect--;
            }
        }

        return this.store.update(id, {
            impressions,
            correct_count,
            last_impression: now,
            last_n_correct,
            last_n_incorrect,
        })!;
    }

    getUserStats(user_id: string): CardStats[] {
        return this.store.list().filter((s) => s.user_id === user_id);
    }
}
