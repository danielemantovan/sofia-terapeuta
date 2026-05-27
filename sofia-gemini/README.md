# ✦ Sofia — Espaço Terapêutico
### Powered by Google Gemini (gratuito)

App de apoio emocional com IA para pessoas que viveram relacionamentos narcisistas.

---

## Como publicar na internet — passo a passo

### O que você vai precisar
Criar conta gratuita em três sites:
- **Google AI Studio** → [aistudio.google.com](https://aistudio.google.com) (chave da API — grátis)
- **GitHub** → [github.com](https://github.com) (onde o código fica guardado — grátis)
- **Vercel** → [vercel.com](https://vercel.com) (onde o app fica publicado — grátis)

---

## Passo 1 — Pegar sua chave da API Gemini (gratuita)

1. Acesse [aistudio.google.com](https://aistudio.google.com)
2. Faça login com sua conta Google
3. Clique em **"Get API Key"** (menu lateral esquerdo)
4. Clique em **"Create API key"**
5. Copie a chave gerada (começa com `AIza...`) e guarde bem

✅ **É grátis.** O plano gratuito inclui 1.500 requisições por dia — mais do que suficiente.

---

## Passo 2 — Subir o código no GitHub

1. Acesse [github.com](https://github.com) e crie uma conta (se ainda não tiver)
2. Clique no **"+"** (canto superior direito) → **"New repository"**
3. Nome: `sofia-terapeuta` → deixe como **Public** → clique em **"Create repository"**
4. Na página que abrir, clique em **"uploading an existing file"**
5. Arraste **todos os arquivos e pastas** deste projeto
6. Clique em **"Commit changes"**

---

## Passo 3 — Publicar no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `sofia-terapeuta`
4. **Antes de clicar em Deploy**, abra a seção **"Environment Variables"**
5. Adicione:
   - **Nome:** `GEMINI_API_KEY`
   - **Valor:** sua chave `AIza...`
6. Clique em **"Deploy"**

🎉 Em 2 minutos o Vercel gera seu link:
`https://sofia-terapeuta.vercel.app`

---

## Estrutura do projeto

```
sofia-gemini/
├── api/
│   └── chat.js        ← Backend seguro (esconde sua chave da API)
├── src/
│   ├── main.jsx       ← Ponto de entrada React
│   └── App.jsx        ← Interface da Sofia
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## Custos

| Item | Custo |
|------|-------|
| API Gemini (até 1.500 req/dia) | **Grátis** |
| Hospedagem Vercel | **Grátis** |
| Domínio personalizado (opcional) | ~R$ 40/ano |

---

## Aviso importante

Este app é um recurso de apoio emocional e **não substitui acompanhamento psicológico profissional**.
Em casos de crise, oriente os usuários a buscar ajuda presencial ou ligar para o **CVV: 188**.
