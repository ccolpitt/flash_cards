import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";

interface CardData {
    id: string;
    question: string;
}

export function QuizPage() {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const [card, setCard] = useState<CardData | null>(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
    const [done, setDone] = useState(false);
    const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

    useEffect(() => {
        loadNext();
    }, []);

    async function loadNext() {
        const data = await api.getNextCard(quizId!);
        if (data.done) {
            setDone(true);
            return;
        }
        setCard(data.card);
        setQuestionNumber(data.question_number);
        setFeedback(null);
        setAnswer("");
    }

    async function submitAnswer() {
        if (!answer.trim()) return;
        const result = await api.submitAnswer(quizId!, answer);
        setFeedback({ correct: result.correct, correctAnswer: result.correct_answer });
        setStats({ correct: result.correct_count, incorrect: result.incorrect_count });

        if (result.is_done) {
            setDone(true);
        }
    }

    async function next() {
        if (done) {
            await api.finishQuiz(quizId!);
            navigate(`/results/${quizId}`);
        } else {
            loadNext();
        }
    }

    async function quit() {
        await api.finishQuiz(quizId!);
        navigate(`/results/${quizId}`);
    }

    const totalAnswered = stats.correct + stats.incorrect;
    const progress = totalAnswered > 0 ? (totalAnswered / (totalAnswered + 1)) * 100 : 0;

    return (
        <div className="container">
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>

            {card && !done && (
                <div className="card">
                    <div className="question-number">Q{questionNumber}</div>
                    <h2>{card.question}</h2>

                    {!feedback && (
                        <>
                            <input
                                placeholder="Your answer..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
                                autoFocus
                            />
                            <button onClick={submitAnswer}>Submit</button>
                            <button className="danger" onClick={quit}>Quit</button>
                        </>
                    )}

                    {feedback && (
                        <>
                            <p className={feedback.correct ? "correct" : "incorrect"}>
                                {feedback.correct ? "✓ Correct!" : `✗ Wrong. Answer: ${feedback.correctAnswer}`}
                            </p>
                            <button onClick={next} style={{ marginTop: 12 }}>
                                {done ? "See Results" : "Next →"}
                            </button>
                        </>
                    )}
                </div>
            )}

            {done && !feedback && (
                <div className="card">
                    <h2>Quiz Complete!</h2>
                    <button onClick={() => navigate(`/results/${quizId}`)}>See Results</button>
                </div>
            )}

            <p style={{ color: "#888", marginTop: 12 }}>
                Score: {stats.correct} correct, {stats.incorrect} incorrect
            </p>
        </div>
    );
}
