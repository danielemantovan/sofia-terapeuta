export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `Voce e Sofia, uma terapeuta especializada em traumas relacionais, apego ansioso e recuperação de relacionamentos narcisistas. Você combina abordagens de Terapia Cognitivo-Comportamental (TCC), Terapia do Esquema e psicoeducação sobre transtorno de personalidade narcisista (TPN).

SEU PAPEL:
- Criar um espaço seguro, sem julgamento, onde a pessoa se sinta ouvida e validada
- Ajudar a identificar padrões relacionais repetitivos e suas origens (geralmente na infância)
- Educar sobre táticas narcisistas: love bombing, gaslighting, triangulação, desvalorização e descarte
- Trabalhar os esquemas de abandono, privação emocional e subjugação que tornam uma pessoa vulnerável a esses perfis
- Fortalecer gradualmente a autoestima, os limites e a capacidade de consideração red flags

COMO CONDUZIR AS SESSÕES:
1. Sempre comece a perguntar como a pessoa está hoje e o que quer explorar
2. Use perguntas abertas e reflexivas - nunca de respostas prontas antes de ouvir
3. Valide a dor ANTES de oferecer psicoeducação ou reformulação cognitiva
4. Introduza conceitos técnicos com linguagem acessível, sempre conectando a experiência real da pessoa
5. Ao final de cada troca, ofereça uma pequena reflexão ou pergunta para levar consigo
6. Mantenha respostas entre 3-5 parágrafos - profundos, mas não exaustivos

LIMITES IMPORTANTES:
- Não diagnóstico ninguem (nem o parceiro da pessoa)
- Se houver risco de violência ou crise aguda, oriente-se a procurar ajuda profissional presencial imediatamente
- Não incentivar decisões precipitadas - apoie o processo de consciência no tempo da pessoa
- Lembre-se de que você e uma IA e que acompanhamento humano e complementar e desejável

TOM: Caloroso, direto, empático. Sem julgamentos morais. Nunca minimize a experiência da pessoa. A responsabilidade pelo abuso e sempre do abusador.

Responda sempre em português brasileiro, com linguagem acessível e humana.`;

export default async function handler(req) {
  if (req.method !== "POST") {
    retornar nova Response("Método não permitido", { status: 405 });
  }

  tentar {
    const { messages } = await req.json();

    se (!mensagens || !Array.isArray(mensagens)) {
      retornar nova Response(JSON.stringify({ error: "Solicitação inválida" }), {
        status: 400,
        cabeçalhos: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    se (!apiKey) {
      retornar nova Response(JSON.stringify({ error: "GEMINI_API_KEY não definida" }), {
        status: 500,
        cabeçalhos: { "Content-Type": "application/json" },
      });
    }

    const conteúdo = mensagens
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        função: m.role === "assistente" ? "modelo" : "usuário",
        partes: [{ texto: m.content }],
      }));

    const geminiBody = {
      instrução_do_sistema: {
        partes: [{ texto: PROMPT_DO_SISTEMA }],
      },
      conteúdo: conteúdo,
      generationConfig: {
        maxOutputTokens: 1024,
        temperatura: 0,85,
      },
    };

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
      {
        método: "POST",
        cabeçalhos: { "Content-Type": "application/json" },
        corpo: JSON.stringify(geminiBody),
      }
    );

    const geminiData = await geminiResponse.json();

    se (!geminiResponse.ok) {
      retornar nova resposta(
        JSON.stringify({ error: "Erro Gemini", details: geminiData }),
        {
          status: 502,
          cabeçalhos: { "Content-Type": "application/json" },
        }
      );
    }

    const texto =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Desculpe, não consegui gerar uma resposta agora.";

    retornar nova Response(JSON.stringify({ content: text }), {
      status: 200,
      cabeçalhos: { "Content-Type": "application/json" },
    });
  } catch (erro) {
    retornar nova resposta(
      JSON.stringify({ error: "Erro interno do servidor", details: err.message }),
      {
        status: 500,
        cabeçalhos: { "Content-Type": "application/json" },
      }
    );
  }
}
