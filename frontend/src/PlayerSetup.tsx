import { useState, useEffect } from "react";
import StarBackground from "./StarBackground";
import "./PlayerSetup.css";

interface PlayerSetupProps {
    numPlayers: number;
    onStart: (players: { name: string; color: string }[]) => void;
}

const colorOptions = [
    { hex: "#4f46e5", name: "Indigo" },
    { hex: "#7C7CFC", name: "Lys Indigo" },
    { hex: "#F22C05", name: "Rød" },
    { hex: "#F2BB05", name: "Gul" },
    { hex: "#032E8A", name: "Blå" },
    { hex: "#05D6F2", name: "Lyseblå" },
    { hex: "#f43f5e", name: "Rosa" },
    { hex: "#5D038A", name: "Mørkelilla" },
    { hex: "#FC9E7C", name: "Rosa" },
    { hex: "#99000D", name: "Magenta" },
];

export default function PlayerSetup({ numPlayers, onStart }: PlayerSetupProps) {
    const initialPlayers = Array.from({ length: numPlayers }, (_, i) => ({
        name: "",
        color: colorOptions[i % colorOptions.length].hex,
    }));

    const [players, setPlayers] = useState(initialPlayers);
    const [error, setError] = useState<string | null>(null);
    const [colorPickerIndex, setColorPickerIndex] = useState<number | null>(null); // hvem som har åpnet fargevelger

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

    const usedColors = players.map((p) => p.color);

    return (
        <div className="player-setup-container">
            <StarBackground />

            <div className="player-setup-card">
                <h2 className="player-setup-title">Tilpass spillerne dine</h2>

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

                            <button
                                className="color-button"
                                style={{ backgroundColor: p.color }}
                                onClick={() => setColorPickerIndex(i)}
                                title="Velg farge"
                            >
                            </button>
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

            {/* === Fargevelger-popup === */}
            {colorPickerIndex !== null && (
                <div className="modal-overlay" onClick={() => setColorPickerIndex(null)}>
                    <div
                        className="color-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Velg farge</h3>
                        <div className="color-grid">
                            {colorOptions.map((c) => {
                                const takenByOther =
                                    usedColors.includes(c.hex) &&
                                    players[colorPickerIndex].color !== c.hex;
                                return (
                                    <button
                                        key={c.hex}
                                        className={`color-dot ${
                                            players[colorPickerIndex].color === c.hex
                                                ? "selected"
                                                : ""
                                        }`}
                                        style={{
                                            backgroundColor: takenByOther
                                                ? "rgba(255,255,255,0.1)"
                                                : c.hex,
                                            cursor: takenByOther ? "not-allowed" : "pointer",
                                            opacity: takenByOther ? 0.4 : 1,
                                        }}
                                        onClick={() => {
                                            if (!takenByOther) {
                                                handleChange(colorPickerIndex, "color", c.hex);
                                                setColorPickerIndex(null);
                                            }
                                        }}
                                        title={
                                            takenByOther
                                                ? `${c.name} (opptatt)`
                                                : c.name
                                        }
                                    />
                                );
                            })}
                        </div>
                        <button
                            className="close-color-btn"
                            onClick={() => setColorPickerIndex(null)}
                        >
                            Lukk
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
