import React, { useEffect, useState } from "react";
import "./StarBackground.css";

interface Star {
    top: number;
    left: number;
    delay: number;
}

const StarBackground: React.FC = () => {
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        const starArray: Star[] = Array.from({ length: 80 }).map(() => ({
            top: Math.random() * 100,
            left: Math.random() * 100,
            delay: Math.random() * 5,
        }));
        setStars(starArray);
    }, []);

    return (
        <div className="star-bg">
            {stars.map((star, i) => (
                <div
                    key={i}
                    className="star"
                    style={{
                        top: `${star.top}%`,
                        left: `${star.left}%`,
                        animationDelay: `${star.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default StarBackground;