import { useState } from "react";
import { fetchRandomQuestions } from "./api";
import type { QuestionView } from "./types";
import LandingPage from "./LandingPage";
import PlayerSetup from "./PlayerSetup";
import GameCenter from "./GameCenter";
import GameOver from "./GameOver";

export default function App() {
    const [questions, setQuestions] = useState<QuestionView[]>([]);
    const [numPlayers, setNumPlayers] = useState(2);
    const [stage, setStage] = useState<"landing" | "setup" | "game" | "done">("landing");
    const [playerNames, setPlayerNames] = useState<string[]>([]);
    const [finalScores, setFinalScores] = useState<Record<string, number>>({});

    // ✅ Accept both player count and question count
    const handleCreateGame = async (p: number, q: number) => {
        setNumPlayers(p);
        setStage("setup");
        try {
            const data = await fetchRandomQuestions(q); // ✅ use chosen number of questions
            setQuestions(data);
        } catch (e: any) {
            alert(e?.message ?? "Failed to load questions.");
            setQuestions([]);
        }
    };


    // ✅ When the game ends, store scores
    const handleGameOver = (scores: Record<string, number>) => {
        setFinalScores(scores);
        setStage("done");
    };

    // ✅ Reset to the start
    const resetGame = () => {
        setQuestions([]);
        setPlayerNames([]);
        setFinalScores({});
        setStage("landing");
    };

    // ---- Stage rendering ----
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
                onGameOver={handleGameOver}
            />
        );
    }

    if (stage === "done") {
        return <GameOver scores={finalScores} onPlayAgain={resetGame} />;
    }

    return null;
}
