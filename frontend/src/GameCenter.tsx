import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import type { QuestionView } from "./types";

interface GameCenterProps {
    questions: QuestionView[];
    playerNames: string[];
    onGameOver: () => void;
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
        ...question.answers.map((a) => ({
            text: a.text,
            index: a.index,
            tension: false,
        })),
        ...question.tensionAnswers.map((a) => ({
            text: a.text,
            index: a.index,
            tension: true,
        })),
    ];

    const handleAnswerSubmit = (answer: string) => {
        if (!answer.trim()) return;
        const newAnswers = [
            ...answers,
            { player: playerNames[currentPlayer], answer: answer.trim() },
        ];
        setAnswers(newAnswers);
        setCurrentPlayer((p) =>
            p + 1 < playerNames.length ? p + 1 : 0
        );
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
            const delay = 1500 + Math.random() * 500;
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
            onGameOver();
        }
    };

    const allAnswered = answers.length === playerNames.length;

    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                display: "grid",
                gridTemplateRows: "20% 60% 20%",
                background: "linear-gradient(180deg, #0f2027, #203a43, #2c5364)",
                color: "white",
                overflow: "hidden",
            }}
        >
            {/* === TOP: QUESTION === */}
            <header
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                <h2 style={{ fontSize: "1.4rem", opacity: 0.8, marginBottom: "0.5rem" }}>
                    Question {currentQuestionIndex + 1} / {questions.length}
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
                    Tension answers: {question.tensionAnswers.length}
                </p>
            </header>

            {/* === MIDDLE === */}
            <main
                style={{
                    display: "grid",
                    gridTemplateColumns: "35% 10% 55%",
                    alignItems: "center",
                    width: "100%",
                }}
            >
                {/* LEFT: Players */}
                <div
                    style={{
                        paddingLeft: "8%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.8rem",
                    }}
                >
                    <h3 style={{ textAlign: "left", opacity: 0.8 }}>Players</h3>
                    {playerNames.map((player) => {
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
                                    minWidth: "250px",
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
                                        {pa ? pa.answer : "— awaiting answer —"}
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
                                        Total: {scores[player]}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* SPACER */}
                <div></div>

                {/* RIGHT: Answers Table */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-start", // ✅ pull table inward (to the left)
                        paddingLeft: "4rem", // ✅ space from right edge inward
                        paddingRight: "2rem",
                    }}
                >
                    <div
                        style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: 16,
                            padding: "1.5rem 1.2rem",
                            width: "430px",
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
                            {revealed ? (
                                <AnimatePresence>
                                    {allAnswersList.slice(0, revealIndex).map((ans) => {
                                        const guessedBy = answers.filter(
                                            (a) => a.answer.toLowerCase() === ans.text.toLowerCase()
                                        );
                                        return (
                                            <motion.tr
                                                key={ans.text}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5 }}
                                                style={{
                                                    backgroundColor: ans.tension
                                                        ? "rgba(255, 80, 80, 0.15)" // 🔴 Red tint
                                                        : "rgba(0,255,0,0.05)",
                                                }}
                                            >
                                                <td>{ans.index}</td>
                                                <td>{ans.text}</td>
                                                <td>
                                                    {guessedBy.length > 0
                                                        ? guessedBy.map((g) => g.player).join(", ")
                                                        : ""}
                                                </td>
                                                <td>
                                                    {guessedBy.length > 0
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
                                </AnimatePresence>
                            ) : (
                                allAnswersList.map((a) => (
                                    <tr key={a.text}>
                                        <td style={{ opacity: 0.3 }}>{a.index}</td>
                                        <td
                                            style={{
                                                color: "rgba(255,255,255,0.15)",
                                                fontStyle: "italic",
                                            }}
                                        >
                                            — hidden —
                                        </td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* BOTTOM: Input */}
            <footer
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.05)",
                    padding: "1rem 0",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
            >
                {!revealed && (
                    <>
                        {!allAnswered ? (
                            <>
                                <p style={{ marginBottom: "0.8rem", fontSize: "1.3rem" }}>
                                    <strong>{playerNames[currentPlayer]}</strong>, your turn:
                                </p>
                                <AnswerInput onSubmit={handleAnswerSubmit} />
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
                                    background: "linear-gradient(90deg, #00c6ff, #0072ff)",
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
                            background: "linear-gradient(90deg, #00c6ff, #0072ff)",
                            color: "white",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        {currentQuestionIndex + 1 < questions.length ? "Next Question" : "Finish Game"}
                    </button>
                )}
            </footer>
        </div>
    );
}

// === Input ===
const AnswerInput: React.FC<{ onSubmit: (answer: string) => void }> = ({
                                                                           onSubmit,
                                                                       }) => {
    const [value, setValue] = useState("");

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (value.trim()) onSubmit(value);
                setValue("");
            }}
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
        >
            <input
                type="text"
                placeholder="Enter answer"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{
                    width: "50%",
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
            <button
                type="submit"
                style={{
                    padding: "0.8rem 1.6rem",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #00C9FF, #92FE9D)",
                    fontWeight: "bold",
                    cursor: "pointer",
                }}
            >
                Submit
            </button>
        </form>
    );
};