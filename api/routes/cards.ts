import { Router } from "express";
import { JsonFileStore } from "../../stores/json-file-store.js";
import { Card } from "../../models/card.js";
import { CardService } from "../../services/card-service.js";

const store = new JsonFileStore<Card>("cards.json");
const cardService = new CardService(store);

export const cardRoutes = Router();

cardRoutes.get("/", (_req, res) => {
    res.json(cardService.listCards());
});

cardRoutes.get("/:id", (req, res) => {
    const card = cardService.readCard(req.params.id);
    if (!card) return res.status(404).json({ error: "not found" });
    res.json(card);
});

cardRoutes.post("/", (req, res) => {
    const { question, answers } = req.body;
    if (!question || !answers) return res.status(400).json({ error: "question and answers required" });
    const card = cardService.createCard(question, answers);
    res.status(201).json(card);
});

cardRoutes.put("/:id", (req, res) => {
    const updated = cardService.updateCard(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
});

cardRoutes.delete("/:id", (req, res) => {
    const deleted = cardService.deleteCard(req.params.id);
    if (!deleted) return res.status(404).json({ error: "not found" });
    res.status(204).send();
});
