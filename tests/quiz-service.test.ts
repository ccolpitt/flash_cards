import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { QuizService } from "../services/quiz-service.js";
import { JsonFileStore } from "../stores/json-file-store.js";
import { Quiz } from "../models/quiz.js";

const TEST_DATA_DIR = path.resolve("data");
const TEST_FILE = "quizzes-test.json";

function freshService(): QuizService {
    const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const store = new JsonFileStore<Quiz>(TEST_FILE);
    return new QuizService(store);
}

describe("Quiz CRUD", () => {
    let service: QuizService;

    beforeEach(() => {
        service = freshService();
    });

    afterEach(() => {
        const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    describe("createQuiz", () => {
        it("creates a quiz with user_id, deck_id, mode, and start_time", () => {
            const quiz = service.createQuiz("u1", "d1", "random");

            expect(quiz.user_id).toBe("u1");
            expect(quiz.deck_id).toBe("d1");
            expect(quiz.mode).toBe("random");
            expect(quiz.start_time).toBeDefined();
            expect(quiz.correct_count).toBe(0);
            expect(quiz.incorrect_count).toBe(0);
            expect(quiz.time_length).toBe(0);
        });
    });

    describe("finishQuiz", () => {
        it("updates correct_count, incorrect_count, and time_length", () => {
            const quiz = service.createQuiz("u1", "d1", "sequential");
            const finished = service.finishQuiz(quiz.id, 8, 2, 120);

            expect(finished!.correct_count).toBe(8);
            expect(finished!.incorrect_count).toBe(2);
            expect(finished!.time_length).toBe(120);
        });

        it("returns null for non-existent quiz", () => {
            expect(service.finishQuiz("fake", 0, 0, 0)).toBeNull();
        });
    });

    describe("readQuiz", () => {
        it("returns the quiz when it exists", () => {
            const created = service.createQuiz("u1", "d1", "random");
            const found = service.readQuiz(created.id);
            expect(found!.id).toBe(created.id);
        });

        it("returns null for non-existent id", () => {
            expect(service.readQuiz("fake")).toBeNull();
        });
    });

    describe("getQuizHistory", () => {
        it("returns all quizzes for a user", () => {
            service.createQuiz("u1", "d1", "random");
            service.createQuiz("u1", "d2", "sequential");
            service.createQuiz("u2", "d1", "random");

            const history = service.getQuizHistory("u1");
            expect(history.length).toBe(2);
            expect(history.every((q) => q.user_id === "u1")).toBe(true);
        });

        it("returns empty array for user with no quizzes", () => {
            expect(service.getQuizHistory("nobody")).toEqual([]);
        });
    });
});
