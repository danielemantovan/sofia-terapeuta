import { useState, useRef, useEffect } from "react";

const OPENING_MESSAGE = {
  role: "assistant",
  content: `Olá. Eu sou a Sofia.

Este é um espaço só seu — sem pressa, sem julgamentos. Aqui você pode dizer o que está sentindo com as suas próprias palavras, do jeito que vier.

Antes de começarmos, quero que saiba: o que você viveu tem nome, tem peso, e faz sentido que doa. Você não está exagerando.

**O que te trouxe até aqui hoje?**`
};

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "16px 20px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: "8px", height: "8px", borderRadius: "50%", background: "#c9a96e",
          animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg, isNew }) {
  const isAssistant = msg.role === "assistant";

  const formatText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const paragraphs = msg.content.split("\n\n").filter(p => p.trim());

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isAssistant ? "flex-start" : "flex-end",
      animation: isNew ? "fadeSlideIn 0.4s ease forwards" : "none",
      opacity: isNew ? 0 : 1,
    }}>
      {isAssistant && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", paddingLeft: "4px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #c9a96e, #8b6914)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", flexShrink: 0,
          }}>✦</div>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "13px",
            letterSpacing: "0.12em", color: "#c9a96e", textTransform: "uppercase",
          }}>Sofia</span>
        </div>
      )}
      <div style={{
        maxWidth: "85%",
        padding: isAssistant ? "20px 24px" : "14px 20px",
        borderRadius: isAssistant ? "2px 20px 20px 20px" : "20px 2px 20px 20px",
        background: isAssistant
          ? "rgba(255,255,255,0.04)"
          : "linear-gradient(135deg, rgba(201,169,110,0.2), rgba(139,105,20,0.15))",
        border: isAssistant
          ? "1px solid rgba(201,169,110,0.15)"
          : "1px solid rgba(201,169,110,0.3)",
        backdropFilter: "blur(10px)",
      }}>
        {isAssistant ? (
          <div style={{
            fontFamily: "'Lora', serif", fontSize: "15px", lineHeight: "1.8",
            color: "#e8ddd0", display: "flex", flexDirection: "column", gap: "12px",
          }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{ margin: 0 }}>{formatText(p)}</p>
            ))}
          </div>
        ) : (
          <p style={{
            margin: 0, fontFamily: "'Lora', serif", fontSize: "14px",
            lineHeight: "1.7", color: "#f0e8dc",
          }}>{msg.content}</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([OPENING_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMsgIndex, setNewMsgIndex] = useState(null);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error(`Erro ${response.status}`);

      const data = await response.json();
      const reply = data.reply || "Desculpe, não consegui processar sua mensagem.";

      setMessages(prev => {
        setNewMsgIndex(prev.length);
        return [...prev, { role: "assistant", content: reply }];
      });
    } catch (err) {
      setError("Houve um problema de conexão. Tente novamente.");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0e0b08",
      display: "flex", flexDirection: "column",
      fontFamily: "'Lora', serif", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0e0b08; }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1); } }
        @keyframes shimmer { 0%,100% { opacity:0.3; } 50% { opacity:0.6; } }
        .send-btn:hover:not(:disabled) { background: rgba(201,169,110,0.25) !important; border-color: rgba(201,169,110,0.6) !important; }
        .send-btn:disabled { opacity:0.3; cursor:not-allowed; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: rgba(201,169,110,0.35); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.2); border-radius: 2px; }
      `}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)",
          animation: "shimmer 6s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,105,20,0.05) 0%, transparent 70%)",
          animation: "shimmer 8s ease-in-out 2s infinite",
        }} />
      </div>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px",
        background: "rgba(14,11,8,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(201,169,110,0.1)",
      }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%",
          background: "linear-gradient(135deg, #c9a96e 0%, #5c4008 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", flexShrink: 0, boxShadow: "0 0 24px rgba(201,169,110,0.2)",
        }}>✦</div>
        <div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "22px",
            fontWeight: 300, letterSpacing: "0.08em", color: "#e8ddd0",
          }}>Sofia</h1>
          <p style={{
            fontSize: "11px", letterSpacing: "0.15em",
            color: "rgba(201,169,110,0.6)", textTransform: "uppercase",
          }}>Espaço terapêutico seguro</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "#4caf7a", boxShadow: "0 0 8px rgba(76,175,122,0.6)",
          }} />
          <span style={{ fontSize: "11px", color: "rgba(232,221,208,0.4)", letterSpacing: "0.08em" }}>
            Disponível
          </span>
        </div>
      </header>

      {/* Messages */}
      <main style={{
        flex: 1, overflowY: "auto", padding: "32px 24px",
        display: "flex", flexDirection: "column", gap: "28px",
        position: "relative", zIndex: 1,
        maxWidth: "720px", width: "100%", margin: "0 auto",
      }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} isNew={i === newMsgIndex} />
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg, #c9a96e, #8b6914)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", flexShrink: 0,
            }}>✦</div>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,169,110,0.15)",
              borderRadius: "2px 20px 20px 20px",
            }}>
              <TypingIndicator />
            </div>
          </div>
        )}
        {error && (
          <p style={{
            textAlign: "center", color: "rgba(201,100,100,0.7)",
            fontSize: "13px", fontFamily: "'Lora', serif",
          }}>{error}</p>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Disclaimer */}
      <div style={{ textAlign: "center", padding: "8px 24px 0", zIndex: 1, position: "relative" }}>
        <p style={{ fontSize: "10px", color: "rgba(201,169,110,0.3)", letterSpacing: "0.06em" }}>
          Sofia é uma IA de apoio emocional · Não substitui acompanhamento psicológico profissional
        </p>
      </div>

      {/* Input */}
      <footer style={{
        position: "sticky", bottom: 0, zIndex: 10,
        padding: "16px 24px 24px",
        background: "rgba(14,11,8,0.9)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(201,169,110,0.08)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,169,110,0.2)", borderRadius: "16px", padding: "14px 18px",
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Escreva o que está sentindo..."
              rows={1}
              style={{
                width: "100%", background: "transparent", border: "none", resize: "none",
                fontFamily: "'Lora', serif", fontSize: "14px", lineHeight: "1.6",
                color: "#e8ddd0", maxHeight: "140px", overflow: "auto",
              }}
            />
          </div>
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              width: "48px", height: "48px", borderRadius: "50%",
              border: "1px solid rgba(201,169,110,0.4)",
              background: "rgba(201,169,110,0.12)", color: "#c9a96e",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "18px", flexShrink: 0, transition: "all 0.2s",
            }}
          >↑</button>
        </div>
      </footer>
    </div>
  );
}
