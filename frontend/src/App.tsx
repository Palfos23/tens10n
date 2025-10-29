import { useState } from "react";
import { fetchRandomQuestions } from "./api";
import type { QuestionView } from "./types";
import LandingPage from "./LandingPage";
import PlayerSetup from "./PlayerSetup";
import GameCenter from "./GameCenter";
import GameOver from "./GameOver";
import LoadingScreen from "./LoadingScreen";

interface PlayerInfo {
    name: string;
    color: string;
}

export default function App() {
    const [questions, setQuestions] = useState<QuestionView[]>([]);
    const [numPlayers, setNumPlayers] = useState(2);
    const [stage, setStage] = useState<"landing" | "setup" | "loading" | "game" | "done">("landing");
    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    const [finalScores, setFinalScores] = useState<Record<string, number>>({});
    const [numQuestions, setNumQuestions] = useState(5);

    // === Opprett nytt spill ===
    const handleCreateGame = (p: number, q: number) => {
        setNumPlayers(p);
        setNumQuestions(q);
        setStage("setup");
    };

    // === Når spilleroppsett er ferdig ===
    const handlePlayerSetupDone = async (playerList: PlayerInfo[]) => {
        setPlayers(playerList);
        setStage("loading"); // 👈 Vis loading screen

        try {
            const data = await fetchRandomQuestions(numQuestions);
            setQuestions(data);

            // Simulerer litt lastetid for smooth overgang
            setTimeout(() => {
                setStage("game");
            }, 4500);
        } catch (e: any) {
            alert(e?.message ?? "Kunne ikke laste spørsmål.");
            setStage("landing");
        }
    };

    // === Når spillet er ferdig ===
    const handleGameOver = (scores: Record<string, number>) => {
        setFinalScores(scores);
        setStage("done");
    };

    // === Nullstill spillet ===
    const resetGame = () => {
        setQuestions([]);
        setPlayers([]);
        setFinalScores({});
        setStage("landing");
    };

    // === Stage-visning ===
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
                players={players}
                onGameOver={handleGameOver}
            />
        );

    if (stage === "done") return <GameOver scores={finalScores} onPlayAgain={resetGame} />;

    return null;
}
