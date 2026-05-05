import * as fs from "fs";

interface Card {
    id: number;
    question: string;
    answers: string[];
}

function generateCards(): Card[] {
    const cards: Card[] = [];
    let id = 1;

    // ~34 basic math cards
    const mathCards: { question: string; answers: string[] }[] = [
        { question: "What is 7 × 8?", answers: ["56"] },
        { question: "What is 6 × 7?", answers: ["42"] },
        { question: "What is 9 × 9?", answers: ["81"] },
        { question: "What is 12 × 12?", answers: ["144"] },
        { question: "What is 8 × 6?", answers: ["48"] },
        { question: "What is 11 × 11?", answers: ["121"] },
        { question: "What is 5 × 9?", answers: ["45"] },
        { question: "What is 3 × 14?", answers: ["42"] },
        { question: "What is 15 × 3?", answers: ["45"] },
        { question: "What is 25 + 37?", answers: ["62"] },
        { question: "What is 100 - 64?", answers: ["36"] },
        { question: "What is 144 / 12?", answers: ["12"] },
        { question: "What is 81 / 9?", answers: ["9"] },
        { question: "What is 7 × 7?", answers: ["49"] },
        { question: "What is 8 × 9?", answers: ["72"] },
        { question: "What is 6 × 6?", answers: ["36"] },
        { question: "What is 13 × 3?", answers: ["39"] },
        { question: "What is 4 × 15?", answers: ["60"] },
        { question: "What is 200 - 87?", answers: ["113"] },
        { question: "What is 56 + 44?", answers: ["100"] },
        { question: "What is 9 × 12?", answers: ["108"] },
        { question: "What is 150 / 5?", answers: ["30"] },
        { question: "What is 8 × 8?", answers: ["64"] },
        { question: "What is 11 × 7?", answers: ["77"] },
        { question: "What is 16 × 4?", answers: ["64"] },
        { question: "What is 99 + 1?", answers: ["100"] },
        { question: "What is 1000 / 8?", answers: ["125"] },
        { question: "What is 14 × 5?", answers: ["70"] },
        { question: "What is 250 - 175?", answers: ["75"] },
        { question: "What is 33 + 67?", answers: ["100"] },
        { question: "What is 12 × 8?", answers: ["96"] },
        { question: "What is 45 + 55?", answers: ["100"] },
        { question: "What is 7 × 13?", answers: ["91"] },
        { question: "What is 256 / 16?", answers: ["16"] },
    ];

    for (const card of mathCards) {
        cards.push({ id: id++, question: card.question, answers: card.answers });
    }

    // ~33 world capital cards
    const capitalCards: { question: string; answers: string[] }[] = [
        { question: "What is the capital of France?", answers: ["Paris"] },
        { question: "What is the capital of Japan?", answers: ["Tokyo"] },
        { question: "What is the capital of Australia?", answers: ["Canberra"] },
        { question: "What is the capital of Brazil?", answers: ["Brasilia"] },
        { question: "What is the capital of Canada?", answers: ["Ottawa"] },
        { question: "What is the capital of Germany?", answers: ["Berlin"] },
        { question: "What is the capital of Italy?", answers: ["Rome", "Roma"] },
        { question: "What is the capital of Spain?", answers: ["Madrid"] },
        { question: "What is the capital of India?", answers: ["New Delhi", "Delhi"] },
        { question: "What is the capital of China?", answers: ["Beijing", "Peking"] },
        { question: "What is the capital of Russia?", answers: ["Moscow"] },
        { question: "What is the capital of Egypt?", answers: ["Cairo"] },
        { question: "What is the capital of Mexico?", answers: ["Mexico City"] },
        { question: "What is the capital of South Korea?", answers: ["Seoul"] },
        { question: "What is the capital of Argentina?", answers: ["Buenos Aires"] },
        { question: "What is the capital of Turkey?", answers: ["Ankara"] },
        { question: "What is the capital of Thailand?", answers: ["Bangkok"] },
        { question: "What is the capital of Sweden?", answers: ["Stockholm"] },
        { question: "What is the capital of Norway?", answers: ["Oslo"] },
        { question: "What is the capital of Poland?", answers: ["Warsaw"] },
        { question: "What is the capital of Greece?", answers: ["Athens"] },
        { question: "What is the capital of Portugal?", answers: ["Lisbon"] },
        { question: "What is the capital of Kenya?", answers: ["Nairobi"] },
        { question: "What is the capital of Nigeria?", answers: ["Abuja"] },
        { question: "What is the capital of South Africa?", answers: ["Pretoria", "Cape Town", "Bloemfontein"] },
        { question: "What is the capital of Peru?", answers: ["Lima"] },
        { question: "What is the capital of Colombia?", answers: ["Bogota"] },
        { question: "What is the capital of New Zealand?", answers: ["Wellington"] },
        { question: "What is the capital of Ireland?", answers: ["Dublin"] },
        { question: "What is the capital of Switzerland?", answers: ["Bern", "Berne"] },
        { question: "What is the capital of Austria?", answers: ["Vienna"] },
        { question: "What is the capital of Czech Republic?", answers: ["Prague"] },
        { question: "What is the capital of Vietnam?", answers: ["Hanoi"] },
    ];

    for (const card of capitalCards) {
        cards.push({ id: id++, question: card.question, answers: card.answers });
    }

    // ~33 simple science fact cards
    const scienceCards: { question: string; answers: string[] }[] = [
        { question: "How many planets are in the solar system?", answers: ["8"] },
        { question: "What is the chemical symbol for water?", answers: ["H2O"] },
        { question: "What is the chemical symbol for gold?", answers: ["Au"] },
        { question: "How many bones are in the adult human body?", answers: ["206"] },
        { question: "What is the speed of light in km/s (approximate)?", answers: ["300000", "300,000"] },
        { question: "What is the atomic number of carbon?", answers: ["6"] },
        { question: "How many chromosomes do humans have?", answers: ["46"] },
        { question: "What is the largest planet in our solar system?", answers: ["Jupiter"] },
        { question: "What is the smallest planet in our solar system?", answers: ["Mercury"] },
        { question: "What is the chemical symbol for oxygen?", answers: ["O"] },
        { question: "What is the chemical symbol for iron?", answers: ["Fe"] },
        { question: "How many elements are in the periodic table?", answers: ["118"] },
        { question: "What is the boiling point of water in Celsius?", answers: ["100", "100 degrees"] },
        { question: "What is the freezing point of water in Celsius?", answers: ["0", "0 degrees"] },
        { question: "What planet is known as the Red Planet?", answers: ["Mars"] },
        { question: "What is the closest star to Earth?", answers: ["Sun", "The Sun"] },
        { question: "How many legs does a spider have?", answers: ["8"] },
        { question: "What gas do plants absorb from the atmosphere?", answers: ["Carbon dioxide", "CO2"] },
        { question: "What is the hardest natural substance on Earth?", answers: ["Diamond"] },
        { question: "How many hearts does an octopus have?", answers: ["3"] },
        { question: "What is the largest organ in the human body?", answers: ["Skin"] },
        { question: "What is the chemical symbol for sodium?", answers: ["Na"] },
        { question: "How many teeth does an adult human have?", answers: ["32"] },
        { question: "What is the most abundant gas in Earth's atmosphere?", answers: ["Nitrogen"] },
        { question: "What is the pH of pure water?", answers: ["7"] },
        { question: "How many chambers does the human heart have?", answers: ["4"] },
        { question: "What is the chemical formula for table salt?", answers: ["NaCl"] },
        { question: "What is the largest mammal on Earth?", answers: ["Blue whale"] },
        { question: "How many continents are there on Earth?", answers: ["7"] },
        { question: "What is the chemical symbol for potassium?", answers: ["K"] },
        { question: "What is the powerhouse of the cell?", answers: ["Mitochondria", "Mitochondrion"] },
        { question: "How many pairs of ribs do humans have?", answers: ["12"] },
        { question: "What is the atomic number of hydrogen?", answers: ["1"] },
    ];

    for (const card of scienceCards) {
        cards.push({ id: id++, question: card.question, answers: card.answers });
    }

    return cards;
}

// Generate and write cards.json
const cards = generateCards();
fs.writeFileSync("cards.json", JSON.stringify(cards, null, 2));
console.log(`Generated ${cards.length} cards to cards.json`);
