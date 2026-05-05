import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { saveResult } from '../../quiz.js';
import type { Result } from '../../quiz.js';

/**
 * Feature: flashcard-mvp
 * Property test: saveResult correctness
 *
 * saveResult must accumulate entries in results.json, auto-create the file
 * if it doesn't exist, and preserve result integrity (cardId, userAnswer,
 * correct, timestamp).
 *
 * **Validates: Requirements 5.1, 5.2, 5.3**
 */

/** Arbitrary that generates a valid Result object */
const resultArb: fc.Arbitrary<Result> = fc.record({
    cardId: fc.integer({ min: 1, max: 100 }),
    userAnswer: fc.string({ minLength: 1 }),
    correct: fc.boolean(),
    timestamp: fc.date().map((d) => d.toISOString()),
});

let tmpDir: string;

beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'save-result-test-'));
});

afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('Property test: results.json accumulates entries (N + 1 after saving one result)', () => {
    it('if a file has N entries, after calling saveResult once it has N+1 entries', () => {
        /**
         * Property: Results accumulate
         * If results.json had N entries before, it has N + 1 after saving one result.
         *
         * **Validates: Requirements 5.2**
         */
        fc.assert(
            fc.property(
                fc.array(resultArb, { minLength: 0, maxLength: 20 }),
                resultArb,
                (existingResults, newResult) => {
                    const filePath = path.join(tmpDir, `results-${Date.now()}-${Math.random()}.json`);
                    const n = existingResults.length;

                    // Seed the file with N existing entries
                    if (n > 0) {
                        fs.writeFileSync(filePath, JSON.stringify(existingResults, null, 2));
                    }

                    // Save one new result
                    saveResult(filePath, newResult);

                    // Read back and verify count
                    const saved: Result[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    expect(saved.length).toBe(n + 1);
                },
            ),
            { numRuns: 100 },
        );
    });
});

describe('Property test: results.json is created automatically if it does not exist', () => {
    it('saveResult creates the file with exactly 1 entry when the file does not exist', () => {
        /**
         * Property: Auto-creation
         * If the file doesn't exist, saveResult creates it with exactly 1 entry.
         *
         * **Validates: Requirements 5.3**
         */
        fc.assert(
            fc.property(resultArb, (result) => {
                const filePath = path.join(tmpDir, `new-${Date.now()}-${Math.random()}.json`);

                // File must not exist before the call
                expect(fs.existsSync(filePath)).toBe(false);

                saveResult(filePath, result);

                // File now exists with exactly 1 entry
                expect(fs.existsSync(filePath)).toBe(true);
                const saved: Result[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                expect(saved.length).toBe(1);
            }),
            { numRuns: 50 },
        );
    });
});

describe('Property test: every saved result has cardId, userAnswer, correct, and timestamp', () => {
    it('each result entry has cardId (1-100), non-null userAnswer, boolean correct, and valid ISO timestamp', () => {
        /**
         * Property: Result integrity
         * Every saved result has a valid cardId (1–100), a non-null userAnswer,
         * a boolean correct field, and a valid ISO timestamp.
         *
         * **Validates: Requirements 5.1**
         */
        fc.assert(
            fc.property(resultArb, (result) => {
                const filePath = path.join(tmpDir, `integrity-${Date.now()}-${Math.random()}.json`);

                saveResult(filePath, result);

                const saved: Result[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const entry = saved[0];

                // cardId is a number between 1 and 100
                expect(typeof entry.cardId).toBe('number');
                expect(entry.cardId).toBeGreaterThanOrEqual(1);
                expect(entry.cardId).toBeLessThanOrEqual(100);

                // userAnswer is a non-null string
                expect(entry.userAnswer).not.toBeNull();
                expect(typeof entry.userAnswer).toBe('string');

                // correct is a boolean
                expect(typeof entry.correct).toBe('boolean');

                // timestamp is a valid ISO 8601 string
                expect(typeof entry.timestamp).toBe('string');
                const parsed = new Date(entry.timestamp);
                expect(parsed.toISOString()).toBe(entry.timestamp);
            }),
            { numRuns: 100 },
        );
    });
});
