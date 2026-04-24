export type StudyScope =
    | { type: 'deck'; deckId: string }
    | { type: 'class'; classId: string }
    | { type: 'curriculum'; curriculumId: string }
    | { type: 'all' };

export interface Session {
    id: string;
    userId: string;
    scope: StudyScope;
    startedAt: string;
    currentStreak: number;
    presentedCardIds: Set<string>;
    expungedCardIds: Set<string>;
    skippedCardIds: Set<string>;
    incorrectCardIds: Map<string, number>;
}
