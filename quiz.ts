import * as fs from "node:fs";
import * as readline from "node:readline";

// --- Type Definitions (Task 2.1) ---

export interface Card {
    id: number;
    question: string;
    answers: string[];
}

export interface Result {
    cardId: number;
    userAnswer: string;
    correct: boolean;
    timestamp: string;
}

// --- Core Functions ---

/**
 * Load and parse cards from a JSON file.
 * Preconditions: File exists and contains a valid JSON array of Card objects.
 * Postconditions: Returns Card[] with all cards from the file.
 */
export function loadCards(path: string): Card[] {
    return JSON.parse(fs.readFileSync(path, "utf-8"));
}

/**
 * Check if the user's answer matches any of the accepted answers.
 * Comparison is case-insensitive and trims leading/trailing whitespace.
 */
export function checkAnswer(userAnswer: string, correctAnswers: string | string[]): boolean {
    const normalized = userAnswer.trim().toLowerCase();
    const answers = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
    return answers.some(a => normalized === a.trim().toLowerCase());
}

/**
 * Save a result entry to the results JSON file.
 * Reads existing results (or starts with an empty array), appends the new result, and writes back.
 */
export function saveResult(path: string, result: Result): void {
    let results: Result[] = [];
    if (fs.existsSync(path)) {
        results = JSON.parse(fs.readFileSync(path, "utf-8"));
    }
    results.push(result);
    fs.writeFileSync(path, JSON.stringify(results, null, 2));
}

// --- Shuffle (Fisher-Yates) ---

export function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// --- CLI Helpers ---

function createInterface(): readline.Interface {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

function ask(rl: readline.Interface, prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

// --- Main Loop (Task 2.5) ---

async function main(): Promise<void> {
    const cards = loadCards("cards.json");
    const rl = createInterface();

    try {
        // Ask sequential or random
        const mode = await ask(rl, "Sequential or Random? (s/r): ");
        const deck = mode === "r" ? shuffle(cards) : cards;

        let correct = 0;
        let answered = 0;
        for (const card of deck) {
            const answer = await ask(rl, `\nQ: ${card.question}\nYour answer (or "q" to quit): `);

            if (answer.trim().toLowerCase() === "q" || answer.trim().toLowerCase() === "quit") {
                console.log(`\nQuitting early. You got ${correct}/${answered} correct (${deck.length - answered} cards skipped).`);
                break;
            }

            const isCorrect = checkAnswer(answer, card.answers);

            console.log(isCorrect ? "✓ Correct!" : `✗ Wrong. Answer: ${card.answers[0]}`);
            if (isCorrect) correct++;
            answered++;

            saveResult("results.json", {
                cardId: card.id,
                userAnswer: answer,
                correct: isCorrect,
                timestamp: new Date().toISOString(),
            });
        }

        if (answered === deck.length) {
            console.log(`\nDone! You got ${correct}/${deck.length} correct.`);
        }
    } finally {
        rl.close();
    }
}

// Only run main when executed directly
const isDirectRun =
    process.argv[1] &&
    (process.argv[1].endsWith("quiz.ts") || process.argv[1].endsWith("quiz"));

if (isDirectRun) {
    main().catch(console.error);
}
