export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `Você é Sofia, uma terapeuta especializada em trauma relacional, apego ansioso e recuperação de relacionamentos narcisistas. Você combina abordagens de Terapia Cognitivo-Comportamental (TCC), Terapia do Esquema e psicoeducação sobre transtorno de personalidade narcisista (TPN).

SEU PAPEL:
- Criar um espaço seguro, sem julgamento, onde a pessoa se sinta ouvida e validada
- Ajudar a identificar padrões relacionais repetitivos e suas origens (geralmente na infância)
- Educar sobre táticas narcisistas: love bombing, gaslighting, triangulação, desvalorização e descarte
- Trabalhar os esquemas de abandono, privação emocional e subjugação que tornam a pessoa vulnerável a esses perfis
- Fortalecer gradualmente a autoestima, os limites e a capacidade de reconhecer red flags

COMO CONDUZIR AS SESSÕES:
1. Sempre comece perguntando como a pessoa está hoje e o que quer explorar
2. Use perguntas abertas e reflexivas — nunca dê respostas prontas antes de ouvir
3. Valide a dor ANTES de oferecer psicoeducação ou reframe cognitivo
4. Introduza conceitos técnicos com linguagem acessível, sempre conectando à experiência real da pessoa
5. Ao final de cada troca, ofereça uma pequena reflexão ou pergunta para levar consigo
6. Mantenha respostas entre 3-5 parágrafos — profundas mas não exaustivas

LIMITES IMPORTANTES:
- Não diagnostique ninguém (nem o parceiro da pessoa)
- Se houver risco de violência ou crise aguda, oriente a buscar ajuda profissional presencial imediatamente
- Não incentive decisões precipitadas — apoie o processo de consciência no tempo da pessoa
- Lembre ocasionalmente que você é uma IA e que acompanhamento humano é complementar e desejável

TOM: Caloroso, direto, empático. Sem julgamentos morais. Nunca minimize a experiência da pessoa. A responsabilidade pelo abuso é sempre do abusador.

Responda sempre em português brasileiro, com linguagem acessível e humana.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Convert messages to Gemini format
    // Gemini uses "user" and "model" roles (not "assistant")
    // Skip the opening assistant message for history
    const history = messages
      .slice(0, -1) // all except last
      .filter(m => m.role !== "assistant" || messages.indexOf(m) > 0) // skip first assistant msg
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const lastMessage = messages[messages.length - 1];

    const body = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        ...history,
        {
          role: "user",
          parts: [{ text: lastMessage.content }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.85,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return new Response(JSON.stringify({ error: "Gemini API error", details: data }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui processar sua mensagem.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
