import { Router } from "express";
import { JsonFileStore } from "../../stores/json-file-store.js";
import { Deck } from "../../models/deck.js";
import { Quiz } from "../../models/quiz.js";
import { DeckService } from "../../services/deck-service.js";
import { QuizService } from "../../services/quiz-service.js";

const deckStore = new JsonFileStore<Deck>("decks.json");
const quizStore = new JsonFileStore<Quiz>("quizzes.json");
const deckService = new DeckService(deckStore);
const quizService = new QuizService(quizStore);

export const deckRoutes = Router();

// Available quiz modes — add new modes here, frontend picks them up automatically
const AVAILABLE_MODES = [
    { id: "sequential", label: "Sequential", description: "Cards in order" },
    { id: "random", label: "Random", description: "Cards shuffled" },
];

deckRoutes.get("/", (_req, res) => {
    res.json(deckService.listDecks());
});

// GET /api/decks/modes — returns available quiz modes (extensible)
deckRoutes.get("/modes", (_req, res) => {
    res.json(AVAILABLE_MODES);
});

deckRoutes.get("/:id", (req, res) => {
    const deck = deckService.readDeck(req.params.id);
    if (!deck) return res.status(404).json({ error: "not found" });
    res.json(deck);
});

// GET /api/decks/:id/mastery?user_id=xxx — check if user mastered this deck
deckRoutes.get("/:id/mastery", (req, res) => {
    const user_id = req.query.user_id as string;
    if (!user_id) return res.status(400).json({ error: "user_id query param required" });

    const history = quizService.getQuizHistory(user_id);
    const deckQuizzes = history.filter((q) => q.deck_id === req.params.id);
    if (deckQuizzes.length === 0) return res.json({ is_mastered: false });

    const lastQuiz = deckQuizzes[deckQuizzes.length - 1];
    const is_mastered = lastQuiz.incorrect_count === 0 && lastQuiz.correct_count > 0;
    res.json({ is_mastered });
});

deckRoutes.post("/", (req, res) => {
    const { name, card_ids } = req.body;
    if (!name || !card_ids) return res.status(400).json({ error: "name and card_ids required" });
    const deck = deckService.createDeck(name, card_ids);
    res.status(201).json(deck);
});

deckRoutes.put("/:id", (req, res) => {
    const updated = deckService.updateDeck(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
});

deckRoutes.delete("/:id", (req, res) => {
    const deleted = deckService.deleteDeck(req.params.id);
    if (!deleted) return res.status(404).json({ error: "not found" });
    res.status(204).send();
});
