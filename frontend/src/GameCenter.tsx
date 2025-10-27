import React, { useState } from "react";
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
}

export default function GameCenter({ questions, playerNames, onGameOver }: GameCenterProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [scores, setScores] = useState<Record<string, number>>(
        Object.fromEntries(playerNames.map((p) => [p, 0]))
    );

    const question = questions[currentQuestionIndex];

    const handleAnswerSubmit = (answer: string) => {
        if (!answer.trim()) return;

        const newAnswers = [
            ...answers,
            { player: playerNames[currentPlayer], answer: answer.trim() },
        ];

        setAnswers(newAnswers);
        if (currentPlayer + 1 < playerNames.length) {
            setCurrentPlayer(currentPlayer + 1);
        } else {
            setCurrentPlayer(0);
        }
    };

    const handleReveal = () => {
        const updatedAnswers = answers.map((a) => {
            const foundTop = question.answers.find(
                (ans) => ans.text.toLowerCase() === a.answer.toLowerCase()
            );
            const foundTension = question.tensionAnswers.find(
                (ans) => ans.text.toLowerCase() === a.answer.toLowerCase()
            );

            let scoreDelta = 0;
            if (foundTop) scoreDelta = foundTop.index + 1;
            else if (foundTension) scoreDelta = -5;
            else scoreDelta = -3;

            return { ...a, score: scoreDelta };
        });

        // Update total scores
        const newScores = { ...scores };
        updatedAnswers.forEach((a) => {
            newScores[a.player] += a.score ?? 0;
        });

        setScores(newScores);
        setAnswers(updatedAnswers);
        setRevealed(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setAnswers([]);
            setRevealed(false);
            setCurrentPlayer(0);
        } else {
            onGameOver();
        }
    };

    const allAnswered = answers.length === playerNames.length;

    return (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <h2>
                Question {currentQuestionIndex + 1} / {questions.length}
            </h2>
            <h3>{question.title}</h3>

            {!revealed && (
                <div style={{ marginTop: 20 }}>
                    {!allAnswered ? (
                        <>
                            <p>
                                <strong>{playerNames[currentPlayer]}</strong>, your turn:
                            </p>
                            <AnswerInput onSubmit={handleAnswerSubmit} />
                        </>
                    ) : (
                        <button onClick={handleReveal}>Reveal Answers</button>
                    )}
                </div>
            )}

            {revealed && (
                <div>
                    <h4>Results</h4>
                    <table
                        style={{
                            margin: "0 auto",
                            borderCollapse: "collapse",
                            minWidth: 300,
                        }}
                    >
                        <thead>
                        <tr>
                            <th style={{ borderBottom: "1px solid #ccc" }}>Player</th>
                            <th style={{ borderBottom: "1px solid #ccc" }}>Answer</th>
                            <th style={{ borderBottom: "1px solid #ccc" }}>Points</th>
                        </tr>
                        </thead>
                        <tbody>
                        {answers.map((a, i) => (
                            <tr key={i}>
                                <td>{a.player}</td>
                                <td>{a.answer}</td>
                                <td>{a.score}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <h4 style={{ marginTop: 20 }}>Leaderboard</h4>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {Object.entries(scores)
                            .sort((a, b) => b[1] - a[1])
                            .map(([name, score]) => (
                                <li key={name}>
                                    {name}: {score}
                                </li>
                            ))}
                    </ul>

                    <button onClick={handleNextQuestion}>
                        {currentQuestionIndex + 1 < questions.length
                            ? "Next Question"
                            : "Finish Game"}
                    </button>
                </div>
            )}
        </div>
    );
}

const AnswerInput: React.FC<{ onSubmit: (answer: string) => void }> = ({ onSubmit }) => {
    const [value, setValue] = useState("");

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(value);
                setValue("");
            }}
            style={{ display: "inline-flex", gap: 8 }}
        >
            <input
                type="text"
                placeholder="Enter answer"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{ padding: "6px 10px" }}
            />
            <button type="submit">Submit</button>
        </form>
    );
};
