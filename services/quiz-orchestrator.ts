import { Card } from "../models/card.js";

/**
 * QuizOrchestrator — drives a single quiz through a deck of cards.
 *
 * Loads cards, orders them by mode, and exposes nextCard()/isDone().
 */
export class QuizOrchestrator {
    private cards: Card[];
    private index: number = 0;
    private _correctCount: number = 0;
    private _incorrectCount: number = 0;
    private _startTime: number;

    constructor(cards: Card[], mode: "sequential" | "random") {
        this.cards = mode === "random" ? shuffle(cards) : [...cards];
        this._startTime = Date.now();
    }

    nextCard(): Card | null {
        if (this.isDone()) return null;
        return this.cards[this.index];
    }

    advance(correct: boolean): void {
        if (correct) this._correctCount++;
        else this._incorrectCount++;
        this.index++;
    }

    isDone(): boolean {
        return this.index >= this.cards.length;
    }

    get correctCount(): number {
        return this._correctCount;
    }

    get incorrectCount(): number {
        return this._incorrectCount;
    }

    get totalCards(): number {
        return this.cards.length;
    }

    get elapsedSeconds(): number {
        return Math.round((Date.now() - this._startTime) / 1000);
    }

    get percentCorrect(): number {
        const answered = this._correctCount + this._incorrectCount;
        if (answered === 0) return 0;
        return Math.round((this._correctCount / answered) * 100);
    }
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
