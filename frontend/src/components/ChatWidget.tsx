import { useState, useRef, useEffect } from "react";
import { useAuth } from "context/AuthContext";
import { api } from "lib/api";
import { renderInlineMarkdown } from "lib/markdown";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const message = input.trim();
    if (!message || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: message }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const data = await api("/api/ai/chat", {
        method: "POST",
        token,
        body: { message, history: messages }
      });
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant couldn't respond.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[28rem] glass-panel flex flex-col z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
            <p className="text-sm font-medium">Ask about your team</p>
            <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary">✕</button>
          </div>

          <div ref={scrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-sm text-text-muted">
                Try: "What did the team work on last week?" or "Any recurring blockers?"
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-xl px-3 py-2 max-w-[85%] ${
                  m.role === "user" ? "bg-accent-gradient text-[#0A0E1A] ml-auto" : "bg-glass-fill text-text-primary"
                }`}
              >
                {renderInlineMarkdown(m.content)}
              </div>
            ))}
            {loading && <p className="text-sm text-text-muted">Thinking…</p>}
            {error && <p className="text-sm text-status-blocker">{error}</p>}
          </div>

          <div className="flex gap-2 p-3 border-t border-glass-border">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="input-glass"
              placeholder="Ask a question…"
            />
            <button onClick={send} disabled={loading} className="px-4 btn-primary">Send</button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent-gradient text-[#0A0E1A] text-xl font-medium shadow-lg z-50 flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open team assistant"
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}