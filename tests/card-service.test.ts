import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { CardService } from "../services/card-service.js";
import { JsonFileStore } from "../stores/json-file-store.js";
import { Card } from "../models/card.js";

const TEST_DATA_DIR = path.resolve("data");
const TEST_FILE = "cards-test.json";

function freshService(): CardService {
    const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const store = new JsonFileStore<Card>(TEST_FILE);
    return new CardService(store);
}

describe("Card CRUD", () => {
    let service: CardService;

    beforeEach(() => {
        service = freshService();
    });

    afterEach(() => {
        const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    describe("createCard", () => {
        it("creates a card with question, answers, unique id, and version_id=1", () => {
            const card = service.createCard("What is 2+2?", ["4", "four"]);

            expect(card.question).toBe("What is 2+2?");
            expect(card.answers).toEqual(["4", "four"]);
            expect(card.id).toBeDefined();
            expect(card.id.length).toBeGreaterThan(0);
            expect(card.version_id).toBe(1);
        });

        it("trims whitespace from question and answers", () => {
            const card = service.createCard("  What is 2+2?  ", ["  4  ", " four "]);
            expect(card.question).toBe("What is 2+2?");
            expect(card.answers).toEqual(["4", "four"]);
        });

        it("filters out empty answers", () => {
            const card = service.createCard("Q?", ["yes", "", "  ", "no"]);
            expect(card.answers).toEqual(["yes", "no"]);
        });

        it("generates unique IDs", () => {
            const c1 = service.createCard("Q1?", ["A1"]);
            const c2 = service.createCard("Q2?", ["A2"]);
            expect(c1.id).not.toBe(c2.id);
        });
    });

    describe("readCard", () => {
        it("returns the card when it exists", () => {
            const created = service.createCard("Q?", ["A"]);
            const found = service.readCard(created.id);

            expect(found).not.toBeNull();
            expect(found!.question).toBe("Q?");
        });

        it("returns null for non-existent id", () => {
            expect(service.readCard("fake-id")).toBeNull();
        });
    });

    describe("updateCard", () => {
        it("updates question and increments version_id", () => {
            const created = service.createCard("Old Q?", ["A"]);
            const updated = service.updateCard(created.id, { question: "New Q?" });

            expect(updated!.question).toBe("New Q?");
            expect(updated!.version_id).toBe(2);
            expect(updated!.answers).toEqual(["A"]); // unchanged
        });

        it("updates answers and increments version_id", () => {
            const created = service.createCard("Q?", ["old"]);
            const updated = service.updateCard(created.id, { answers: ["new1", "new2"] });

            expect(updated!.answers).toEqual(["new1", "new2"]);
            expect(updated!.version_id).toBe(2);
        });

        it("increments version_id on each update", () => {
            const created = service.createCard("Q?", ["A"]);
            service.updateCard(created.id, { question: "Q2?" });
            const updated = service.updateCard(created.id, { question: "Q3?" });

            expect(updated!.version_id).toBe(3);
        });

        it("returns null for non-existent id", () => {
            expect(service.updateCard("fake", { question: "X?" })).toBeNull();
        });
    });

    describe("deleteCard", () => {
        it("removes the card and returns true", () => {
            const created = service.createCard("Q?", ["A"]);
            expect(service.deleteCard(created.id)).toBe(true);
            expect(service.readCard(created.id)).toBeNull();
        });

        it("returns false for non-existent id", () => {
            expect(service.deleteCard("fake")).toBe(false);
        });
    });

    describe("listCards", () => {
        it("returns empty array when no cards exist", () => {
            expect(service.listCards()).toEqual([]);
        });

        it("returns all created cards", () => {
            service.createCard("Q1?", ["A1"]);
            service.createCard("Q2?", ["A2"]);
            service.createCard("Q3?", ["A3"]);

            expect(service.listCards().length).toBe(3);
        });
    });
});
