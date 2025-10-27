import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import type { QuestionView } from "./types";
import { fetchPossibleAnswers } from "./api"; // fetches from /api/answers
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

    const question = questions[currentQuestionIndex];

    const allAnswersList = [
        ...question.answers.map((a) => ({ text: a.text, index: a.index, tension: false })),
        ...question.tensionAnswers.map((a) => ({ text: a.text, index: a.index, tension: true })),
    ];

    const handleAnswerSubmit = (answer: string) => {
        if (!answer.trim()) return;
        const newAnswers = [
            ...answers,
            { player: playerNames[currentPlayer], answer: answer.trim() },
        ];
        setAnswers(newAnswers);
        setCurrentPlayer((p) => (p + 1 < playerNames.length ? p + 1 : 0));
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

    useEffect(() => {
        if (!revealed) return;
        if (revealIndex < allAnswersList.length) {
            const delay = 1600 + Math.random() * 600;
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
        } else {
            onGameOver(scores);
        }
    };

    const allAnswered = answers.length === playerNames.length;

    // helper: split players into left/right evenly
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
                overflowY: "auto",         // ← allow vertical scrolling
                overflowX: "hidden",
            }}
        >
            <StarBackground />
            {/* === TOP === */}
            <header
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    paddingTop: "1.5rem",
                }}
            >
                <h2 style={{ fontSize: "1.4rem", opacity: 0.8, marginBottom: "0.5rem" }}>
                    Spørsmål {currentQuestionIndex + 1} / {questions.length}
                </h2>
                <h1
                    style={{
                        fontSize: "2.8rem",
                        maxWidth: "80%",
                        fontWeight: 700,
                        lineHeight: 1.2,
                        marginBottom: "0.4rem",
                    }}
                >
                    {question.title}
                </h1>
                <p
                    style={{
                        fontSize: "1rem",
                        opacity: 0.8,
                        marginTop: "0.2rem",
                        fontStyle: "italic",
                    }}
                >
                    Antall "Tension svar": {question.tensionAnswers.length}
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
                    width: "100%",
                    marginTop: "2rem",
                }}
            >
                {(() => {
                    const [leftPlayers, rightPlayers] = splitPlayers(playerNames);

                    const renderPlayerList = (sidePlayers: string[]) => (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.8rem",
                                minWidth: "220px",
                                alignItems: "stretch",
                            }}
                        >
                            {sidePlayers.map((player) => {
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
                                                ans.text.toLowerCase() ===
                                                (pa?.answer ?? "").toLowerCase()
                                        );
                                const allRevealed = revealIndex >= allAnswersList.length;
                                const showRoundScore =
                                    revealed &&
                                    pa !== undefined &&
                                    (theirAnswerRevealed ||
                                        (!answerInList && allRevealed));

                                return (
                                    <div
                                        key={player}
                                        style={{
                                            background: "rgba(255,255,255,0.1)",
                                            borderRadius: 10,
                                            padding: "0.6rem 1rem",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            minWidth: "220px",
                                            boxShadow: "0 0 6px rgba(0,0,0,0.3)",
                                        }}
                                    >
                                        <div style={{ textAlign: "left" }}>
                                            <strong>{player}</strong>
                                            <div
                                                style={{
                                                    fontSize: "0.9rem",
                                                    opacity: 0.8,
                                                    fontStyle: pa ? "normal" : "italic",
                                                }}
                                            >
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
                                                        fontSize: "1rem",
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
                                            <div
                                                style={{
                                                    fontSize: "0.9rem",
                                                    opacity: 0.7,
                                                    marginTop: "0.2rem",
                                                }}
                                            >
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
                            {/* LEFT PLAYERS */}
                            <div style={{ flex: "0 0 auto" }}>{renderPlayerList(leftPlayers)}</div>

                            {/* CENTER TABLE */}
                            <div
                                style={{
                                    background: "rgba(255,255,255,0.1)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: 16,
                                    padding: "1.5rem 1.2rem",
                                    width: "480px",
                                    minHeight: "450px",
                                    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                }}
                            >
                                <h3
                                    style={{
                                        textAlign: "center",
                                        fontWeight: 500,
                                        letterSpacing: "1px",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    Answers
                                </h3>
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        textAlign: "left",
                                    }}
                                >
                                    <thead>
                                    <tr style={{ opacity: 0.7, fontSize: "1rem" }}>
                                        <th>#</th>
                                        <th>Answer</th>
                                        <th>Player</th>
                                        <th>Score</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {allAnswersList.map((ans, idx) => {
                                        const revealedNow = revealIndex > idx;
                                        const guessedBy = revealedNow
                                            ? answers.filter(
                                                (a) =>
                                                    a.answer.toLowerCase() ===
                                                    ans.text.toLowerCase()
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
                                                transition={{
                                                    duration: revealedNow ? 1.2 : 0.5,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                <td>{ans.index}</td>
                                                <td>{revealedNow ? ans.text : "— ??????? —"}</td>
                                                <td>
                                                    {revealedNow && guessedBy.length > 0
                                                        ? guessedBy
                                                            .map((g) => g.player)
                                                            .join(", ")
                                                        : ""}
                                                </td>
                                                <td>
                                                    {revealedNow && guessedBy.length > 0
                                                        ? guessedBy
                                                            .map((g) =>
                                                                g.score! > 0
                                                                    ? `+${g.score}`
                                                                    : g.score
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

                            {/* RIGHT PLAYERS */}
                            <div style={{ flex: "0 0 auto" }}>
                                {renderPlayerList(rightPlayers)}
                            </div>
                        </>
                    );
                })()}
            </main>

            {/* === FOOTER INPUT === */}
            <footer
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "2rem 0 3rem 0",
                    background: "transparent",
                }}
            >
                {!revealed && (
                    <>
                        {!allAnswered ? (
                            <>
                                <p style={{ marginBottom: "0.8rem", fontSize: "1.3rem" }}>
                                    <strong>{playerNames[currentPlayer]}</strong>, din tur:
                                </p>
                                <div
                                    style={{
                                        background: "rgba(255,255,255,0.08)",
                                        padding: "1.5rem 2rem",
                                        borderRadius: 12,
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                                        width: "60%",
                                        maxWidth: "700px",
                                    }}
                                >
                                    <AnswerInput
                                        onSubmit={handleAnswerSubmit}
                                        category={question.answersCategory}
                                    />
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={handleReveal}
                                style={{
                                    marginTop: "0.5rem",
                                    padding: "0.8rem 2rem",
                                    fontSize: "1.2rem",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#4f46e5",
                                    color: "white",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                }}
                            >
                                Reveal Answers
                            </button>
                        )}
                    </>
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
                            ? "Next Question"
                            : "Finish Game"}
                    </button>
                )}
            </footer>
        </div>
    );
}

/* === Autocomplete Input Component (unchanged, just kept clean) === */
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
                console.log("✅ All possible answers loaded:", options);
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

    const [highlight, setHighlight] = useState<number>(-1);
    useEffect(() => setHighlight(-1), [showDropdown, filteredOptions]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || filteredOptions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, filteredOptions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
        } else if (e.key === "Enter" && highlight >= 0) {
            e.preventDefault();
            handleSelect(filteredOptions[highlight]);
        } else if (e.key === "Escape") setShowDropdown(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                width: "100%",
            }}
        >
            <input
                type="text"
                placeholder="Svar her…"
                value={value}
                onChange={handleChange}
                onFocus={() => value.length >= 1 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                onKeyDown={onKeyDown}
                style={{
                    width: "100%",
                    padding: "0.8rem",
                    fontSize: "1.1rem",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    textAlign: "center",
                    outline: "none",
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
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}
                >
                    {(filteredOptions.length > 0 ? filteredOptions : ["— No matches —"]).map(
                        (opt, i) => {
                            const isPlaceholder = opt === "— No matches —";
                            const active = i === highlight && !isPlaceholder;
                            return (
                                <li
                                    key={`${opt}-${i}`}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => !isPlaceholder && handleSelect(opt)}
                                    onMouseEnter={() => !isPlaceholder && setHighlight(i)}
                                    style={{
                                        padding: "0.65rem 1rem",
                                        cursor: isPlaceholder ? "default" : "pointer",
                                        textAlign: "center",
                                        color: "white",
                                        background: active
                                            ? "rgba(255,255,255,0.12)"
                                            : "transparent",
                                        borderBottom:
                                            i <
                                            (filteredOptions.length > 0
                                                ? filteredOptions.length
                                                : 1) -
                                            1
                                                ? "1px solid rgba(255,255,255,0.06)"
                                                : "none",
                                        opacity: isPlaceholder ? 0.7 : 1,
                                        fontStyle: isPlaceholder ? "italic" : "normal",
                                        userSelect: "none",
                                    }}
                                >
                                    {opt}
                                </li>
                            );
                        }
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
                    background: validSelection
                        ? "#4f46e5"
                        : "gray",
                    color: "white",
                    fontWeight: "bold",
                    cursor: validSelection ? "pointer" : "not-allowed",
                    opacity: validSelection ? 1 : 0.6,
                }}
            >
                Send inn
            </button>
        </form>
    );
};
