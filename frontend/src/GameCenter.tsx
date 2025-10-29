import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { QuestionView } from "./types";
import StarBackground from "./StarBackground";
import AnswerModal from "./AnswerModal";

interface PlayerInfo {
    name: string;
    color: string;
}

interface GameCenterProps {
    questions: QuestionView[];
    players: PlayerInfo[];
    onGameOver: (scores: Record<string, number>) => void;
}

interface PlayerAnswer {
    player: string;
    answer: string;
    score?: number;
    index?: number;
}

export default function GameCenter({ questions, players, onGameOver }: GameCenterProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [scores, setScores] = useState<Record<string, number>>(
        Object.fromEntries(players.map((p) => [p.name, 0]))
    );
    const [pendingScores, setPendingScores] = useState<Record<string, number>>({});
    const [revealIndex, setRevealIndex] = useState(0);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [showIntro, setShowIntro] = useState(true);
    const [introCountdown, setIntroCountdown] = useState(5);

    const question = questions[currentQuestionIndex];
    const playerNames = players.map((p) => p.name);

    // === Roter spillerrekkefølge kun for turrekkefølge ===
    const getRotatedPlayers = (players: string[], questionIndex: number): string[] => {
        const shift = questionIndex % players.length;
        return [...players.slice(shift), ...players.slice(0, shift)];
    };
    const rotatedPlayers = getRotatedPlayers(playerNames, currentQuestionIndex);

    // === Kombiner alle gyldige svar ===
    const allAnswersList = [
        ...question.answers.map((a) => ({ text: a.text, index: a.index, tension: false })),
        ...question.tensionAnswers.map((a) => ({ text: a.text, index: a.index, tension: true })),
    ];

    // === Legg til nytt svar ===
    const handleAnswerSubmit = (answer: string) => {
        if (!answer.trim()) return;
        const newAnswers = [
            ...answers,
            { player: rotatedPlayers[currentPlayer], answer: answer.trim() },
        ];
        setAnswers(newAnswers);
        setCurrentPlayer((p) => (p + 1 < rotatedPlayers.length ? p + 1 : 0));
    };

    // === Poengberegning og reveal ===
    const handleReveal = () => {
        const scoredAnswers = answers.map((a) => {
            const found = allAnswersList.find(
                (ans) => ans.text.toLowerCase() === a.answer.toLowerCase()
            );
            let scoreDelta = 0;
            let idx: number | undefined;
            if (found) {
                idx = found.index;
                scoreDelta = found.tension ? -5 : idx;
            } else {
                scoreDelta = -3;
            }
            return { ...a, score: scoreDelta, index: idx };
        });

        const newTotals = { ...scores };
        scoredAnswers.forEach((a) => {
            const playerKey = playerNames.find((p) => p === a.player);
            if (playerKey) newTotals[playerKey] += a.score ?? 0;
        });

        setPendingScores(newTotals);
        setAnswers(scoredAnswers);
        setRevealed(true);
        setRevealIndex(0);
    };

    // === Auto-reveal countdown ===
    useEffect(() => {
        if (answers.length === rotatedPlayers.length && !revealed) {
            setCountdown(3);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev && prev > 1) return prev - 1;
                    clearInterval(timer);
                    handleReveal();
                    return null;
                });
                return null;
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [answers, revealed, rotatedPlayers.length]);

    // === Reveal animasjon (fikset poengoppdatering) ===
    useEffect(() => {
        if (!revealed) return;

        if (revealIndex < allAnswersList.length) {
            const delay = 1100;
            const timer = setTimeout(() => {
                const next = revealIndex + 1;
                setRevealIndex(next);

                if (next >= allAnswersList.length) {
                    setScores(pendingScores);
                }
            }, delay);
            return () => clearTimeout(timer);
        } else if (revealIndex >= allAnswersList.length) {
            setScores(pendingScores);
        }
    }, [revealed, revealIndex, allAnswersList, pendingScores]);

    // === Intro mellom spørsmål ===
    useEffect(() => {
        setShowIntro(true);
        setIntroCountdown(5);
        const timer = setInterval(() => {
            setIntroCountdown((c) => {
                if (c > 1) return c - 1;
                clearInterval(timer);
                setShowIntro(false);
                return 0;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [currentQuestionIndex]);

    const handleNextQuestion = () => {
        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setAnswers([]);
            setRevealed(false);
            setCurrentPlayer(0);
            setRevealIndex(0);
            setCountdown(null);
        } else {
            onGameOver(scores);
        }
    };

    const allAnswered = answers.length === rotatedPlayers.length;

    const splitPlayers = (players: string[]): [string[], string[]] => {
        const half = Math.ceil(players.length / 2);
        return [players.slice(0, half), players.slice(half)];
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                color: "white",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <StarBackground />

            {/* === HEADER === */}
            <header style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <h2 style={{ opacity: 0.8 }}>
                    Spørsmål {currentQuestionIndex + 1} / {questions.length}
                </h2>
                <h1 style={{ fontSize: "2.6rem", maxWidth: "80%", margin: "0.5rem auto" }}>
                    {question.title}
                </h1>
                <p style={{ opacity: 0.7 }}>
                    Antall “Tension svar”: {question.tensionAnswers.length}
                </p>
            </header>

            {/* === MAIN === */}
            <main
                style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    gap: "3rem",
                    marginTop: "2rem",
                }}
            >
                {(() => {
                    const [leftPlayers, rightPlayers] = splitPlayers(playerNames);

                    const renderPlayerList = (sidePlayers: string[]) => (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {sidePlayers.map((player) => {
                                const playerObj = players.find((p) => p.name === player)!;
                                const pa = answers.find((a) => a.player === player);
                                const roundScore = pa?.score ?? 0;
                                const answerInList = pa?.index !== undefined;
                                const theirAnswerRevealed =
                                    revealed &&
                                    answerInList &&
                                    allAnswersList
                                        .slice(0, revealIndex)
                                        .some(
                                            (ans) =>
                                                ans.text.toLowerCase() === (pa?.answer ?? "").toLowerCase()
                                        );
                                const allRevealed = revealIndex >= allAnswersList.length;
                                const showRoundScore =
                                    revealed && pa && (theirAnswerRevealed || (!answerInList && allRevealed));
                                return (
                                    <div
                                        key={player}
                                        style={{
                                            background: playerObj.color,
                                            borderRadius: 12,
                                            padding: "0.6rem 1rem",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            boxShadow: `0 0 12px rgba(256,256,256,0.5)`,
                                            minWidth: "240px",
                                            transition: "background 0.3s, box-shadow 0.3s",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "flex-start",
                                                gap: "0.2rem",
                                            }}
                                        >
                                            <strong>{player}</strong>
                                            <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                                                {pa ? pa.answer : "— venter —"}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            {showRoundScore && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.4 }}
                                                    style={{
                                                        color:
                                                            roundScore > 0
                                                                ? "#7CFC00"
                                                                : roundScore < 0
                                                                    ? "#ff6961"
                                                                    : "white",
                                                    }}
                                                >
                                                    {roundScore > 0 ? `+${roundScore}` : roundScore}
                                                </motion.div>
                                            )}
                                            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                                                Totalt: {scores[player]}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );

                    return (
                        <>
                            <div>{renderPlayerList(leftPlayers)}</div>
                            {/* === TABLE === */}
                            <div
                                style={{
                                    background: "rgba(255,255,255,0.1)",
                                    borderRadius: 16,
                                    padding: "1.5rem",
                                    width: "480px",
                                    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
                                }}
                            >
                                <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>Svar</h3>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                    <tr style={{ opacity: 0.7 }}>
                                        <th>#</th>
                                        <th>Svar</th>
                                        <th>Spiller</th>
                                        <th>Poeng</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {allAnswersList.map((ans, idx) => {
                                        const revealedNow = revealIndex > idx;
                                        const guessedBy = revealedNow
                                            ? answers.filter(
                                                (a) => a.answer.toLowerCase() === ans.text.toLowerCase()
                                            )
                                            : [];
                                        return (
                                            <motion.tr
                                                key={ans.text}
                                                initial={{ opacity: 0 }}
                                                animate={{
                                                    opacity: 1,
                                                    backgroundColor: revealedNow
                                                        ? ans.tension
                                                            ? [
                                                                "rgba(255,80,80,0.3)",
                                                                "rgba(255,80,80,0.1)",
                                                            ]
                                                            : [
                                                                "rgba(0,255,0,0.3)",
                                                                "rgba(0,255,0,0.05)",
                                                            ]
                                                        : "transparent",
                                                }}
                                                transition={{ duration: revealedNow ? 1.2 : 0.5 }}
                                            >
                                                <td>{ans.index}</td>
                                                <td>{revealedNow ? ans.text : "— ??????? —"}</td>
                                                <td>{revealedNow && guessedBy.map((g) => g.player).join(", ")}</td>
                                                <td>
                                                    {revealedNow && guessedBy.length > 0
                                                        ? guessedBy
                                                            .map((g) => (g.score! > 0 ? `+${g.score}` : g.score))
                                                            .join(", ")
                                                        : ""}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                            <div>{renderPlayerList(rightPlayers)}</div>
                        </>
                    );
                })()}
            </main>

            {/* === FOOTER === */}
            <footer style={{ textAlign: "center", padding: "2rem 0 3rem 0" }}>
                {countdown !== null && !revealed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "1rem" }}
                    >
                        Svarene kommer om {countdown}...
                    </motion.div>
                )}

                {revealed && revealIndex < allAnswersList.length && (
                    <button
                        onClick={() => setRevealIndex(allAnswersList.length)}
                        style={{
                            marginTop: "1rem",
                            padding: "0.6rem 1.5rem",
                            borderRadius: 10,
                            border: "none",
                            background: "rgba(255,255,255,0.15)",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        Hopp over
                    </button>
                )}

                {revealed && revealIndex >= allAnswersList.length && (
                    <button
                        onClick={handleNextQuestion}
                        style={{
                            padding: "0.8rem 2rem",
                            fontSize: "1.2rem",
                            borderRadius: 10,
                            border: "none",
                            background: "#4f46e5",
                            color: "white",
                            fontWeight: "bold",
                            cursor: "pointer",
                            marginTop: "1rem",
                        }}
                    >
                        {currentQuestionIndex + 1 < questions.length
                            ? "Neste Spørsmål"
                            : "Fullfør Spill"}
                    </button>
                )}
            </footer>

            {/* === INTRO === */}
            {showIntro && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        color: "white",
                        zIndex: 999,
                        backdropFilter: "blur(4px)",
                        background: "rgba(0,0,0,0.9)",
                    }}
                >
                    <h1 style={{ fontSize: "2.6rem", textShadow: "0 0 20px #6366f1" }}>
                        {question.title}
                    </h1>
                    <p style={{ fontSize: "1.2rem", opacity: 0.9, marginTop: "1rem" }}>
                        Først ut:{" "}
                        <strong>
                            {players.find((p) => p.name === rotatedPlayers[0])?.name}{" "}
                        </strong>
                    </p>
                    <p style={{ marginTop: "2rem", fontSize: "1.2rem", color: "#a5b4fc" }}>
                        Runden starter om {introCountdown} sek…
                    </p>
                </motion.div>
            )}

            {/* === MODAL === */}
            {!revealed && !allAnswered && !showIntro && (
                <AnswerModal
                    currentPlayer={rotatedPlayers[currentPlayer]}
                    questionTitle={question.title}
                    tensionAnswers={question.tensionAnswers.length}
                    category={question.answersCategory}
                    onSubmit={handleAnswerSubmit}
                    answeredPlayers={answers.map((a) => a.player)}
                    allPlayers={rotatedPlayers}
                />
            )}
        </div>
    );
}
