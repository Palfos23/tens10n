import React, { useState, useEffect } from "react";
import "./LandingPage.css";

interface Star {
    top: number;
    left: number;
    delay: number;
}

interface LandingPageProps {
    onStartGame: (numPlayers: number, numQuestions: number) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartGame }) => {
    const [open, setOpen] = useState(false);
    const [numPlayers, setNumPlayers] = useState("2");
    const [numQuestions, setNumQuestions] = useState("5");
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        const starArray: Star[] = Array.from({ length: 80 }).map(() => ({
            top: Math.random() * 100,
            left: Math.random() * 100,
            delay: Math.random() * 5,
        }));
        setStars(starArray);
    }, []);

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

            <h1 className="title">
                tens<span className="highlight">10</span>n
            </h1>

            <button className="create-btn" onClick={() => setOpen(true)}>
                Create Game
            </button>

            {open && (
                <div className="modal-overlay" onClick={() => setOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Create Game</h2>

                        <div className="form-group">
                            <label>Number of Players</label>
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
                            <label>Number of Questions</label>
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

                        <button
                            className="start-btn"
                            onClick={() =>
                                onStartGame(parseInt(numPlayers, 10), parseInt(numQuestions, 10))
                            }
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
