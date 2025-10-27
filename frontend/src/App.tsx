import { useState } from "react";
import { fetchRandomQuestions } from "./api";
import type { QuestionView } from "./types";
import LandingPage from "./LandingPage";
import PlayerSetup from "./PlayerSetup";
import GameCenter from "./GameCenter";

export default function App() {
    const [questions, setQuestions] = useState<QuestionView[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [numPlayers, setNumPlayers] = useState(2);
    const [numQuestions, setNumQuestions] = useState(5);
    const [stage, setStage] = useState<"landing" | "setup" | "game" | "done">("landing");
    const [playerNames, setPlayerNames] = useState<string[]>([]);

    const handleCreateGame = async (p: number, q: number) => {
        setNumPlayers(p);
        setNumQuestions(q);
        setStage("setup");
        setLoading(true);
        try {
            const data = await fetchRandomQuestions(q);
            setQuestions(data);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    if (stage === "landing") {
        return <LandingPage onStartGame={handleCreateGame} />;
    }

    if (stage === "setup") {
        return (
            <PlayerSetup
                numPlayers={numPlayers}
                onStart={(names) => {
                    setPlayerNames(names);
                    setStage("game");
                }}
            />
        );
    }

    if (stage === "game") {
        return (
            <GameCenter
                questions={questions}
                playerNames={playerNames}
                onGameOver={() => setStage("done")}
            />
        );
    }

    if (stage === "done") {
        return (
            <div style={{ textAlign: "center", marginTop: "4rem" }}>
                <h1>Game Over 🎉</h1>
                <p>Thanks for playing Tens10n!</p>
                <button onClick={() => setStage("landing")}>Play Again</button>
            </div>
        );
    }

    return null;
}
