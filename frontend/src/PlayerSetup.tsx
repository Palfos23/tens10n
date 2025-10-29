import { useState, useEffect } from "react";
import StarBackground from "./StarBackground";
import "./PlayerSetup.css";

interface PlayerSetupProps {
    numPlayers: number;
    onStart: (players: { name: string; color: string }[]) => void;
}

const colors = [
    "#4f46e5",
    "#16a34a",
    "#dc2626",
    "#f59e0b",
    "#0ea5e9",
    "#9333ea",
    "#f43f5e",
    "#22d3ee",
    "#84cc16",
];

export default function PlayerSetup({ numPlayers, onStart }: PlayerSetupProps) {
    const [players, setPlayers] = useState(
        Array.from({ length: numPlayers }, () => ({
            name: "",
            color: colors[Math.floor(Math.random() * colors.length)],
        }))
    );
    const [error, setError] = useState<string | null>(null);

    const allNamed = players.every((p) => p.name.trim().length > 0);

    const hasDuplicates = players
        .map((p) => p.name.trim().toLowerCase())
        .filter((n) => n.length > 0)
        .some((name, i, arr) => arr.indexOf(name) !== i);

    useEffect(() => {
        setError(hasDuplicates ? "Flere spillere har samme navn 🧩" : null);
    }, [hasDuplicates]);

    const handleChange = (i: number, key: "name" | "color", value: string) => {
        const updated = [...players];
        updated[i] = { ...updated[i], [key]: value };
        setPlayers(updated);
    };

    const handleStart = () => {
        if (!allNamed || hasDuplicates) return;
        onStart(players);
    };

    return (
        <div className="player-setup-container">
            <StarBackground />

            <div className="player-setup-card">
                <h2 className="player-setup-title">Tilpass spillerne dine 🎨</h2>

                <div className="player-inputs">
                    {players.map((p, i) => (
                        <div key={i} className="player-row">
                            <input
                                type="text"
                                placeholder={`Spiller ${i + 1}`}
                                value={p.name}
                                onChange={(e) => handleChange(i, "name", e.target.value)}
                                className="player-input"
                            />

                            <div className="color-wrapper">
                                <label
                                    htmlFor={`color-${i}`}
                                    className="color-display"
                                    style={{ backgroundColor: p.color }}
                                ></label>
                                <input
                                    id={`color-${i}`}
                                    type="color"
                                    value={p.color}
                                    onChange={(e) => handleChange(i, "color", e.target.value)}
                                    className="color-picker"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {error && <p className="error-text">{error}</p>}

                <button
                    className={`start-btn ${allNamed && !hasDuplicates ? "active" : "disabled"}`}
                    disabled={!allNamed || hasDuplicates}
                    onClick={handleStart}
                >
                    🚀 Start Spill
                </button>
            </div>
        </div>
    );
}
