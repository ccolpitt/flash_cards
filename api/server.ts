import express from "express";
import cors from "cors";
import { userRoutes } from "./routes/users.js";
import { cardRoutes } from "./routes/cards.js";
import { deckRoutes } from "./routes/decks.js";
import { quizRoutes } from "./routes/quizzes.js";
import { importRoutes } from "./routes/import.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/decks", deckRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/import", importRoutes);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});

export default app;
