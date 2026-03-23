import { useState, useEffect } from "react";

export default function TypeWriter({ text, speed = 25 }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        let timeoutId;

        // Reset displayed text whenever a new 'text' prop is passed
        setDisplayedText("");

        const type = () => {
            if (i < text.length) {
                // Use a functional update to ensure we have the latest index
                setDisplayedText(text.slice(0, i + 1));

                const char = text.charAt(i);
                let currentSpeed = speed + (Math.random() * 20 - 10);

                // Punctuation pauses for a more natural feel
                if (char === '.' || char === '?' || char === '!') {
                    currentSpeed += 400;
                } else if (char === ',') {
                    currentSpeed += 200;
                } else if (char === '\n') {
                    // Slight extra pause when moving to a NEW LINE (listings)
                    currentSpeed += 150;
                }

                i++;
                timeoutId = setTimeout(type, currentSpeed);
            }
        };

        type();
        return () => clearTimeout(timeoutId);
    }, [text, speed]);

    return (
        /* CRITICAL: pre-wrap makes \n create a visual new line */
        <span style={{ whiteSpace: "pre-wrap", display: "inline-block", width: "100%" }}>
            {displayedText}
        </span>
    );
}