import React, { useState, useEffect } from "react";
import StarBackground from "./StarBackground";
import "./PlayerSetup.css";

interface PlayerSetupProps {
    numPlayers: number;
    onStart: (players: string[]) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ numPlayers, onStart }) => {
    const [names, setNames] = useState<string[]>(Array(numPlayers).fill(""));
    const [error, setError] = useState<string | null>(null);

    const handleChange = (i: number, value: string) => {
        const updated = [...names];
        updated[i] = value;
        setNames(updated);
    };

    const allNamed = names.every((n) => n.trim().length > 0);

    const hasDuplicates = names
        .map((n) => n.trim().toLowerCase())
        .filter((n) => n.length > 0)
        .some((name, index, arr) => arr.indexOf(name) !== index);

    useEffect(() => {
        if (hasDuplicates) {
            setError("Flere spillere har samme navn – velg unike navn 🧩");
        } else {
            setError(null);
        }
    }, [hasDuplicates, names]);

    const handleStart = () => {
        if (hasDuplicates || !allNamed) return;
        onStart(names);
    };

    return (
        <div className="player-setup-container">
            <StarBackground />

            <div className="player-setup-card">
                <h2 className="player-setup-title">Skriv inn navn på spillere</h2>

                <div className="player-inputs">
                    {names.map((name, i) => (
                        <input
                            key={i}
                            type="text"
                            placeholder={`Spiller ${i + 1}`}
                            value={name}
                            onChange={(e) => handleChange(i, e.target.value)}
                            className={`player-input ${
                                hasDuplicates ? "input-error" : ""
                            }`}
                        />
                    ))}
                </div>

                {error && <p className="error-text">{error}</p>}

                <button
                    className={`start-btn ${
                        allNamed && !hasDuplicates ? "active" : "disabled"
                    }`}
                    disabled={!allNamed || hasDuplicates}
                    onClick={handleStart}
                >
                    🚀 Start Spill
                </button>
            </div>
        </div>
    );
};

export default PlayerSetup;
