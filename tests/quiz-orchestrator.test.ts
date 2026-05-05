import { describe, it, expect } from "vitest";
import { QuizOrchestrator } from "../services/quiz-orchestrator.js";
import { Card } from "../models/card.js";

const sampleCards: Card[] = [
    { id: "c1", question: "What is 2+2?", answers: ["4"], version_id: 1 },
    { id: "c2", question: "Capital of France?", answers: ["Paris"], version_id: 1 },
    { id: "c3", question: "Chemical symbol for water?", answers: ["H2O"], version_id: 1 },
];

describe("QuizOrchestrator", () => {
    describe("sequential mode", () => {
        it("presents cards in order", () => {
            const orch = new QuizOrchestrator(sampleCards, "sequential");

            expect(orch.nextCard()!.id).toBe("c1");
            orch.advance(true);
            expect(orch.nextCard()!.id).toBe("c2");
            orch.advance(false);
            expect(orch.nextCard()!.id).toBe("c3");
            orch.advance(true);
        });
    });

    describe("isDone", () => {
        it("returns false when cards remain", () => {
            const orch = new QuizOrchestrator(sampleCards, "sequential");
            expect(orch.isDone()).toBe(false);
        });

        it("returns true when all cards have been shown", () => {
            const orch = new QuizOrchestrator(sampleCards, "sequential");
            orch.advance(true);
            orch.advance(true);
            orch.advance(true);
            expect(orch.isDone()).toBe(true);
        });

        it("nextCard returns null when done", () => {
            const orch = new QuizOrchestrator(sampleCards, "sequential");
            orch.advance(true);
            orch.advance(true);
            orch.advance(true);
            expect(orch.nextCard()).toBeNull();
        });
    });

    describe("scoring", () => {
        it("tracks correct and incorrect counts", () => {
            const orch = new QuizOrchestrator(sampleCards, "sequential");
            orch.advance(true);
            orch.advance(false);
            orch.advance(true);

            expect(orch.correctCount).toBe(2);
            expect(orch.incorrectCount).toBe(1);
        });

        it("calculates percent correct", () => {
            const orch = new QuizOrchestrator(sampleCards, "sequential");
            orch.advance(true);
            orch.advance(true);
            orch.advance(false);

            expect(orch.percentCorrect).toBe(67);
        });

        it("returns 0% when no answers given", () => {
            const orch = new QuizOrchestrator(sampleCards, "sequential");
            expect(orch.percentCorrect).toBe(0);
        });
    });

    describe("random mode", () => {
        it("presents all cards (same count)", () => {
            const orch = new QuizOrchestrator(sampleCards, "random");
            const seen: string[] = [];

            while (!orch.isDone()) {
                seen.push(orch.nextCard()!.id);
                orch.advance(true);
            }

            expect(seen.length).toBe(3);
            expect(seen.sort()).toEqual(["c1", "c2", "c3"]);
        });
    });

    describe("totalCards", () => {
        it("returns the total number of cards in the deck", () => {
            const orch = new QuizOrchestrator(sampleCards, "sequential");
            expect(orch.totalCards).toBe(3);
        });
    });

    describe("elapsedSeconds", () => {
        it("returns a non-negative number", () => {
            const orch = new QuizOrchestrator(sampleCards, "sequential");
            expect(orch.elapsedSeconds).toBeGreaterThanOrEqual(0);
        });
    });
});
