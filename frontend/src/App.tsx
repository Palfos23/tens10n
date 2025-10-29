import { useState } from "react";
import { fetchRandomQuestions } from "./api";
import type { QuestionView } from "./types";
import LandingPage from "./LandingPage";
import PlayerSetup from "./PlayerSetup";
import GameCenter from "./GameCenter";
import GameOver from "./GameOver";
import LoadingScreen from "./LoadingScreen";

export default function App() {
    const [questions, setQuestions] = useState<QuestionView[]>([]);
    const [numPlayers, setNumPlayers] = useState(2);
    const [stage, setStage] = useState<"landing" | "setup" | "loading" | "game" | "done">("landing");
    const [playerNames, setPlayerNames] = useState<string[]>([]);
    const [finalScores, setFinalScores] = useState<Record<string, number>>({});
    const [numQuestions, setNumQuestions] = useState(5);
    //const [category, setCategory] = useState("Tilfeldig (alle kategorier)");

    const handleCreateGame = (p: number, q: number/*, c: string*/) => {
        setNumPlayers(p);
        setNumQuestions(q);
        //setCategory(c);
        setStage("setup");
    };

    const handlePlayerSetupDone = async (names: string[]) => {
        setPlayerNames(names);
        setStage("loading"); // 👈 Vis loading screen

        try {
            const data = await fetchRandomQuestions(numQuestions);
            setQuestions(data);

            // Simulerer litt lastetid for smooth overgang
            setTimeout(() => {
                setStage("game");
            }, 4500);
        } catch (e: any) {
            alert(e?.message ?? "Failed to load questions.");
            setStage("landing");
        }
    };

    const handleGameOver = (scores: Record<string, number>) => {
        setFinalScores(scores);
        setStage("done");
    };

    const resetGame = () => {
        setQuestions([]);
        setPlayerNames([]);
        setFinalScores({});
        setStage("landing");
    };

    // ---- Stage rendering ----
    if (stage === "landing") return <LandingPage onStartGame={handleCreateGame} />;

    if (stage === "setup")
        return <PlayerSetup numPlayers={numPlayers} onStart={handlePlayerSetupDone} />;

    if (stage === "loading")
        return (
            <LoadingScreen
                onComplete={() => {
                    setStage("game");
                }}
            />
        );

    if (stage === "game")
        return (
            <GameCenter
                questions={questions}
                playerNames={playerNames}
                onGameOver={handleGameOver}
            />
        );

    if (stage === "done") return <GameOver scores={finalScores} onPlayAgain={resetGame} />;

    return null;
}