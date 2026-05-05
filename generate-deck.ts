import { JsonFileStore } from "./stores/json-file-store.js";
import { Card } from "./models/card.js";
import { Deck } from "./models/deck.js";
import { CardService } from "./services/card-service.js";
import { DeckService } from "./services/deck-service.js";

/**
 * Creates a default deck containing all cards.
 * Run after generate-cards.ts: npx tsx generate-deck.ts
 */

const cardService = new CardService(new JsonFileStore<Card>("cards.json"));
const deckService = new DeckService(new JsonFileStore<Deck>("decks.json"));

const cards = cardService.listCards();
if (cards.length === 0) {
    console.log("No cards found. Run 'npx tsx generate-cards.ts' first.");
    process.exit(1);
}

// Check if default deck already exists
const existingDecks = deckService.listDecks();
const defaultDeck = existingDecks.find((d) => d.name === "All Cards");
if (defaultDeck) {
    console.log(`Default deck "All Cards" already exists (${defaultDeck.card_count} cards).`);
    process.exit(0);
}

const cardIds = cards.map((c) => c.id);
const deck = deckService.createDeck("All Cards", cardIds);
console.log(`Created deck "${deck.name}" with ${deck.card_count} cards.`);
