import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.js";
import { DecksPage } from "./pages/DecksPage.js";
import { QuizPage } from "./pages/QuizPage.js";
import { ResultsPage } from "./pages/ResultsPage.js";
import { ImportPage } from "./pages/ImportPage.js";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/decks" element={<DecksPage />} />
                <Route path="/quiz/:quizId" element={<QuizPage />} />
                <Route path="/results/:quizId" element={<ResultsPage />} />
                <Route path="/import" element={<ImportPage />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
