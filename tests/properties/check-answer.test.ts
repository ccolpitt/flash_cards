import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { checkAnswer } from '../../quiz.js';

/**
 * Feature: flashcard-mvp
 * Property test: checkAnswer correctness
 *
 * checkAnswer must be case-insensitive, trim whitespace, be reflexive,
 * reject wrong answers, and accept any matching answer from an array.
 *
 * **Validates: Requirements 4.1, 4.2, 4.3**
 */

describe('Property test: checkAnswer is case-insensitive, trims whitespace, and is reflexive', () => {
    it('case insensitivity: checkAnswer(s.toUpperCase(), s.toLowerCase()) === true for any non-empty string', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }),
                (s) => {
                    expect(checkAnswer(s.toUpperCase(), s.toLowerCase())).toBe(true);
                },
            ),
            { numRuns: 200 },
        );
    });

    it('whitespace tolerance: checkAnswer("  " + s + "  ", s) === true for any non-empty string', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }),
                (s) => {
                    expect(checkAnswer("  " + s + "  ", s)).toBe(true);
                },
            ),
            { numRuns: 200 },
        );
    });

    it('reflexivity: checkAnswer(s, s) === true for any string', () => {
        fc.assert(
            fc.property(
                fc.string(),
                (s) => {
                    expect(checkAnswer(s, s)).toBe(true);
                },
            ),
            { numRuns: 200 },
        );
    });

    it('wrong answers rejected: when trim().toLowerCase() differ, checkAnswer returns false', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }),
                fc.string({ minLength: 1 }),
                (a, b) => {
                    fc.pre(a.trim().toLowerCase() !== b.trim().toLowerCase());
                    expect(checkAnswer(a, b)).toBe(false);
                },
            ),
            { numRuns: 200 },
        );
    });
});

describe('Property test: checkAnswer with multiple accepted answers', () => {
    it('matches any answer in the array (case-insensitive, trimmed)', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
                fc.integer({ min: 0, max: 4 }),
                (answers, pickIndex) => {
                    const idx = pickIndex % answers.length;
                    const picked = answers[idx];
                    // Typing any accepted answer (with case/whitespace variation) should be correct
                    expect(checkAnswer("  " + picked.toUpperCase() + "  ", answers)).toBe(true);
                },
            ),
            { numRuns: 200 },
        );
    });

    it('rejects answers not in the array', () => {
        fc.assert(
            fc.property(
                fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
                fc.string({ minLength: 1 }),
                (answers, userAnswer) => {
                    const normalizedUser = userAnswer.trim().toLowerCase();
                    const matchesAny = answers.some(a => a.trim().toLowerCase() === normalizedUser);
                    fc.pre(!matchesAny);
                    expect(checkAnswer(userAnswer, answers)).toBe(false);
                },
            ),
            { numRuns: 200 },
        );
    });
});
