import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

interface User {
    id: string;
    name: string;
    num_sessions: number;
}

export function LoginPage() {
    const navigate = useNavigate();
    const [lastUser, setLastUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [newName, setNewName] = useState("");
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        api.getLastUser().then(setLastUser);
        api.listUsers().then(setUsers);
    }, []);

    async function loginAs(user: User) {
        await api.loginUser(user.id);
        navigate("/decks");
    }

    async function createNew() {
        if (!newName.trim()) return;
        const user = await api.createUser(newName.trim());
        navigate("/decks");
    }

    return (
        <div className="container">
            <h1>🃏 Flashcard App</h1>

            {lastUser && !showAll && (
                <div className="card">
                    <h2>Welcome back, {lastUser.name}!</h2>
                    <p>{lastUser.num_sessions} sessions played</p>
                    <button onClick={() => loginAs(lastUser)}>Continue</button>
                    <button className="secondary" onClick={() => setShowAll(true)}>
                        Switch user
                    </button>
                </div>
            )}

            {(showAll || !lastUser) && (
                <div className="card">
                    <h2>Login</h2>
                    {users.length > 0 && (
                        <>
                            <p>Choose a user:</p>
                            <ul className="deck-list">
                                {users.map((u) => (
                                    <li key={u.id} onClick={() => loginAs(u)}>
                                        {u.name}
                                        <span style={{ color: "#888" }}>{u.num_sessions} sessions</span>
                                    </li>
                                ))}
                            </ul>
                            <hr style={{ margin: "16px 0" }} />
                        </>
                    )}
                    <p>Or create a new user:</p>
                    <input
                        placeholder="Your name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createNew()}
                    />
                    <button onClick={createNew}>Create</button>
                </div>
            )}
        </div>
    );
}
