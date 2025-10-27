import React, { useState } from "react";

interface PlayerSetupProps {
    numPlayers: number;
    onStart: (players: string[]) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ numPlayers, onStart }) => {
    const [names, setNames] = useState<string[]>(Array(numPlayers).fill(""));

    const handleChange = (i: number, value: string) => {
        const updated = [...names];
        updated[i] = value;
        setNames(updated);
    };

    const allNamed = names.every((n) => n.trim().length > 0);

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Enter Player Names</h2>
            {names.map((name, i) => (
                <div key={i} style={{ margin: "8px 0" }}>
                    <input
                        type="text"
                        placeholder={`Player ${i + 1}`}
                        value={name}
                        onChange={(e) => handleChange(i, e.target.value)}
                        style={{ padding: "6px 10px", fontSize: 16 }}
                    />
                </div>
            ))}
            <button disabled={!allNamed} onClick={() => onStart(names)}>
                Start Game
            </button>
        </div>
    );
};

export default PlayerSetup;
