import * as readline from "node:readline";
import { JsonFileStore } from "./stores/json-file-store.js";
import { User } from "./models/user.js";
import { Card } from "./models/card.js";
import { Deck } from "./models/deck.js";
import { Quiz } from "./models/quiz.js";
import { Session } from "./models/session.js";
import { CardStats } from "./models/card-stats.js";
import { UserService } from "./services/user-service.js";
import { CardService } from "./services/card-service.js";
import { DeckService } from "./services/deck-service.js";
import { QuizService } from "./services/quiz-service.js";
import { SessionService } from "./services/session-service.js";
import { CardStatsService } from "./services/card-stats-service.js";
import { QuizOrchestrator } from "./services/quiz-orchestrator.js";
import { getLastUserId, setLastUserId } from "./services/app-state-service.js";

// --- Initialize services ---
const userService = new UserService(new JsonFileStore<User>("users.json"));
const cardService = new CardService(new JsonFileStore<Card>("cards.json"));
const deckService = new DeckService(new JsonFileStore<Deck>("decks.json"));
const quizService = new QuizService(new JsonFileStore<Quiz>("quizzes.json"));
const sessionService = new SessionService(new JsonFileStore<Session>("sessions.json"));
const cardStatsService = new CardStatsService(new JsonFileStore<CardStats>("card-stats.json"));

// --- CLI helpers ---
function createRL(): readline.Interface {
    return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl: readline.Interface, prompt: string): Promise<string> {
    return new Promise((resolve) => rl.question(prompt, resolve));
}

// --- Answer checking ---
export function checkAnswer(userAnswer: string, correctAnswers: string | string[]): boolean {
    const normalized = userAnswer.trim().toLowerCase();
    const answers = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
    return answers.some((a) => normalized === a.trim().toLowerCase());
}

// --- Login flow (6b) ---
async function login(rl: readline.Interface): Promise<User> {
    const lastUserId = getLastUserId();

    if (lastUserId) {
        const lastUser = userService.readUser(lastUserId);
        if (lastUser) {
            console.log(`\nWelcome back, ${lastUser.name}!`);
            const choice = await ask(rl, "Press Enter to continue, or type 'switch' to login as someone else: ");
            if (choice.trim().toLowerCase() !== "switch") {
                return lastUser;
            }
        }
    }

    // Login as existing or create new
    console.log("\n--- Login ---");
    const users = userService.listUsers();
    if (users.length > 0) {
        console.log("Existing users:");
        users.forEach((u, i) => console.log(`  ${i + 1}. ${u.name}`));
        console.log(`  ${users.length + 1}. Create new user`);

        const choice = await ask(rl, "Choose a number: ");
        const num = parseInt(choice.trim());
        if (num >= 1 && num <= users.length) {
            const user = users[num - 1];
            setLastUserId(user.id);
            return user;
        }
    }

    // Create new user
    const name = await ask(rl, "Enter your name: ");
    const newUser = userService.createUser(name);
    setLastUserId(newUser.id);
    console.log(`Created user: ${newUser.name}`);
    return newUser;
}

// --- Deck selection (6c) ---
async function selectDeck(rl: readline.Interface, user: User): Promise<Deck | null> {
    console.log("\n--- Select a Deck ---");

    // Show last 5 decks played
    const history = quizService.getQuizHistory(user.id);
    const recentDeckIds = [...new Set(history.map((q) => q.deck_id))].slice(-5);
    const recentDecks = recentDeckIds
        .map((id) => deckService.readDeck(id))
        .filter((d): d is Deck => d !== null);

    if (recentDecks.length > 0) {
        console.log("Recent decks:");
        recentDecks.forEach((d, i) => {
            const mastered = isMastered(user.id, d.id) ? " ✓ Mastered" : "";
            console.log(`  ${i + 1}. ${d.name} (${d.card_count} cards)${mastered}`);
        });
    }

    // Show all decks
    const allDecks = deckService.listDecks();
    if (allDecks.length === 0) {
        console.log("No decks available. Run generate-cards.ts and generate-deck.ts first.");
        return null;
    }

    console.log("\nAll decks:");
    allDecks.forEach((d, i) => {
        const mastered = isMastered(user.id, d.id) ? " ✓ Mastered" : "";
        console.log(`  ${i + 1}. ${d.name} (${d.card_count} cards)${mastered}`);
    });

    const searchOption = allDecks.length > 5 ? "\nOr type 's' to search by name.\n" : "\n";
    const choice = await ask(rl, `${searchOption}Choose a deck number: `);

    if (choice.trim().toLowerCase() === "s") {
        const query = await ask(rl, "Search deck name: ");
        const matches = allDecks.filter((d) =>
            d.name.toLowerCase().includes(query.trim().toLowerCase())
        );
        if (matches.length === 0) {
            console.log("No decks found.");
            return null;
        }
        matches.forEach((d, i) => console.log(`  ${i + 1}. ${d.name}`));
        const pick = await ask(rl, "Choose: ");
        const idx = parseInt(pick.trim()) - 1;
        return matches[idx] ?? null;
    }

    const idx = parseInt(choice.trim()) - 1;
    return allDecks[idx] ?? null;
}

