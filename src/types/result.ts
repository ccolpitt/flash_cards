export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export interface ValidationError {
    field: string;
    message: string;
}

export interface StorageError {
    operation: string;
    message: string;
}

export interface ParseError {
    line?: number;
    message: string;
}
