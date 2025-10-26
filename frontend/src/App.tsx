import { useState } from "react";
import { fetchRandomQuestions } from "./api";
import type { QuestionView } from "./types";
import tensionImage from "./assets/1630572752371.jpeg";
import LandingPage from "./LandingPage";

export default function App() {
    const [questions, setQuestions] = useState<QuestionView[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [count, setCount] = useState(5);
    const [inGame, setInGame] = useState(false); // 👈 New: track which screen we’re on
    const [players, setPlayers] = useState(2);

    const handleGetQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchRandomQuestions(count);
            setQuestions(data);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Called when the LandingPage “Start Game” is clicked
    const handleStartGame = (numPlayers: number, numQuestions: number) => {
        setPlayers(numPlayers);
        setCount(numQuestions);
        setInGame(true);
        handleGetQuestions();
    };

    // --- If still on landing page ---
    if (!inGame) {
        return <LandingPage onStartGame={handleStartGame} />;
    }

    // --- Otherwise, show game view ---
    return (
        <div style={{ padding: "2rem", maxWidth: 900 }}>
            <img
                src={tensionImage}
                alt="Tension banner"
                style={{
                    width: "100%",
                    maxWidth: 600,
                    display: "block",
                    margin: "0 auto 1.5rem",
                    borderRadius: 12,
                    objectFit: "cover",
                }}
            />
            <h1>
                Ehm ehm ke viss da va bæs...Tension!!!! (Players: {players})
            </h1>

            <div
                style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <label htmlFor="count">Questions:</label>
                <input
                    id="count"
                    type="number"
                    min={1}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value || "1", 10))}
                    style={{ width: 90 }}
                />
                <button onClick={handleGetQuestions} disabled={loading}>
                    {loading ? "Loading…" : "Reload questions"}
                </button>
            </div>

            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            {!error && questions.length === 0 && !loading && (
                <p>No questions yet. Click “Reload questions”.</p>
            )}

            <ul
                style={{
                    listStyle: "none",
                    padding: 0,
                    display: "grid",
                    gap: 12,
                }}
            >
                {questions.map((q) => (
                    <li
                        key={q.questionId}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            padding: 12,
                        }}
                    >
                        <h3 style={{ margin: "0 0 8px" }}>{q.title}</h3>
                        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                            Category: {q.answersCategory}
                        </div>

                        <div style={{ marginBottom: 6 }}>Answers:</div>
                        <ol style={{ paddingLeft: 20, margin: "0 0 8px" }}>
                            {q.answers.map((a) => (
                                <li key={`${q.questionId}-a-${a.index}`}>{a.text}</li>
                            ))}
                        </ol>

                        {q.tensionAnswers.length > 0 && (
                            <>
                                <div style={{ marginTop: 10, marginBottom: 6 }}>
                                    Tension answers:
                                </div>
                                <ol style={{ paddingLeft: 20, margin: 0 }}>
                                    {q.tensionAnswers.map((a) => (
                                        <li key={`${q.questionId}-t-${a.index}`}>{a.text}</li>
                                    ))}
                                </ol>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