// --- Mastery check (6e) ---
function isMastered(user_id: string, deck_id: string): boolean {
    const history = quizService.getQuizHistory(user_id);
    const deckQuizzes = history.filter((q) => q.deck_id === deck_id);
    if (deckQuizzes.length === 0) return false;
    const lastQuiz = deckQuizzes[deckQuizzes.length - 1];
    return lastQuiz.incorrect_count === 0 && lastQuiz.correct_count > 0;
}

// --- Main loop ---
async function main(): Promise<void> {
    const rl = createRL();

    try {
        // Login
        const user = await login(rl);

        // Create session
        const session = sessionService.createSession(user.id);
        userService.updateUser(user.id, { num_sessions: user.num_sessions + 1 });

        // Deck selection
        const deck = await selectDeck(rl, user);
        if (!deck) {
            console.log("No deck selected. Goodbye!");
            return;
        }

        // Quiz mode
        const modeChoice = await ask(rl, "\nSequential or Random? (s/r): ");
        const mode: "sequential" | "random" = modeChoice.trim().toLowerCase() === "r" ? "random" : "sequential";

        // Load cards for the deck
        const cards = deck.card_ids
            .map((id) => cardService.readCard(id))
            .filter((c): c is Card => c !== null);

        if (cards.length === 0) {
            console.log("This deck has no cards!");
            return;
        }

        // Create quiz record
        const quiz = quizService.createQuiz(user.id, deck.id, mode);
        sessionService.addQuizToSession(session.id, quiz.id);

        // Run the orchestrator
        const orchestrator = new QuizOrchestrator(cards, mode);

        console.log(`\nStarting quiz: ${deck.name} (${cards.length} cards, ${mode} mode)\n`);

        while (!orchestrator.isDone()) {
            const card = orchestrator.nextCard()!;
            const answer = await ask(rl, `Q: ${card.question}\nYour answer (or "q" to quit): `);

            if (answer.trim().toLowerCase() === "q" || answer.trim().toLowerCase() === "quit") {
                console.log("\nQuitting early...");
                break;
            }

            const correct = checkAnswer(answer, card.answers);
            console.log(correct ? "✓ Correct!" : `✗ Wrong. Answer: ${card.answers[0]}`);
            console.log();

            orchestrator.advance(correct);
            cardStatsService.recordImpression(user.id, card.id, correct);
        }

        // Finish quiz
        quizService.finishQuiz(
            quiz.id,
            orchestrator.correctCount,
            orchestrator.incorrectCount,
            orchestrator.elapsedSeconds
        );

        // Summary
        console.log("─".repeat(40));
        console.log(`Results: ${orchestrator.correctCount}/${orchestrator.correctCount + orchestrator.incorrectCount} correct (${orchestrator.percentCorrect}%)`);
        console.log(`Time: ${orchestrator.elapsedSeconds}s`);

        if (orchestrator.incorrectCount === 0 && orchestrator.correctCount === cards.length) {
            console.log("🎉 Perfect score! Deck mastered!");
        }

        console.log("─".repeat(40));
    } finally {
        rl.close();
    }
}

// Only run when executed directly
const isDirectRun =
    process.argv[1] &&
    (process.argv[1].endsWith("quiz.ts") || process.argv[1].endsWith("quiz"));

if (isDirectRun) {
    main().catch(console.error);
}
