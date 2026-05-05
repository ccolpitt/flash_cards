import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Feature: flashcard-mvp
 * Property test: Generated deck correctness
 *
 * The generated cards.json must contain exactly 100 cards with unique
 * sequential IDs (1–100) and non-empty question/answer fields.
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 */

interface Card {
    id: number;
    question: string;
    answers: string[];
}

function loadGeneratedCards(): Card[] {
    const filePath = path.resolve('cards.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
}

describe('Property test: generated deck has exactly 100 cards with unique sequential IDs and non-empty fields', () => {
    const cards = loadGeneratedCards();

    it('deck contains exactly 100 cards', () => {
        expect(cards.length).toBe(100);
    });

    it('all card IDs are unique', () => {
        const ids = cards.map((c) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('card IDs form the sequential range 1 to 100', () => {
        const ids = cards.map((c) => c.id).sort((a, b) => a - b);
        for (let i = 0; i < 100; i++) {
            expect(ids[i]).toBe(i + 1);
        }
    });

    it('every card has a non-empty question and at least one non-empty answer', () => {
        /**
         * Property: for every index into the cards array, the card at that
         * index has question.length > 0 and answers.length > 0 with each answer non-empty.
         *
         * **Validates: Requirements 1.4**
         */
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: cards.length - 1 }),
                (index) => {
                    const card = cards[index];
                    expect(card.question.length).toBeGreaterThan(0);
                    expect(card.answers.length).toBeGreaterThan(0);
                    for (const a of card.answers) {
                        expect(a.length).toBeGreaterThan(0);
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    it('every card has the correct shape (id: number, question: string, answers: string[])', () => {
        /**
         * Property: for every index into the cards array, the card has
         * exactly the fields id (number), question (string), answers (string[]).
         *
         * **Validates: Requirements 1.2**
         */
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: cards.length - 1 }),
                (index) => {
                    const card = cards[index];
                    expect(typeof card.id).toBe('number');
                    expect(typeof card.question).toBe('string');
                    expect(Array.isArray(card.answers)).toBe(true);
                    for (const a of card.answers) {
                        expect(typeof a).toBe('string');
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    it('cards cover all three categories: math, capitals, and science', () => {
        const mathCards = cards.filter(
            (c) => c.question.includes('×') || c.question.includes('+') || c.question.includes('-') || c.question.includes('/'),
        );
        const capitalCards = cards.filter((c) => c.question.includes('capital of'));
        const scienceCards = cards.filter(
            (c) =>
                !c.question.includes('×') &&
                !c.question.includes('+') &&
                !c.question.includes('-') &&
                !c.question.includes('/') &&
                !c.question.includes('capital of'),
        );

        expect(mathCards.length).toBeGreaterThanOrEqual(30);
        expect(capitalCards.length).toBeGreaterThanOrEqual(30);
        expect(scienceCards.length).toBeGreaterThanOrEqual(30);
    });
});
