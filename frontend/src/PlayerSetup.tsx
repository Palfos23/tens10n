import React, { useState } from "react";
import StarBackground from "./StarBackground";

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
        <div
            style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <StarBackground />
            <div
                style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 16,
                    padding: "2.5rem 3rem",
                    textAlign: "center",
                    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
                    color: "white",
                    width: "min(90%, 400px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center", // 👈 center inputs and button
                }}
            >
                <h2
                    style={{
                        marginBottom: "1.5rem",
                        fontSize: "1.8rem",
                        letterSpacing: "1px",
                    }}
                >
                    Skriv inn navn på spillere
                </h2>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        width: "100%",
                        alignItems: "center", // 👈 keeps input fields centered
                    }}
                >
                    {names.map((name, i) => (
                        <input
                            key={i}
                            type="text"
                            placeholder={`Spiller ${i + 1}`}
                            value={name}
                            onChange={(e) => handleChange(i, e.target.value)}
                            style={{
                                width: "80%", // 👈 makes input smaller & centered
                                padding: "0.6rem 0.8rem",
                                fontSize: "1rem",
                                borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.3)",
                                background: "rgba(255,255,255,0.15)",
                                color: "white",
                                textAlign: "center",
                                outline: "none",
                            }}
                            onFocus={(e) =>
                                (e.target.style.border = "1px solid rgba(255,255,255,0.7)")
                            }
                            onBlur={(e) =>
                                (e.target.style.border = "1px solid rgba(255,255,255,0.3)")
                            }
                        />
                    ))}
                </div>

                <button
                    disabled={!allNamed}
                    onClick={() => onStart(names)}
                    style={{
                        marginTop: "2rem",
                        padding: "0.8rem 1.6rem",
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        borderRadius: 8,
                        border: "none",
                        cursor: allNamed ? "pointer" : "not-allowed",
                        background: allNamed
                            ? "#4f46e5"
                            : "rgba(255,255,255,0.2)",
                        color: allNamed ? "#111" : "rgba(255,255,255,0.5)",
                        transition: "transform 0.2s ease, opacity 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                        allNamed && (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                        allNamed && (e.currentTarget.style.transform = "scale(1)")
                    }
                >
                    Start Spill
                </button>
            </div>
        </div>
    );
};

export default PlayerSetup;
