import { randomUUID } from "node:crypto";
import { Quiz } from "../models/quiz.js";
import { Store } from "../stores/store-interface.js";

/**
 * Quiz service — manages quiz attempts.
 */
export class QuizService {
    constructor(private store: Store<Quiz>) { }

    createQuiz(user_id: string, deck_id: string, mode: "sequential" | "random"): Quiz {
        const quiz: Quiz = {
            id: randomUUID(),
            user_id,
            deck_id,
            start_time: new Date().toISOString(),
            time_length: 0,
            correct_count: 0,
            incorrect_count: 0,
            mode,
        };
        return this.store.create(quiz);
    }

    finishQuiz(quiz_id: string, correct_count: number, incorrect_count: number, time_length: number): Quiz | null {
        return this.store.update(quiz_id, { correct_count, incorrect_count, time_length });
    }

    readQuiz(id: string): Quiz | null {
        return this.store.read(id);
    }

    getQuizHistory(user_id: string): Quiz[] {
        return this.store.list().filter((q) => q.user_id === user_id);
    }
}
