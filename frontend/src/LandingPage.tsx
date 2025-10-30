import React, { useState, useEffect } from "react";
import "./LandingPage.css";

interface Star {
    top: number;
    left: number;
    delay: number;
}

interface LandingPageProps {
    onStartGame: (numPlayers: number, numQuestions: number, category: string) => void;
}

const categories = [
    "Tilfeldig (alle kategorier)",
    "Geografi",
    "Historie",
    "Sport",
    "Underholdning",
    "Vitenskap",
    "Teknologi",
    "Kultur",
];

const LandingPage: React.FC<LandingPageProps> = ({ onStartGame }) => {
    const [open, setOpen] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [numPlayers, setNumPlayers] = useState("2");
    const [numQuestions, setNumQuestions] = useState("5");
    const [category, setCategory] = useState(categories[0]);
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        const starArray: Star[] = Array.from({ length: 80 }).map(() => ({
            top: Math.random() * 100,
            left: Math.random() * 100,
            delay: Math.random() * 5,
        }));
        setStars(starArray);
    }, []);

    const handleStart = () => {
        onStartGame(parseInt(numPlayers, 10), parseInt(numQuestions, 10), category);
        setOpen(false);
    };

    return (
        <div className="landing-container">
            {stars.map((star, i) => (
                <div
                    key={i}
                    className="star"
                    style={{
                        top: `${star.top}%`,
                        left: `${star.left}%`,
                        animationDelay: `${star.delay}s`,
                    }}
                />
            ))}

            {/* ℹ️ Info-knapp */}
            <button className="info-btn" onClick={() => setShowInfo(true)} aria-label="Spilleregler">
                <text
                    x="22"
                    y="28"
                    textAnchor="middle"
                    fontSize="26"
                    fill="currentColor"
                    fontWeight="900"
                >
                    i
                </text>
            </button>

            <h1 className="title">
                tens<span className="highlight">10</span>n
            </h1>

            <button className="create-btn" onClick={() => setOpen(true)}>
                Opprett Spill
            </button>

            {/* Modal for å opprette spill */}
            {open && (
                <div className="modal-overlay" onClick={() => setOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Opprett Spill</h2>

                        <div className="form-group">
                            <label>👥 Antall Spillere</label>
                            <select
                                value={numPlayers}
                                onChange={(e) => setNumPlayers(e.target.value)}
                            >
                                {[...Array(8)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>❓ Antall Spørsmål</label>
                            <select
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(e.target.value)}
                            >
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>🏷️ Kategori</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled
                                className="blurred-select"
                            >
                                {categories.map((cat, i) => (
                                    <option key={i} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <p className="coming-soon">💡 Kategorivalg kommer snart!</p>
                        </div>

                        <button className="start-btn" onClick={handleStart}>
                            🚀 Opprett Spill
                        </button>
                    </div>
                </div>
            )}

            {/* Info-modal */}
            {showInfo && (
                <div className="modal-overlay" onClick={() => setShowInfo(false)}>
                    <div className="modal info-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>📘 Regler for Tension</h2>
                        <p>
                            Tension er et quizspill der du må tenke raskt og bredt! 🎯
                            <br />
                            <br />
                            💡 Hver runde får dere et spørsmål, hvor dere skal prøve å komme så
                            nærme nummer 10 på listen som mulig.
                            <br />
                            <br />
                            💡 Hvert spørsmål har x antall "tension-svar". Dette er altså svar etter
                            nummer 10 på listen.
                            <br />
                            <br />
                            ✅ Riktige svar gir poeng – jo nærmere nummer 10 på listen, jo bedre!
                            <br />
                            ⚠️ “Tension-svar” gir minus 5 poeng – pass på hva du svarer!
                            <br />
                            ❌ “Feil svar” gir minus 3 poeng
                            <br />
                            <br />
                            🏁 Den med høyest poengsum etter siste spørsmål vinner!
                        </p>

                        <button className="close-info-btn" onClick={() => setShowInfo(false)}>
                            Lukk
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
