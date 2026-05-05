import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { CardStatsService } from "../services/card-stats-service.js";
import { JsonFileStore } from "../stores/json-file-store.js";
import { CardStats } from "../models/card-stats.js";

const TEST_DATA_DIR = path.resolve("data");
const TEST_FILE = "card-stats-test.json";

function freshService(): CardStatsService {
    const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const store = new JsonFileStore<CardStats>(TEST_FILE);
    return new CardStatsService(store);
}

describe("CardStats", () => {
    let service: CardStatsService;

    beforeEach(() => {
        service = freshService();
    });

    afterEach(() => {
        const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    describe("getCardStats", () => {
        it("returns default zeros for unseen card", () => {
            const stats = service.getCardStats("user1", "card1");

            expect(stats.impressions).toBe(0);
            expect(stats.correct_count).toBe(0);
            expect(stats.first_impression).toBe("");
            expect(stats.last_n_correct).toBe(0);
            expect(stats.last_n_incorrect).toBe(0);
        });

        it("returns persisted stats after recording", () => {
            service.recordImpression("user1", "card1", true);
            const stats = service.getCardStats("user1", "card1");

            expect(stats.impressions).toBe(1);
            expect(stats.correct_count).toBe(1);
        });
    });

    describe("recordImpression", () => {
        it("creates stats on first impression (correct)", () => {
            const stats = service.recordImpression("u1", "c1", true);

            expect(stats.impressions).toBe(1);
            expect(stats.correct_count).toBe(1);
            expect(stats.first_impression).toBeDefined();
            expect(stats.last_n_correct).toBe(1);
            expect(stats.last_n_incorrect).toBe(0);
        });

        it("creates stats on first impression (incorrect)", () => {
            const stats = service.recordImpression("u1", "c1", false);

            expect(stats.impressions).toBe(1);
            expect(stats.correct_count).toBe(0);
            expect(stats.last_n_correct).toBe(0);
            expect(stats.last_n_incorrect).toBe(1);
        });

        it("accumulates impressions and correct_count", () => {
            service.recordImpression("u1", "c1", true);
            service.recordImpression("u1", "c1", false);
            const stats = service.recordImpression("u1", "c1", true);

            expect(stats.impressions).toBe(3);
            expect(stats.correct_count).toBe(2);
        });

        it("tracks last_n within window of 10", () => {
            // Record 10 correct
            for (let i = 0; i < 10; i++) {
                service.recordImpression("u1", "c1", true);
            }
            let stats = service.getCardStats("u1", "c1");
            expect(stats.last_n_correct).toBe(10);
            expect(stats.last_n_incorrect).toBe(0);

            // 11th impression (incorrect) should keep window at 10
            stats = service.recordImpression("u1", "c1", false);
            expect(stats.last_n_correct + stats.last_n_incorrect).toBeLessThanOrEqual(10);
            expect(stats.last_n_incorrect).toBeGreaterThanOrEqual(1);
        });
    });

    describe("getUserStats", () => {
        it("returns only stats for the given user", () => {
            service.recordImpression("u1", "c1", true);
            service.recordImpression("u1", "c2", false);
            service.recordImpression("u2", "c1", true);

            const u1Stats = service.getUserStats("u1");
            expect(u1Stats.length).toBe(2);
            expect(u1Stats.every((s) => s.user_id === "u1")).toBe(true);
        });

        it("returns empty array for user with no stats", () => {
            expect(service.getUserStats("nobody")).toEqual([]);
        });
    });
});
