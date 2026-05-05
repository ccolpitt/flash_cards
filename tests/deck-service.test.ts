import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { DeckService } from "../services/deck-service.js";
import { JsonFileStore } from "../stores/json-file-store.js";
import { Deck } from "../models/deck.js";

const TEST_DATA_DIR = path.resolve("data");
const TEST_FILE = "decks-test.json";

function freshService(): DeckService {
    const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const store = new JsonFileStore<Deck>(TEST_FILE);
    return new DeckService(store);
}

describe("Deck CRUD", () => {
    let service: DeckService;

    beforeEach(() => {
        service = freshService();
    });

    afterEach(() => {
        const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    describe("createDeck", () => {
        it("creates a deck with name, card_ids, card_count, and version_id=1", () => {
            const deck = service.createDeck("Math Basics", ["c1", "c2", "c3"]);

            expect(deck.name).toBe("Math Basics");
            expect(deck.card_ids).toEqual(["c1", "c2", "c3"]);
            expect(deck.card_count).toBe(3);
            expect(deck.version_id).toBe(1);
            expect(deck.id).toBeDefined();
        });

        it("trims whitespace from name", () => {
            const deck = service.createDeck("  Science  ", ["c1"]);
            expect(deck.name).toBe("Science");
        });

        it("handles empty card_ids", () => {
            const deck = service.createDeck("Empty Deck", []);
            expect(deck.card_ids).toEqual([]);
            expect(deck.card_count).toBe(0);
        });
    });

    describe("readDeck", () => {
        it("returns the deck when it exists", () => {
            const created = service.createDeck("Test", ["c1"]);
            const found = service.readDeck(created.id);

            expect(found).not.toBeNull();
            expect(found!.name).toBe("Test");
        });

        it("returns null for non-existent id", () => {
            expect(service.readDeck("fake")).toBeNull();
        });
    });

    describe("updateDeck", () => {
        it("updates name and increments version_id", () => {
            const created = service.createDeck("Old", ["c1"]);
            const updated = service.updateDeck(created.id, { name: "New" });

            expect(updated!.name).toBe("New");
            expect(updated!.version_id).toBe(2);
            expect(updated!.card_ids).toEqual(["c1"]); // unchanged
        });

        it("updates card_ids and recalculates card_count", () => {
            const created = service.createDeck("Deck", ["c1"]);
            const updated = service.updateDeck(created.id, { card_ids: ["c1", "c2", "c3", "c4"] });

            expect(updated!.card_ids).toEqual(["c1", "c2", "c3", "c4"]);
            expect(updated!.card_count).toBe(4);
            expect(updated!.version_id).toBe(2);
        });

        it("returns null for non-existent id", () => {
            expect(service.updateDeck("fake", { name: "X" })).toBeNull();
        });
    });

    describe("deleteDeck", () => {
        it("removes the deck and returns true", () => {
            const created = service.createDeck("Deck", ["c1"]);
            expect(service.deleteDeck(created.id)).toBe(true);
            expect(service.readDeck(created.id)).toBeNull();
        });

        it("returns false for non-existent id", () => {
            expect(service.deleteDeck("fake")).toBe(false);
        });
    });

    describe("listDecks", () => {
        it("returns empty array when no decks exist", () => {
            expect(service.listDecks()).toEqual([]);
        });

        it("returns all created decks", () => {
            service.createDeck("D1", ["c1"]);
            service.createDeck("D2", ["c2"]);

            expect(service.listDecks().length).toBe(2);
        });
    });
});
