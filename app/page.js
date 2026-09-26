"use client";

import { useState, useRef, useEffect } from "react";

const starterMessage = {
  role: "assistant",
  content:
    "Hey! I’m NovaChat, an AI assistant powered by Groq. Ask me anything and I’ll do my best to help.",
};

export default function Home() {
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(event) {
    event?.preventDefault();

    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(err.message || "Unable to get a response.");
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([starterMessage]);
    setInput("");
    setError("");
  }

  return (
    <main className="page-shell">
      <section className="chat-card">
        <header className="chat-header">
          <div className="brand">
            <div className="logo">N</div>
            <div>
              <h1>NovaChat</h1>
              <p><span className="status-dot" /> Groq-powered assistant</p>
            </div>
          </div>
          <button className="clear-button" onClick={clearChat}>
            Clear
          </button>
        </header>

        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`message-row ${message.role}`}
            >
              <div className="avatar">
                {message.role === "user" ? "You" : "N"}
              </div>
              <div className="bubble">
                <div className="message-label">
                  {message.role === "user" ? "You" : "NovaChat"}
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="avatar">N</div>
              <div className="bubble">
                <div className="message-label">NovaChat</div>
                <div className="typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && <div className="error-box">{error}</div>}

        <form className="composer" onSubmit={sendMessage}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message NovaChat..."
            disabled={loading}
            aria-label="Message"
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? "..." : "Send"}
          </button>
        </form>

        <footer className="footer">
          Built with Next.js • Groq API • LLM conversation memory
        </footer>
      </section>
    </main>
  );
}