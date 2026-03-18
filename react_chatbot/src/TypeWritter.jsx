import { useState, useEffect } from "react";

export default function TypeWriter({ text, speed = 25 }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        let timeoutId;

        const type = () => {
            if (i < text.length) {
                setDisplayedText(text.slice(0, i + 1));

                let currentSpeed = speed;

                currentSpeed += Math.random() * 20 - 10;

                const char = text.charAt(i);
                if (char === '.' || char === '?' || char === '!') currentSpeed += 400;
                else if (char === ',') currentSpeed += 200;

                i++;
                timeoutId = setTimeout(type, currentSpeed);
            }
        };

        type();
        return () => clearTimeout(timeoutId);
    }, [text, speed]);

    return <span>{displayedText}</span>;
}