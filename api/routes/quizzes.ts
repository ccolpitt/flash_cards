import { Router } from "express";
import { JsonFileStore } from "../../stores/json-file-store.js";
import { Card } from "../../models/card.js";
import { Deck } from "../../models/deck.js";
import { Quiz } from "../../models/quiz.js";
import { CardStats } from "../../models/card-stats.js";
import { CardService } from "../../services/card-service.js";
import { DeckService } from "../../services/deck-service.js";
import { QuizService } from "../../services/quiz-service.js";
import { CardStatsService } from "../../services/card-stats-service.js";
import { QuizOrchestrator } from "../../services/quiz-orchestrator.js";

const cardService = new CardService(new JsonFileStore<Card>("cards.json"));
const deckService = new DeckService(new JsonFileStore<Deck>("decks.json"));
const quizService = new QuizService(new JsonFileStore<Quiz>("quizzes.json"));
const cardStatsService = new CardStatsService(new JsonFileStore<CardStats>("card-stats.json"));

export const quizRoutes = Router();

// In-memory orchestrators for active quizzes
const activeOrchestrators = new Map<string, QuizOrchestrator>();

// POST /api/quizzes/start — start a new quiz
quizRoutes.post("/start", (req, res) => {
    const { user_id, deck_id, mode } = req.body;
    if (!user_id || !deck_id || !mode) {
        return res.status(400).json({ error: "user_id, deck_id, and mode required" });
    }

    const deck = deckService.readDeck(deck_id);
    if (!deck) return res.status(404).json({ error: "deck not found" });

    const cards = deck.card_ids
        .map((id) => cardService.readCard(id))
        .filter((c): c is Card => c !== null);

    if (cards.length === 0) {
        return res.status(400).json({ error: "deck has no cards" });
    }

    const quiz = quizService.createQuiz(user_id, deck_id, mode);
    const orchestrator = new QuizOrchestrator(cards, mode);
    activeOrchestrators.set(quiz.id, orchestrator);

    res.status(201).json({
        quiz_id: quiz.id,
        total_cards: orchestrator.totalCards,
        mode,
    });
});

// GET /api/quizzes/:id/next — get next card
quizRoutes.get("/:id/next", (req, res) => {
    const orchestrator = activeOrchestrators.get(req.params.id);
    if (!orchestrator) return res.status(404).json({ error: "quiz not found or already finished" });

    if (orchestrator.isDone()) {
        return res.json({ done: true, card: null, question_number: null });
    }

    const card = orchestrator.nextCard()!;
    const questionNumber = orchestrator.correctCount + orchestrator.incorrectCount + 1;

    res.json({
        done: false,
        question_number: questionNumber,
        card: {
            id: card.id,
            question: card.question,
            // Don't send answers to the frontend!
        },
    });
});

// POST /api/quizzes/:id/answer — submit an answer
quizRoutes.post("/:id/answer", (req, res) => {
    const orchestrator = activeOrchestrators.get(req.params.id);
    if (!orchestrator) return res.status(404).json({ error: "quiz not found" });

    const { answer } = req.body;
    if (answer === undefined) return res.status(400).json({ error: "answer required" });

    const card = orchestrator.nextCard();
    if (!card) return res.status(400).json({ error: "quiz is already done" });

    // Check answer
    const normalized = answer.trim().toLowerCase();
    const correct = card.answers.some((a) => normalized === a.trim().toLowerCase());

    orchestrator.advance(correct);

    // Record stats
    const quiz = quizService.readQuiz(req.params.id);
    if (quiz) {
        cardStatsService.recordImpression(quiz.user_id, card.id, correct);
    }

    res.json({
        correct,
        correct_answer: card.answers[0],
        correct_count: orchestrator.correctCount,
        incorrect_count: orchestrator.incorrectCount,
        is_done: orchestrator.isDone(),
    });
});

// POST /api/quizzes/:id/finish — end quiz (early or complete)
quizRoutes.post("/:id/finish", (req, res) => {
    const orchestrator = activeOrchestrators.get(req.params.id);
    if (!orchestrator) return res.status(404).json({ error: "quiz not found" });

    const result = quizService.finishQuiz(
        req.params.id,
        orchestrator.correctCount,
        orchestrator.incorrectCount,
        orchestrator.elapsedSeconds
    );

    activeOrchestrators.delete(req.params.id);

    res.json({
        correct_count: orchestrator.correctCount,
        incorrect_count: orchestrator.incorrectCount,
        percent_correct: orchestrator.percentCorrect,
        time_seconds: orchestrator.elapsedSeconds,
        total_cards: orchestrator.totalCards,
    });
});

// GET /api/quizzes/history/:user_id — get quiz history
quizRoutes.get("/history/:user_id", (req, res) => {
    res.json(quizService.getQuizHistory(req.params.user_id));
});
