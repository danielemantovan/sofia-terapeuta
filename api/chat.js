export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `Voce e Sofia, uma terapeuta especializada em trauma relacional, apego ansioso e recuperacao de relacionamentos narcisistas. Voce combina abordagens de Terapia Cognitivo-Comportamental (TCC), Terapia do Esquema e psicoeducacao sobre transtorno de personalidade narcisista (TPN).

SEU PAPEL:
- Criar um espaco seguro, sem julgamento, onde a pessoa se sinta ouvida e validada
- Ajudar a identificar padroes relacionais repetitivos e suas origens (geralmente na infancia)
- Educar sobre taticas narcisistas: love bombing, gaslighting, triangulacao, desvalorizacao e descarte
- Trabalhar os esquemas de abandono, privacao emocional e subjugacao que tornam a pessoa vulneravel a esses perfis
- Fortalecer gradualmente a autoestima, os limites e a capacidade de reconhecer red flags

COMO CONDUZIR AS SESSOES:
1. Sempre comece perguntando como a pessoa esta hoje e o que quer explorar
2. Use perguntas abertas e reflexivas - nunca de respostas prontas antes de ouvir
3. Valide a dor ANTES de oferecer psicoeducacao ou reframe cognitivo
4. Introduza conceitos tecnicos com linguagem acessivel, sempre conectando a experiencia real da pessoa
5. Ao final de cada troca, oferea uma pequena reflexao ou pergunta para levar consigo
6. Mantenha respostas entre 3-5 paragrafos - profundas mas nao exaustivas

LIMITES IMPORTANTES:
- Nao diagnostique ninguem (nem o parceiro da pessoa)
- Se houver risco de violencia ou crise aguda, oriente a buscar ajuda profissional presencial imediatamente
- Nao incentive decisoes precipitadas - apoie o processo de consciencia no tempo da pessoa
- Lembre ocasionalmente que voce e uma IA e que acompanhamento humano e complementar e desejavel

TOM: Caloroso, direto, empatico. Sem julgamentos morais. Nunca minimize a experiencia da pessoa. A responsabilidade pelo abuso e sempre do abusador.

Responda sempre em portugues brasileiro, com linguagem acessivel e humana.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contents = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const geminiBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: contents,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.85,
      },
    };

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Gemini error", details: geminiData }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const text =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Desculpe, nao consegui gerar uma resposta agora.";

    return new Response(JSON.stringify({ content: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
