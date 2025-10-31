import { useEffect, useState } from "react";
import StarBackground from "./StarBackground";
import "./LoadingScreen.css";

const loadingTexts = [
    "Klargjør spørsmålene",
    "Starter spillet",
];

const LoadingScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        if (textIndex < loadingTexts.length - 1) {
            const timeout = setTimeout(() => {
                setTextIndex((prev) => prev + 1);
            }, 1500);
            return () => clearTimeout(timeout);
        } else {
            // Når siste tekst er vist ferdig, vent litt og kall onComplete
            const endTimer = setTimeout(() => {
                onComplete?.();
            }, 1500);
            return () => clearTimeout(endTimer);
        }
    }, [textIndex, onComplete]);

    return (
        <div className="loading-screen">
            <StarBackground />
            <div className="loading-content">
                <div className="spinner"></div>
                <h2 className="loading-text">{loadingTexts[textIndex]}</h2>
            </div>
        </div>
    );
};

export default LoadingScreen;
