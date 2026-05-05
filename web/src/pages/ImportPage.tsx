import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export function ImportPage() {
    const navigate = useNavigate();
    const [deckName, setDeckName] = useState("");
    const [csvContent, setCsvContent] = useState("");
    const [preview, setPreview] = useState<string[][]>([]);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            setCsvContent(text);

            // Preview first 5 rows
            const lines = text.split("\n").filter((l) => l.trim());
            const rows = lines.slice(0, 5).map((l) => {
                const commaIdx = l.indexOf(",");
                if (commaIdx === -1) return [l, ""];
                return [l.substring(0, commaIdx), l.substring(commaIdx + 1)];
            });
            setPreview(rows);
        };
        reader.readAsText(file);
    }

    async function doImport() {
        setError("");
        if (!deckName.trim()) {
            setError("Please enter a deck name");
            return;
        }
        if (!csvContent) {
            setError("Please select a CSV file");
            return;
        }

        try {
            const res = await api.importCsv(deckName.trim(), csvContent);
            setResult(res);
        } catch (e: any) {
            setError(e.message);
        }
    }

    return (
        <div className="container">
            <h1>Import Deck from CSV</h1>

            {!result && (
                <div className="card">
                    <label>
                        <strong>Deck name:</strong>
                        <input
                            placeholder="e.g. Spanish Vocabulary"
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                        />
                    </label>

                    <label>
                        <strong>CSV file:</strong> (format: question,answer1|answer2)
                        <input type="file" accept=".csv,.txt" onChange={handleFile} />
                    </label>

                    {preview.length > 0 && (
                        <div style={{ margin: "12px 0" }}>
                            <strong>Preview:</strong>
                            <table style={{ width: "100%", fontSize: 14, marginTop: 8 }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: "left" }}>Question</th>
                                        <th style={{ textAlign: "left" }}>Answers</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, i) => (
                                        <tr key={i}>
                                            <td>{row[0]}</td>
                                            <td>{row[1]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button onClick={doImport}>Import</button>
                    <button className="secondary" onClick={() => navigate("/decks")}>Cancel</button>
                </div>
            )}

            {result && (
                <div className="card">
                    <h2>✓ Import Complete</h2>
                    <p>Created deck: <strong>{result.deck.name}</strong></p>
                    <p>{result.cards_created} cards imported</p>
                    {result.errors && (
                        <div style={{ color: "#888", marginTop: 8 }}>
                            <p>{result.errors.length} rows skipped:</p>
                            <ul>{result.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}</ul>
                        </div>
                    )}
                    <button onClick={() => navigate("/decks")} style={{ marginTop: 12 }}>
                        Go to Decks
                    </button>
                </div>
            )}
        </div>
    );
}
