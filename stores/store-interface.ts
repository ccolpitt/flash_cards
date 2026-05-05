/**
 * Generic store interface — the "repository pattern."
 *
 * All CRUD operations go through this interface.
 * Currently backed by JSON files, but can be swapped to SQLite, Postgres, etc.
 * Just implement this interface with a different backend.
 */
export interface Store<T> {
    create(item: T): T;
    read(id: string): T | null;
    update(id: string, fields: Partial<T>): T | null;
    delete(id: string): boolean;
    list(): T[];
}
