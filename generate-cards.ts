import { JsonFileStore } from "./stores/json-file-store.js";
import { Card } from "./models/card.js";
import { CardService } from "./services/card-service.js";

/**
 * Generates 100 flashcards and persists them via the Card CRUD service.
 * Run once: npx tsx generate-cards.ts
 */

const store = new JsonFileStore<Card>("cards.json");
const cardService = new CardService(store);

// Only generate if the store is empty
if (cardService.listCards().length > 0) {
    console.log(`Cards already exist (${cardService.listCards().length} cards). Delete data/cards.json to regenerate.`);
    process.exit(0);
}

// ~34 basic math cards
const mathCards = [
    { q: "What is 7 × 8?", a: ["56"] },
    { q: "What is 6 × 7?", a: ["42"] },
    { q: "What is 9 × 9?", a: ["81"] },
    { q: "What is 12 × 12?", a: ["144"] },
    { q: "What is 8 × 6?", a: ["48"] },
    { q: "What is 11 × 11?", a: ["121"] },
    { q: "What is 5 × 9?", a: ["45"] },
    { q: "What is 3 × 14?", a: ["42"] },
    { q: "What is 15 × 3?", a: ["45"] },
    { q: "What is 25 + 37?", a: ["62"] },
    { q: "What is 100 - 64?", a: ["36"] },
    { q: "What is 144 / 12?", a: ["12"] },
    { q: "What is 81 / 9?", a: ["9"] },
    { q: "What is 7 × 7?", a: ["49"] },
    { q: "What is 8 × 9?", a: ["72"] },
    { q: "What is 6 × 6?", a: ["36"] },
    { q: "What is 13 × 3?", a: ["39"] },
    { q: "What is 4 × 15?", a: ["60"] },
    { q: "What is 200 - 87?", a: ["113"] },
    { q: "What is 56 + 44?", a: ["100"] },
    { q: "What is 9 × 12?", a: ["108"] },
    { q: "What is 150 / 5?", a: ["30"] },
    { q: "What is 8 × 8?", a: ["64"] },
    { q: "What is 11 × 7?", a: ["77"] },
    { q: "What is 16 × 4?", a: ["64"] },
    { q: "What is 99 + 1?", a: ["100"] },
    { q: "What is 1000 / 8?", a: ["125"] },
    { q: "What is 14 × 5?", a: ["70"] },
    { q: "What is 250 - 175?", a: ["75"] },
    { q: "What is 33 + 67?", a: ["100"] },
    { q: "What is 12 × 8?", a: ["96"] },
    { q: "What is 45 + 55?", a: ["100"] },
    { q: "What is 7 × 13?", a: ["91"] },
    { q: "What is 256 / 16?", a: ["16"] },
];

// ~33 world capital cards
const capitalCards = [
    { q: "What is the capital of France?", a: ["Paris"] },
    { q: "What is the capital of Japan?", a: ["Tokyo"] },
    { q: "What is the capital of Australia?", a: ["Canberra"] },
    { q: "What is the capital of Brazil?", a: ["Brasilia"] },
    { q: "What is the capital of Canada?", a: ["Ottawa"] },
    { q: "What is the capital of Germany?", a: ["Berlin"] },
    { q: "What is the capital of Italy?", a: ["Rome"] },
    { q: "What is the capital of Spain?", a: ["Madrid"] },
    { q: "What is the capital of India?", a: ["New Delhi", "Delhi"] },
    { q: "What is the capital of China?", a: ["Beijing", "Peking"] },
    { q: "What is the capital of Russia?", a: ["Moscow"] },
    { q: "What is the capital of Egypt?", a: ["Cairo"] },
    { q: "What is the capital of Mexico?", a: ["Mexico City"] },
    { q: "What is the capital of South Korea?", a: ["Seoul"] },
    { q: "What is the capital of Argentina?", a: ["Buenos Aires"] },
    { q: "What is the capital of Turkey?", a: ["Ankara"] },
    { q: "What is the capital of Thailand?", a: ["Bangkok"] },
    { q: "What is the capital of Sweden?", a: ["Stockholm"] },
    { q: "What is the capital of Norway?", a: ["Oslo"] },
    { q: "What is the capital of Poland?", a: ["Warsaw"] },
    { q: "What is the capital of Greece?", a: ["Athens"] },
    { q: "What is the capital of Portugal?", a: ["Lisbon"] },
    { q: "What is the capital of Kenya?", a: ["Nairobi"] },
    { q: "What is the capital of Nigeria?", a: ["Abuja"] },
    { q: "What is the capital of South Africa?", a: ["Pretoria", "Cape Town", "Bloemfontein"] },
    { q: "What is the capital of Peru?", a: ["Lima"] },
    { q: "What is the capital of Colombia?", a: ["Bogota"] },
    { q: "What is the capital of New Zealand?", a: ["Wellington"] },
    { q: "What is the capital of Ireland?", a: ["Dublin"] },
    { q: "What is the capital of Switzerland?", a: ["Bern", "Berne"] },
    { q: "What is the capital of Austria?", a: ["Vienna"] },
    { q: "What is the capital of Czech Republic?", a: ["Prague"] },
    { q: "What is the capital of Vietnam?", a: ["Hanoi"] },
];

