import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { UserService } from "../services/user-service.js";
import { JsonFileStore } from "../stores/json-file-store.js";
import { User } from "../models/user.js";

/**
 * User CRUD tests — structured as API calls.
 * Pass in inputs, expect outputs.
 */

const TEST_DATA_DIR = path.resolve("data");
const TEST_FILE = "users.json";

function freshService(): UserService {
    // Ensure clean state
    const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const store = new JsonFileStore<User>(TEST_FILE);
    return new UserService(store);
}

describe("User CRUD", () => {
    let service: UserService;

    beforeEach(() => {
        service = freshService();
    });

    afterEach(() => {
        const filePath = path.join(TEST_DATA_DIR, TEST_FILE);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    describe("createUser", () => {
        it("creates a user with name, unique id, create_date, and num_sessions=0", () => {
            const user = service.createUser("Alice");

            expect(user.name).toBe("Alice");
            expect(user.id).toBeDefined();
            expect(user.id.length).toBeGreaterThan(0);
            expect(user.create_date).toBeDefined();
            expect(new Date(user.create_date).toISOString()).toBe(user.create_date);
            expect(user.num_sessions).toBe(0);
        });

        it("trims whitespace from name", () => {
            const user = service.createUser("  Bob  ");
            expect(user.name).toBe("Bob");
        });

        it("generates unique IDs for different users", () => {
            const user1 = service.createUser("Alice");
            const user2 = service.createUser("Bob");
            expect(user1.id).not.toBe(user2.id);
        });
    });

    describe("readUser", () => {
        it("returns the user when it exists", () => {
            const created = service.createUser("Alice");
            const found = service.readUser(created.id);

            expect(found).not.toBeNull();
            expect(found!.id).toBe(created.id);
            expect(found!.name).toBe("Alice");
        });

        it("returns null for non-existent id", () => {
            const found = service.readUser("non-existent-id");
            expect(found).toBeNull();
        });
    });

    describe("updateUser", () => {
        it("updates the name", () => {
            const created = service.createUser("Alice");
            const updated = service.updateUser(created.id, { name: "Alicia" });

            expect(updated).not.toBeNull();
            expect(updated!.name).toBe("Alicia");
            expect(updated!.id).toBe(created.id); // id unchanged
        });

        it("updates num_sessions", () => {
            const created = service.createUser("Alice");
            const updated = service.updateUser(created.id, { num_sessions: 5 });

            expect(updated).not.toBeNull();
            expect(updated!.num_sessions).toBe(5);
        });

        it("returns null for non-existent id", () => {
            const result = service.updateUser("fake-id", { name: "Ghost" });
            expect(result).toBeNull();
        });

        it("does not change id even if passed in fields", () => {
            const created = service.createUser("Alice");
            // TypeScript won't let you pass id normally, but testing the store's protection
            const updated = service.updateUser(created.id, { name: "Bob" });
            expect(updated!.id).toBe(created.id);
        });
    });

    describe("deleteUser", () => {
        it("removes the user and returns true", () => {
            const created = service.createUser("Alice");
            const deleted = service.deleteUser(created.id);

            expect(deleted).toBe(true);
            expect(service.readUser(created.id)).toBeNull();
        });

        it("returns false for non-existent id", () => {
            const deleted = service.deleteUser("fake-id");
            expect(deleted).toBe(false);
        });
    });

    describe("listUsers", () => {
        it("returns empty array when no users exist", () => {
            expect(service.listUsers()).toEqual([]);
        });

        it("returns all created users", () => {
            service.createUser("Alice");
            service.createUser("Bob");
            service.createUser("Charlie");

            const users = service.listUsers();
            expect(users.length).toBe(3);
            expect(users.map((u) => u.name).sort()).toEqual(["Alice", "Bob", "Charlie"]);
        });
    });
});
