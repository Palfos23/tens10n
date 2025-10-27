import { motion } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import StarBackground from "./StarBackground";

interface GameOverProps {
    scores: Record<string, number>;
    onPlayAgain: () => void;
}

export default function GameOver({ scores, onPlayAgain }: GameOverProps) {
    // Sort players by score (highest first)
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winner = sortedScores[0]?.[0] ?? null;

    // 🎊 Trigger confetti once when the winner appears
    // @ts-ignore
    useEffect(() => {
        if (!winner) return;

        const duration = 2500;
        const end = Date.now() + duration;

        const frame = () => {
            // launch confetti bursts from both sides
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#ffae00", "#00c6ff", "#ffffff"],
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#ffae00", "#00c6ff", "#ffffff"],
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();

        // optional cleanup
        return () => confetti.reset();
    }, [winner]);

    return (

        <div
            style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                textAlign: "center",
                overflow: "hidden",
                padding: "2rem",
            }}
        >
            <StarBackground />
            <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={{
                    fontSize: "3rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                }}
            >
                Spillet er ferdig 🎉
            </motion.h1>

            {winner && (
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    style={{
                        fontSize: "1.8rem",
                        fontWeight: 600,
                        color: "#FFD700",
                        marginBottom: "1rem",
                    }}
                >
                    🏆 Vinner: {winner}
                </motion.h2>
            )}

            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                style={{
                    fontSize: "1.4rem",
                    fontWeight: 400,
                    opacity: 0.8,
                    marginBottom: "2rem",
                }}
            >
                Resultater
            </motion.h3>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 16,
                    padding: "2rem 3rem",
                    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    width: "min(500px, 90%)",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                    }}
                >
                    <thead>
                    <tr style={{ opacity: 0.7, fontSize: "1.1rem" }}>
                        <th style={{ padding: "0.5rem" }}>#</th>
                        <th style={{ padding: "0.5rem" }}>Player</th>
                        <th
                            style={{
                                padding: "0.5rem",
                                textAlign: "right",
                            }}
                        >
                            Poengsum
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedScores.map(([player, score], index) => (
                        <tr
                            key={player}
                            style={{
                                background:
                                    index === 0
                                        ? "rgba(255, 215, 0, 0.2)" // 🥇 gold shimmer
                                        : index === 1
                                            ? "rgba(192,192,192,0.2)" // 🥈 silver
                                            : index === 2
                                                ? "rgba(205,127,50,0.2)" // 🥉 bronze
                                                : "transparent",
                                fontWeight: index === 0 ? 700 : 400,
                                transition: "all 0.3s ease",
                            }}
                        >
                            <td style={{ padding: "0.8rem" }}>{index + 1}</td>
                            <td style={{ padding: "0.8rem" }}>{player}</td>
                            <td
                                style={{
                                    padding: "0.8rem",
                                    textAlign: "right",
                                    color:
                                        score > 0
                                            ? "#7CFC00"
                                            : score < 0
                                                ? "#ff6961"
                                                : "white",
                                }}
                            >
                                {score}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </motion.div>

            <motion.button
                onClick={onPlayAgain}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                style={{
                    marginTop: "2.5rem",
                    padding: "1rem 2.5rem",
                    fontSize: "1.3rem",
                    borderRadius: 12,
                    border: "none",
                    background: "#4338ca",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    transition: "transform 0.2s ease",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Nytt Spill
            </motion.button>
        </div>
    );
}