// ~33 simple science fact cards
const scienceCards = [
    { q: "How many planets are in the solar system?", a: ["8"] },
    { q: "What is the chemical symbol for water?", a: ["H2O"] },
    { q: "What is the chemical symbol for gold?", a: ["Au"] },
    { q: "How many bones are in the adult human body?", a: ["206"] },
    { q: "What is the speed of light in km/s (approximate)?", a: ["300000", "300,000"] },
    { q: "What is the atomic number of carbon?", a: ["6"] },
    { q: "How many chromosomes do humans have?", a: ["46"] },
    { q: "What is the largest planet in our solar system?", a: ["Jupiter"] },
    { q: "What is the smallest planet in our solar system?", a: ["Mercury"] },
    { q: "What is the chemical symbol for oxygen?", a: ["O"] },
    { q: "What is the chemical symbol for iron?", a: ["Fe"] },
    { q: "How many elements are in the periodic table?", a: ["118"] },
    { q: "What is the boiling point of water in Celsius?", a: ["100", "100 degrees"] },
    { q: "What is the freezing point of water in Celsius?", a: ["0", "0 degrees"] },
    { q: "What planet is known as the Red Planet?", a: ["Mars"] },
    { q: "What is the closest star to Earth?", a: ["Sun", "The Sun"] },
    { q: "How many legs does a spider have?", a: ["8"] },
    { q: "What gas do plants absorb from the atmosphere?", a: ["Carbon dioxide", "CO2"] },
    { q: "What is the hardest natural substance on Earth?", a: ["Diamond"] },
    { q: "How many hearts does an octopus have?", a: ["3"] },
    { q: "What is the largest organ in the human body?", a: ["Skin"] },
    { q: "What is the chemical symbol for sodium?", a: ["Na"] },
    { q: "How many teeth does an adult human have?", a: ["32"] },
    { q: "What is the most abundant gas in Earth's atmosphere?", a: ["Nitrogen"] },
    { q: "What is the pH of pure water?", a: ["7"] },
    { q: "How many chambers does the human heart have?", a: ["4"] },
    { q: "What is the chemical formula for table salt?", a: ["NaCl"] },
    { q: "What is the largest mammal on Earth?", a: ["Blue whale"] },
    { q: "How many continents are there on Earth?", a: ["7"] },
    { q: "What is the chemical symbol for potassium?", a: ["K"] },
    { q: "What is the powerhouse of the cell?", a: ["Mitochondria", "Mitochondrion"] },
    { q: "How many pairs of ribs do humans have?", a: ["12"] },
    { q: "What is the atomic number of hydrogen?", a: ["1"] },
];

const allCards = [...mathCards, ...capitalCards, ...scienceCards];

for (const card of allCards) {
    cardService.createCard(card.q, card.a);
}

console.log(`Generated ${allCards.length} cards to data/cards.json`);
