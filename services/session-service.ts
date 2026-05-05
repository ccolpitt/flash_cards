import { randomUUID } from "node:crypto";
import { Session } from "../models/session.js";
import { Store } from "../stores/store-interface.js";

/**
 * Session service — manages login sessions.
 */
export class SessionService {
    constructor(private store: Store<Session>) { }

    createSession(user_id: string): Session {
        const session: Session = {
            id: randomUUID(),
            user_id,
            start_time: new Date().toISOString(),
            quiz_ids: [],
        };
        return this.store.create(session);
    }

    addQuizToSession(session_id: string, quiz_id: string): Session | null {
        const session = this.store.read(session_id);
        if (!session) return null;
        const quiz_ids = [...session.quiz_ids, quiz_id];
        return this.store.update(session_id, { quiz_ids });
    }

    readSession(id: string): Session | null {
        return this.store.read(id);
    }

    getUserSessions(user_id: string): Session[] {
        return this.store.list().filter((s) => s.user_id === user_id);
    }
}
