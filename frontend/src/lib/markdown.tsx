import { Fragment } from "react";

// AI responses occasionally use **bold** despite being told not to.
// Rather than relying on the model, render it correctly on our side.
export function renderInlineMarkdown(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{part}</Fragment>;
    });
}