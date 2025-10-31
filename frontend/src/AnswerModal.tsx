import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchPossibleAnswers } from "./api";

interface AnswerModalProps {
    currentPlayer: string;
    questionTitle: string;
    tensionAnswers: number;
    category: string;
    onSubmit: (answer: string) => void;
    answeredPlayers: string[];
    allPlayers: string[];
    usedAnswers: string[];
}

const AnswerModal: React.FC<AnswerModalProps> = ({
                                                     currentPlayer,
                                                     questionTitle,
                                                     tensionAnswers,
                                                     category,
                                                     onSubmit,
                                                     answeredPlayers,
                                                     allPlayers,
                                                     usedAnswers,
                                                 }) => {
    const [value, setValue] = useState("");
    const [allOptions, setAllOptions] = useState<string[]>([]);
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [validSelection, setValidSelection] = useState(false);
    const [duplicateError, setDuplicateError] = useState(false);
    const cacheRef = React.useRef<Map<string, string[]>>(new Map());

    // === Hent mulige svar (cache) ===
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

    // === Filtrer forslag under skriving ===
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        setValidSelection(false);
        setDuplicateError(false);

        if (newValue.length >= 2) {
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

    // === Når man velger et forslag ===
    const handleSelect = (selected: string) => {
        setValue(selected);
        setShowDropdown(false);
        setValidSelection(true);
        setDuplicateError(false);
    };

    // === Innsending av svar ===
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const duplicate = (usedAnswers ?? []).some(
            (a) => a.toLowerCase() === value.toLowerCase().trim()
        );

        if (duplicate) {
            setDuplicateError(true);
            return;
        }

        if (validSelection) {
            onSubmit(value.trim());
            setValue("");
            setValidSelection(false);
            setDuplicateError(false);
        } else {
            alert("Velg et gyldig svar fra listen først.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 999,
                background: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(3px)",
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "20px",
                    padding: "2.5rem",
                    width: "min(520px, 90%)",
                    textAlign: "center",
                    color: "white",
                    boxShadow: "0 0 25px rgba(79,70,229,0.5)",
                    backdropFilter: "blur(12px)",
                }}
            >
                <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        color: "#a5b4fc",
                        letterSpacing: "0.5px",
                        marginBottom: "0.6rem",
                        textShadow: "0 0 10px rgba(99,102,241,0.6)",
                    }}
                >
                    {currentPlayer}, din tur!
                </motion.div>

                <p
                    style={{
                        fontSize: "1.5rem",
                        opacity: 0.9,
                        marginBottom: "1.6rem",
                        fontStyle: "italic",
                    }}
                >
                    {questionTitle}
                </p>
                <p
                    style={{
                        fontSize: "0.7rem",
                        opacity: 0.9,
                        marginBottom: "1.6rem",
                        fontStyle: "italic",
                    }}
                >
                    (Antall tension svar: {tensionAnswers})
                </p>

                {/* === Svarskjema === */}
                <form onSubmit={handleSubmit} style={{ position: "relative" }}>
                    <input
                        type="text"
                        placeholder="Skriv inn svaret ditt..."
                        value={value}
                        onChange={handleChange}
                        style={{
                            width: "100%",
                            padding: "0.9rem 1rem",
                            fontSize: "1.1rem",
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.25)",
                            background: "rgba(255,255,255,0.08)",
                            color: "white",
                            textAlign: "center",
                            outline: "none",
                            boxShadow: "0 0 12px rgba(79,70,229,0.25)",
                            transition: "0.2s all",
                        }}
                    />

                    {/* === Feilmelding om duplikat === */}
                    {duplicateError && (
                        <p
                            style={{
                                color: "#ff6961",
                                marginTop: "0.4rem",
                                fontSize: "0.95rem",
                                fontWeight: 500,
                            }}
                        >
                            Dette svaret er allerede brukt av en annen spiller!
                        </p>
                    )}

                    {/* === Dropdown med forslag === */}
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
                                background: "rgba(20,20,20,0.95)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "10px 10px 0 0",
                                maxHeight: "220px",
                                overflowY: "auto",
                                zIndex: 9999,
                            }}
                        >
                            {(filteredOptions.length > 0 ? filteredOptions : ["— Ingen treff —"]).map(
                                (opt) => (
                                    <li
                                        key={opt}
                                        onClick={() => opt !== "— Ingen treff —" && handleSelect(opt)}
                                        style={{
                                            padding: "0.7rem 1rem",
                                            cursor:
                                                opt === "— Ingen treff —" ? "default" : "pointer",
                                            textAlign: "center",
                                            color: "white",
                                            opacity: opt === "— Ingen treff —" ? 0.7 : 1,
                                            fontStyle: opt === "— Ingen treff —" ? "italic" : "normal",
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
                            marginTop: "1.4rem",
                            padding: "0.9rem 2rem",
                            borderRadius: 12,
                            border: "none",
                            background: validSelection
                                ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                                : "rgba(255,255,255,0.15)",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            cursor: validSelection ? "pointer" : "not-allowed",
                            transition: "0.3s",
                            boxShadow: validSelection
                                ? "0 0 15px rgba(139,92,246,0.5)"
                                : "none",
                        }}
                    >
                        Send inn
                    </button>
                </form>

                {/* === Svarindikatorer === */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "1.8rem",
                        gap: "0.6rem",
                    }}
                >
                    {allPlayers.map((p) => {
                        const hasAnswered = answeredPlayers.includes(p);
                        return (
                            <div
                                key={p}
                                title={p}
                                style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    background: hasAnswered
                                        ? "#4f46e5"
                                        : "rgba(255,255,255,0.25)",
                                    boxShadow: hasAnswered ? "0 0 8px #6366f1" : "none",
                                }}
                            />
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AnswerModal;
