import { useState } from "react";
import { fetchRandomQuestions } from "./api";
import type { QuestionView } from "./types";
import LandingPage from "./LandingPage";
import PlayerSetup from "./PlayerSetup";
import GameCenter from "./GameCenter";
import GameOver from "./GameOver";

export default function App() {
    const [questions, setQuestions] = useState<QuestionView[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [numPlayers, setNumPlayers] = useState(2);
    const [numQuestions, setNumQuestions] = useState(5);
    const [stage, setStage] = useState<"landing" | "setup" | "game" | "done">("landing");
    const [playerNames, setPlayerNames] = useState<string[]>([]);
    const [finalScores, setFinalScores] = useState<Record<string, number>>({}); // ✅ new

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

    // ✅ Called when GameCenter finishes
    const handleGameOver = (scores: Record<string, number>) => {
        setFinalScores(scores);
        setStage("done");
    };

    // ✅ Reset game to start over
    const resetGame = () => {
        setQuestions([]);
        setPlayerNames([]);
        setFinalScores({});
        setStage("landing");
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
                onGameOver={handleGameOver} // ✅ pass scores up
            />
        );
    }

    if (stage === "done") {
        return <GameOver scores={finalScores} onPlayAgain={resetGame} />;
    }

    return null;
}