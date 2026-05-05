/**
 * API client — all frontend-to-backend communication goes through here.
 * The frontend never touches business logic directly.
 */

const BASE = "/api";

async function request(path: string, options?: RequestInit) {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
    }
    if (res.status === 204) return null;
    return res.json();
}

// Users
export const api = {
    getLastUser: () => request("/users/last"),
    listUsers: () => request("/users"),
    createUser: (name: string) => request("/users", { method: "POST", body: JSON.stringify({ name }) }),
    loginUser: (id: string) => request(`/users/login/${id}`, { method: "POST" }),

    // Decks
    listDecks: () => request("/decks"),
    getModes: () => request("/decks/modes"),
    getDeckMastery: (deckId: string, userId: string) => request(`/decks/${deckId}/mastery?user_id=${userId}`),

    // Quiz
    startQuiz: (user_id: string, deck_id: string, mode: string) =>
        request("/quizzes/start", { method: "POST", body: JSON.stringify({ user_id, deck_id, mode }) }),
    getNextCard: (quizId: string) => request(`/quizzes/${quizId}/next`),
    submitAnswer: (quizId: string, answer: string) =>
        request(`/quizzes/${quizId}/answer`, { method: "POST", body: JSON.stringify({ answer }) }),
    finishQuiz: (quizId: string) => request(`/quizzes/${quizId}/finish`, { method: "POST" }),

    // Import
    importCsv: (deck_name: string, csv_content: string) =>
        request("/import/csv", { method: "POST", body: JSON.stringify({ deck_name, csv_content }) }),
};
