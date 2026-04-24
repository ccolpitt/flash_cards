import { Score } from './score.js';

export interface AnswerEvent {
    id: string;
    cardId: string;
    userId: string;
    sessionId: string;
    response: string;
    score: Score;
    timestamp: string;
}
