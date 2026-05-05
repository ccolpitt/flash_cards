import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export function ResultsPage() {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        // Finish quiz returns results, but if we navigated here directly, fetch won't work
        // The results are returned by finishQuiz — we'll call it again (idempotent-ish)
        api.finishQuiz(quizId!).then(setResults).catch(() => {
            // Quiz already finished — that's fine
            setResults({ correct_count: 0, incorrect_count: 0, percent_correct: 0, time_seconds: 0 });
        });
    }, [quizId]);

    if (!results) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container">
            <div className="card">
                <h1>Quiz Results</h1>
                <div style={{ fontSize: 48, margin: "20px 0" }}>
                    {results.percent_correct}%
                </div>
                <p>
                    <span className="correct">{results.correct_count} correct</span>
                    {" / "}
                    <span className="incorrect">{results.incorrect_count} incorrect</span>
                </p>
                <p style={{ color: "#888", margin: "8px 0" }}>
                    Time: {results.time_seconds}s
                </p>
                {results.incorrect_count === 0 && results.correct_count > 0 && (
                    <p style={{ fontSize: 24, margin: "12px 0" }}>🎉 Perfect! Deck mastered!</p>
                )}
                <button onClick={() => navigate("/decks")} style={{ marginTop: 16 }}>
                    Play Again
                </button>
                <button className="secondary" onClick={() => navigate("/login")} style={{ marginTop: 8 }}>
                    Switch User
                </button>
            </div>
        </div>
    );
}
