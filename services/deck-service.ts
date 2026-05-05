import { randomUUID } from "node:crypto";
import { Deck } from "../models/deck.js";
import { Store } from "../stores/store-interface.js";

/**
 * Deck service — CRUD operations for card decks.
 */
export class DeckService {
    constructor(private store: Store<Deck>) { }

    createDeck(name: string, card_ids: string[]): Deck {
        const deck: Deck = {
            id: randomUUID(),
            name: name.trim(),
            card_ids,
            card_count: card_ids.length,
            version_id: 1,
        };
        return this.store.create(deck);
    }

    readDeck(id: string): Deck | null {
        return this.store.read(id);
    }

    updateDeck(id: string, fields: { name?: string; card_ids?: string[] }): Deck | null {
        const existing = this.store.read(id);
        if (!existing) return null;

        const updates: Partial<Deck> = { version_id: existing.version_id + 1 };
        if (fields.name !== undefined) updates.name = fields.name.trim();
        if (fields.card_ids !== undefined) {
            updates.card_ids = fields.card_ids;
            updates.card_count = fields.card_ids.length;
        }
        return this.store.update(id, updates);
    }

    deleteDeck(id: string): boolean {
        return this.store.delete(id);
    }

    listDecks(): Deck[] {
        return this.store.list();
    }
}
