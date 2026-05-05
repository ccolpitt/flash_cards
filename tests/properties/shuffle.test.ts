import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { shuffle } from '../../quiz.js';

/**
 * Feature: flashcard-mvp
 * Property test: shuffle correctness
 *
 * shuffle must preserve array length, preserve all elements,
 * and produce a valid permutation of the original array.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */

describe('Property test: shuffle preserves array length and all elements (is a valid permutation)', () => {
    it('shuffle preserves array length: shuffle(arr).length === arr.length for any array', () => {
        /**
         * Property: Shuffle preserves length
         * shuffle(cards).length === cards.length for any input
         *
         * **Validates: Requirements 3.1**
         */
        fc.assert(
            fc.property(
                fc.array(fc.integer()),
                (arr) => {
                    expect(shuffle(arr).length).toBe(arr.length);
                },
            ),
            { numRuns: 200 },
        );
    });

    it('shuffle preserves all elements: every element in the original appears exactly once in the shuffled array', () => {
        /**
         * Property: Shuffle preserves elements
         * Every card in the original array appears exactly once in the shuffled array
         *
         * **Validates: Requirements 3.2**
         */
        fc.assert(
            fc.property(
                fc.array(fc.integer()),
                (arr) => {
                    const shuffled = shuffle(arr);
                    const sortedOriginal = [...arr].sort((a, b) => a - b);
                    const sortedShuffled = [...shuffled].sort((a, b) => a - b);
                    expect(sortedShuffled).toEqual(sortedOriginal);
                },
            ),
            { numRuns: 200 },
        );
    });

    it('shuffle is a valid permutation: the shuffled array is a rearrangement of the original', () => {
        /**
         * Property: Shuffle is a permutation
         * The shuffled array is a rearrangement of the original, not a subset or superset
         *
         * **Validates: Requirements 3.3**
         */
        fc.assert(
            fc.property(
                fc.array(fc.string(), { minLength: 1 }),
                (arr) => {
                    const shuffled = shuffle(arr);
                    // Same length
                    expect(shuffled.length).toBe(arr.length);
                    // Same elements with same frequencies
                    const countOriginal = new Map<string, number>();
                    for (const item of arr) {
                        countOriginal.set(item, (countOriginal.get(item) ?? 0) + 1);
                    }
                    const countShuffled = new Map<string, number>();
                    for (const item of shuffled) {
                        countShuffled.set(item, (countShuffled.get(item) ?? 0) + 1);
                    }
                    expect(countShuffled).toEqual(countOriginal);
                },
            ),
            { numRuns: 200 },
        );
    });

    it('shuffle does not mutate the original array', () => {
        /**
         * Property: Shuffle non-mutation
         * The original array is unchanged after calling shuffle
         *
         * **Validates: Requirements 3.1**
         */
        fc.assert(
            fc.property(
                fc.array(fc.integer()),
                (arr) => {
                    const copy = [...arr];
                    shuffle(arr);
                    expect(arr).toEqual(copy);
                },
            ),
            { numRuns: 200 },
        );
    });
});
