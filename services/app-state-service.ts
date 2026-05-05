import * as fs from "node:fs";
import * as path from "node:path";

/**
 * App state — persists lightweight app-level state (e.g., last logged-in user).
 * Stored in data/app-state.json.
 */

interface AppState {
    last_user_id: string | null;
}

const STATE_PATH = path.resolve("data", "app-state.json");

function ensureDataDir(): void {
    const dir = path.dirname(STATE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function getLastUserId(): string | null {
    ensureDataDir();
    if (!fs.existsSync(STATE_PATH)) return null;
    const state: AppState = JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));
    return state.last_user_id;
}

export function setLastUserId(user_id: string): void {
    ensureDataDir();
    const state: AppState = { last_user_id: user_id };
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}
