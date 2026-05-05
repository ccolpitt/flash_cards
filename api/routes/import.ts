import { Router } from "express";
import { JsonFileStore } from "../../stores/json-file-store.js";
import { Card } from "../../models/card.js";
import { Deck } from "../../models/deck.js";
import { CardService } from "../../services/card-service.js";
import { DeckService } from "../../services/deck-service.js";

const cardService = new CardService(new JsonFileStore<Card>("cards.json"));
const deckService = new DeckService(new JsonFileStore<Deck>("decks.json"));

export const importRoutes = Router();

/**
 * POST /api/import/csv
 * Body: { deck_name: string, csv_content: string }
 *
 * CSV format: question,answers
 * Answers are pipe-separated: "Paris|paris"
 * First row is treated as header if it starts with "question"
 */
importRoutes.post("/csv", (req, res) => {
    const { deck_name, csv_content } = req.body;

    if (!deck_name || !csv_content) {
        return res.status(400).json({ error: "deck_name and csv_content required" });
    }

    const lines = csv_content.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 0);

    // Skip header row if present
    let startIdx = 0;
    if (lines[0]?.toLowerCase().startsWith("question")) {
        startIdx = 1;
    }

    const cardIds: string[] = [];
    const errors: string[] = [];

    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        // Split on first comma only (question might contain commas in quotes)
        const commaIdx = line.indexOf(",");
        if (commaIdx === -1) {
            errors.push(`Row ${i + 1}: no comma found`);
            continue;
        }

        const question = line.substring(0, commaIdx).trim().replace(/^"|"$/g, "");
        const answersRaw = line.substring(commaIdx + 1).trim().replace(/^"|"$/g, "");

        if (!question) {
            errors.push(`Row ${i + 1}: empty question`);
            continue;
        }

        const answers = answersRaw.split("|").map((a) => a.trim()).filter((a) => a.length > 0);
        if (answers.length === 0) {
            errors.push(`Row ${i + 1}: no answers`);
            continue;
        }

        const card = cardService.createCard(question, answers);
        cardIds.push(card.id);
    }

    if (cardIds.length === 0) {
        return res.status(400).json({ error: "No valid cards found", errors });
    }

    const deck = deckService.createDeck(deck_name, cardIds);

    res.status(201).json({
        deck,
        cards_created: cardIds.length,
        errors: errors.length > 0 ? errors : undefined,
    });
});
