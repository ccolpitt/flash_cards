import { randomUUID } from "node:crypto";
import { Card } from "../models/card.js";
import { Store } from "../stores/store-interface.js";

/**
 * Card service — CRUD operations for flashcards.
 */
export class CardService {
    constructor(private store: Store<Card>) { }

    createCard(question: string, answers: string[]): Card {
        const card: Card = {
            id: randomUUID(),
            question: question.trim(),
            answers: answers.map((a) => a.trim()).filter((a) => a.length > 0),
            version_id: 1,
        };
        return this.store.create(card);
    }

    readCard(id: string): Card | null {
        return this.store.read(id);
    }

    updateCard(id: string, fields: { question?: string; answers?: string[] }): Card | null {
        const existing = this.store.read(id);
        if (!existing) return null;

        const updates: Partial<Card> = { version_id: existing.version_id + 1 };
        if (fields.question !== undefined) updates.question = fields.question.trim();
        if (fields.answers !== undefined) {
            updates.answers = fields.answers.map((a) => a.trim()).filter((a) => a.length > 0);
        }
        return this.store.update(id, updates);
    }

    deleteCard(id: string): boolean {
        return this.store.delete(id);
    }

    listCards(): Card[] {
        return this.store.list();
    }
}
