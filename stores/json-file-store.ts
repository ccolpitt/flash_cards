import * as fs from "node:fs";
import * as path from "node:path";
import { Store } from "./store-interface.js";

/**
 * A generic JSON-file-backed store.
 *
 * Each "table" is a single JSON file in the data/ directory.
 * The file contains an array of records. Each record must have an `id` field (string).
 *
 * To swap to a real database later, implement Store<T> with a different class
 * (e.g., SqliteStore, PostgresStore) and inject it where JsonFileStore is used.
 */
export class JsonFileStore<T extends { id: string }> implements Store<T> {
    private filePath: string;

    constructor(fileName: string) {
        const dataDir = path.resolve("data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        this.filePath = path.join(dataDir, fileName);
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, "[]");
        }
    }

    private readAll(): T[] {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        return JSON.parse(raw);
    }

    private writeAll(items: T[]): void {
        fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2));
    }

    create(item: T): T {
        const items = this.readAll();
        items.push(item);
        this.writeAll(items);
        return item;
    }

    read(id: string): T | null {
        const items = this.readAll();
        return items.find((item) => item.id === id) ?? null;
    }

    update(id: string, fields: Partial<T>): T | null {
        const items = this.readAll();
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) return null;
        items[index] = { ...items[index], ...fields, id }; // id is immutable
        this.writeAll(items);
        return items[index];
    }

    delete(id: string): boolean {
        const items = this.readAll();
        const filtered = items.filter((item) => item.id !== id);
        if (filtered.length === items.length) return false;
        this.writeAll(filtered);
        return true;
    }

    list(): T[] {
        return this.readAll();
    }
}
