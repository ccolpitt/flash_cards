import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

interface Deck {
    id: string;
    name: string;
    card_count: number;
}

interface Mode {
    id: string;
    label: string;
    description: string;
}

export function DecksPage() {
    const navigate = useNavigate();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [modes, setModes] = useState<Mode[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
    const [user, setUser] = useState<any>(null);
    const [mastery, setMastery] = useState<Record<string, boolean>>({});
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.getLastUser().then(setUser);
        api.listDecks().then(setDecks);
        api.getModes().then(setModes);
    }, []);

    useEffect(() => {
        if (user && decks.length > 0) {
            Promise.all(
                decks.map((d) =>
                    api.getDeckMastery(d.id, user.id).then((r: any) => [d.id, r.is_mastered])
                )
            ).then((results) => {
                setMastery(Object.fromEntries(results));
            });
        }
    }, [user, decks]);

    async function startQuiz(mode: string) {
        if (!selectedDeck || !user) return;
        const result = await api.startQuiz(user.id, selectedDeck.id, mode);
        navigate(`/quiz/${result.quiz_id}`);
    }

    const filtered = search
        ? decks.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
        : decks;

    return (
        <div className="container">
            <h1>Choose a Deck</h1>

            {!selectedDeck && (
                <>
                    <input
                        placeholder="Search decks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <ul className="deck-list">
                        {filtered.map((d) => (
                            <li key={d.id} onClick={() => setSelectedDeck(d)}>
                                <span>
                                    {d.name} <span style={{ color: "#888" }}>({d.card_count} cards)</span>
                                </span>
                                {mastery[d.id] && <span className="mastery-badge">✓ Mastered</span>}
                            </li>
                        ))}
                    </ul>
                    <button className="secondary" onClick={() => navigate("/import")}>
                        Import CSV Deck
                    </button>
                </>
            )}

            {selectedDeck && (
                <div className="card">
                    <h2>{selectedDeck.name}</h2>
                    <p>{selectedDeck.card_count} cards</p>
                    <p style={{ margin: "12px 0" }}>Choose a mode:</p>
                    {modes.map((m) => (
                        <button key={m.id} onClick={() => startQuiz(m.id)}>
                            {m.label}
                        </button>
                    ))}
                    <br />
                    <button className="secondary" onClick={() => setSelectedDeck(null)} style={{ marginTop: 12 }}>
                        ← Back
                    </button>
                </div>
            )}
        </div>
    );
}
