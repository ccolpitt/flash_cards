export type EvaluationMode = 'binary' | 'percentage';

export type Score =
    | { mode: 'binary'; correct: boolean }
    | { mode: 'percentage'; value: number };
