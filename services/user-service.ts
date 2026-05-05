import { randomUUID } from "node:crypto";
import { User } from "../models/user.js";
import { Store } from "../stores/store-interface.js";

/**
 * User service — CRUD operations for users.
 *
 * Takes a Store<User> so the backing storage can be swapped.
 */
export class UserService {
    constructor(private store: Store<User>) { }

    createUser(name: string): User {
        const user: User = {
            id: randomUUID(),
            name: name.trim(),
            create_date: new Date().toISOString(),
            num_sessions: 0,
        };
        return this.store.create(user);
    }

    readUser(id: string): User | null {
        return this.store.read(id);
    }

    updateUser(id: string, fields: { name?: string; num_sessions?: number }): User | null {
        const updates: Partial<User> = {};
        if (fields.name !== undefined) updates.name = fields.name.trim();
        if (fields.num_sessions !== undefined) updates.num_sessions = fields.num_sessions;
        return this.store.update(id, updates);
    }

    deleteUser(id: string): boolean {
        return this.store.delete(id);
    }

    listUsers(): User[] {
        return this.store.list();
    }
}
