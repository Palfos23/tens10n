import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import type { QuestionView } from "./types";
import { fetchPossibleAnswers } from "./api";
import StarBackground from "./StarBackground";

interface GameCenterProps {
    questions: QuestionView[];
    playerNames: string[];
    onGameOver: (scores: Record<string, number>) => void;
}

interface PlayerAnswer {
    player: string;
    answer: string;
    score?: number;
    index?: number;
}

export default function GameCenter({
                                       questions,
                                       playerNames,
                                       onGameOver,
                                   }: GameCenterProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [scores, setScores] = useState<Record<string, number>>(
        Object.fromEntries(playerNames.map((p) => [p, 0]))
    );
    const [pendingScores, setPendingScores] = useState<Record<string, number>>({});
    const [revealIndex, setRevealIndex] = useState(0);
    const [countdown, setCountdown] = useState<number | null>(null);

    const question = questions[currentQuestionIndex];

    // === Rotér spillerrekkefølge per spørsmål ===
    const getRotatedPlayers = (players: string[], questionIndex: number): string[] => {
        const shift = questionIndex % players.length;
        return [...players.slice(shift), ...players.slice(0, shift)];
    };

    const rotatedPlayers = getRotatedPlayers(playerNames, currentQuestionIndex);

    const allAnswersList = [
        ...question.answers.map((a) => ({ text: a.text, index: a.index, tension: false })),
        ...question.tensionAnswers.map((a) => ({ text: a.text, index: a.index, tension: true })),
    ];

    const handleAnswerSubmit = (answer: string) => {
        if (!answer.trim()) return;
        const newAnswers = [
            ...answers,
            { player: rotatedPlayers[currentPlayer], answer: answer.trim() },
        ];
        setAnswers(newAnswers);
        setCurrentPlayer((p) => (p + 1 < rotatedPlayers.length ? p + 1 : 0));
    };

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
            newTotals[a.player] += a.score ?? 0;
        });

        setPendingScores(newTotals);
        setAnswers(scoredAnswers);
        setRevealed(true);
        setRevealIndex(0);
    };

    // === AUTO-REVEAL COUNTDOWN ===
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

    // === REVEAL ANIMATION ===
    useEffect(() => {
        if (!revealed) return;
        if (revealIndex < allAnswersList.length) {
            const delay = 1100;
            const timer = setTimeout(() => {
                const next = revealIndex + 1;
                setRevealIndex(next);

                const revealedAnswers = allAnswersList
                    .slice(0, next)
                    .map((a) => a.text.toLowerCase());
                answers.forEach((a) => {
                    const inList = a.index !== undefined;
                    const wasRevealed =
                        (inList && revealedAnswers.includes(a.answer.toLowerCase())) ||
                        (!inList && next >= allAnswersList.length);
                    if (wasRevealed && scores[a.player] !== pendingScores[a.player]) {
                        setScores((s) => ({ ...s, [a.player]: pendingScores[a.player] }));
                    }
                });
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [revealed, revealIndex, allAnswersList, answers, pendingScores, scores]);

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
                overflowY: "auto",
                overflowX: "hidden",
                position: "relative",
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
                    Antall "Tension svar": {question.tensionAnswers.length}
                </p>
                <p
                    style={{
                        fontSize: "1rem",
                        opacity: 0.9,
                        marginTop: "0.4rem",
                        fontStyle: "italic",
                    }}
                >
                    Først ut denne runden: <strong>{rotatedPlayers[0]}</strong>
                </p>
            </header>

            {/* === MAIN AREA === */}
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
                    const [leftPlayers, rightPlayers] = splitPlayers(rotatedPlayers);

                    const renderPlayerList = (sidePlayers: string[]) => (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {sidePlayers.map((player) => {
                                const pa = answers.find((a) => a.player === player);
                                const roundScore = pa?.score ?? 0;
                                const answerInList = pa?.index !== undefined;
                                const theirAnswerRevealed =
                                    revealed &&
                                    answerInList &&
                                    allAnswersList
                                        .slice(0, revealIndex)
                                        .some((ans) => ans.text.toLowerCase() === (pa?.answer ?? "").toLowerCase());
                                const allRevealed = revealIndex >= allAnswersList.length;
                                const showRoundScore =
                                    revealed &&
                                    pa !== undefined &&
                                    (theirAnswerRevealed || (!answerInList && allRevealed));

                                // Fremhev den som starter runden
                                const isStarter = player === rotatedPlayers[0];

                                return (
                                    <div
                                        key={player}
                                        style={{
                                            background: isStarter
                                                ? "rgba(79,70,229,0.3)"
                                                : "rgba(255,255,255,0.1)",
                                            borderRadius: 10,
                                            padding: "0.6rem 1rem",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            boxShadow: "0 0 6px rgba(0,0,0,0.3)",
                                            minWidth: "220px",
                                            transition: "background 0.3s",
                                        }}
                                    >
                                        <div>
                                            <strong>{player}</strong>
                                            <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                                                {pa ? pa.answer : "— venter på svar —"}
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

                            {/* CENTER TABLE */}
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
                                        <th>Poengsum</th>
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
                                                            ? ["rgba(255,80,80,0.3)", "rgba(255,80,80,0.1)"]
                                                            : ["rgba(0,255,0,0.3)", "rgba(0,255,0,0.05)"]
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
                                                            .map((g) =>
                                                                g.score! > 0 ? `+${g.score}` : g.score
                                                            )
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

            {/* === FOOTER (Countdown, Skip, Next) === */}
            <footer
                style={{
                    textAlign: "center",
                    padding: "2rem 0 3rem 0",
                }}
            >
                {countdown !== null && !revealed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            fontSize: "2rem",
                            fontWeight: "bold",
                            marginTop: "1rem",
                        }}
                    >
                        🔥 Revealing in {countdown}...
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
                        ⏩ Hopp over reveal
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

            {/* === FLOATING ANSWER MODAL === */}
            {!revealed && !allAnswered && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0, 0, 0, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 999,
                    }}
                >
                    <div
                        style={{
                            background: "rgba(10, 10, 10, 0.8)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "16px",
                            padding: "2rem 2.5rem",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                            width: "min(500px, 90%)",
                            textAlign: "center",
                            color: "white",
                            backdropFilter: "blur(8px)",
                        }}
                    >
                        <h3
                            style={{
                                marginBottom: "1rem",
                                fontWeight: 600,
                                fontSize: "1.4rem",
                                color: "white",
                            }}
                        >
                            {rotatedPlayers[currentPlayer]}, din tur
                        </h3>

                        <p
                            style={{
                                fontSize: "1rem",
                                opacity: 0.9,
                                marginBottom: "1.2rem",
                                fontStyle: "italic",
                            }}
                        >
                            {question.title}
                        </p>

                        <AnswerInput
                            onSubmit={handleAnswerSubmit}
                            category={question.answersCategory}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/* === Autocomplete Input (samme som før) === */
const AnswerInput: React.FC<{ onSubmit: (answer: string) => void; category: string }> = ({
                                                                                             onSubmit,
                                                                                             category,
                                                                                         }) => {
    const [value, setValue] = useState("");
    const [allOptions, setAllOptions] = useState<string[]>([]);
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [validSelection, setValidSelection] = useState(false);
    const cacheRef = React.useRef<Map<string, string[]>>(new Map());

    useEffect(() => {
        async function loadOptions() {
            if (!category) return;
            const key = category.toLowerCase();
            if (cacheRef.current.has(key)) {
                setAllOptions(cacheRef.current.get(key)!);
                return;
            }
            try {
                const options = await fetchPossibleAnswers(key);
                setAllOptions(options);
                cacheRef.current.set(key, options);
            } catch (e) {
                console.error("Failed to load possible answers:", e);
            }
        }
        loadOptions();
    }, [category]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        setValidSelection(false);
        if (newValue.length >= 3) {
            const filtered = allOptions
                .filter((opt) => opt.toLowerCase().includes(newValue.toLowerCase()))
                .slice(0, 12);
            setFilteredOptions(filtered);
            setShowDropdown(true);
        } else {
            setFilteredOptions([]);
            setShowDropdown(false);
        }
    };

    const handleSelect = (selected: string) => {
        setValue(selected);
        setShowDropdown(false);
        setValidSelection(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validSelection) {
            onSubmit(value);
            setValue("");
            setValidSelection(false);
        } else {
            alert("Please select a valid answer from the list.");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ position: "relative" }}>
            <input
                type="text"
                placeholder="Svar her…"
                value={value}
                onChange={handleChange}
                style={{
                    width: "100%",
                    padding: "0.8rem",
                    fontSize: "1.1rem",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    textAlign: "center",
                }}
            />
            {showDropdown && (
                <ul
                    style={{
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        position: "absolute",
                        bottom: "110%",
                        left: 0,
                        width: "100%",
                        background: "rgba(20,20,20,0.98)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "10px 10px 0 0",
                        maxHeight: "220px",
                        overflowY: "auto",
                        zIndex: 9999,
                    }}
                >
                    {(filteredOptions.length > 0 ? filteredOptions : ["— No matches —"]).map(
                        (opt, i) => (
                            <li
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                style={{
                                    padding: "0.65rem 1rem",
                                    cursor: "pointer",
                                    textAlign: "center",
                                    color: "white",
                                    opacity: opt === "— No matches —" ? 0.7 : 1,
                                    fontStyle: opt === "— No matches —" ? "italic" : "normal",
                                }}
                            >
                                {opt}
                            </li>
                        )
                    )}
                </ul>
            )}
            <button
                type="submit"
                style={{
                    marginTop: "1rem",
                    padding: "0.8rem 1.6rem",
                    borderRadius: 10,
                    border: "none",
                    background: validSelection ? "#4f46e5" : "gray",
                    color: "white",
                    fontWeight: "bold",
                    cursor: validSelection ? "pointer" : "not-allowed",
                }}
            >
                Send inn
            </button>
        </form>
    );
};