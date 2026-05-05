import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { SessionService } from "../services/session-service.js";
import { JsonFileStore } from "../stores/json-file-store.js";
import { Session } from "../models/session.js";

const TEST_DATA_DIR = path.resolve("data");
const TEST_FILE = "sessions-test.json";

function freshService(): SessionService {
    const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const store = new JsonFileStore<Session>(TEST_FILE);
    return new SessionService(store);
}

describe("Session CRUD", () => {
    let service: SessionService;

    beforeEach(() => {
        service = freshService();
    });

    afterEach(() => {
        const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    describe("createSession", () => {
        it("creates a session with user_id, start_time, and empty quiz_ids", () => {
            const session = service.createSession("u1");

            expect(session.user_id).toBe("u1");
            expect(session.start_time).toBeDefined();
            expect(session.quiz_ids).toEqual([]);
            expect(session.id).toBeDefined();
        });
    });

    describe("addQuizToSession", () => {
        it("appends quiz_id to the session", () => {
            const session = service.createSession("u1");
            const updated = service.addQuizToSession(session.id, "q1");

            expect(updated!.quiz_ids).toEqual(["q1"]);
        });

        it("appends multiple quiz_ids", () => {
            const session = service.createSession("u1");
            service.addQuizToSession(session.id, "q1");
            const updated = service.addQuizToSession(session.id, "q2");

            expect(updated!.quiz_ids).toEqual(["q1", "q2"]);
        });

        it("returns null for non-existent session", () => {
            expect(service.addQuizToSession("fake", "q1")).toBeNull();
        });
    });

    describe("getUserSessions", () => {
        it("returns sessions for the given user", () => {
            service.createSession("u1");
            service.createSession("u1");
            service.createSession("u2");

            const sessions = service.getUserSessions("u1");
            expect(sessions.length).toBe(2);
        });

        it("returns empty for user with no sessions", () => {
            expect(service.getUserSessions("nobody")).toEqual([]);
        });
    });
});
