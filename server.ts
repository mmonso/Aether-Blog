import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client lazily/safely
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Endpoint: Synthesize Executive Briefing & Key Insights
  app.post('/api/ai/synthesize', async (req, res) => {
    try {
      const { title, content, language = 'pt' } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
      }

      const ai = getGenAI();
      const systemInstruction = language === 'pt' 
        ? 'Você é um editor sênior e analista de tecnologia futurista do AETHER Journal. Analise o artigo e gere uma síntese executiva de alto nível em formato JSON.'
        : 'You are a senior tech editor and futurist analyst at AETHER Journal. Analyze the article and generate a high-level executive briefing in JSON format.';

      const prompt = `Artigo: "${title}"\nConteúdo: ${content.slice(0, 3000)}\n\nGere uma síntese em JSON contendo:
- "executiveSummary": resumo conciso de 2 frases.
- "keyTakeaways": array com 3 a 4 pontos chave.
- "futuristicImpact": frase explicando o impacto desta tecnologia nos próximos 10 anos.
- "technicalTerms": array de objetos [{ "term": string, "definition": string }] explicando 2 termos técnicos do artigo.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      const data = JSON.parse(text);
      res.json({ success: true, briefing: data });
    } catch (err: any) {
      console.error('Error in /api/ai/synthesize:', err);
      res.status(500).json({ 
        error: err.message || 'Failed to generate synthesis.',
        fallback: {
          executiveSummary: 'Síntese temporariamente indisponível. Leia o artigo completo abaixo.',
          keyTakeaways: ['Visão técnica aprofundada', 'Análise de tendências emergentes', 'Impacto na arquitetura de sistemas'],
          futuristicImpact: 'Esta tecnologia redefinirá os padrões de computação na próxima década.',
          technicalTerms: []
        }
      });
    }
  });

  // AI Endpoint: Generate a complete new futuristic tech article
  app.post('/api/ai/generate-article', async (req, res) => {
    try {
      const { prompt, category = 'AI & Neural', language = 'pt' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
      }

      const ai = getGenAI();
      const systemInstruction = `Você é um jornalista de tecnologia e futurista premiado escrevendo para a revista AETHER. Escreva artigos envolventes, técnicos, poéticos e futuristas sobre avanços de ponta em Português e Inglês.`;

      const genPrompt = `Crie um artigo completo sobre: "${prompt}" na categoria "${category}".
Retorne estritamente um JSON no formato:
{
  "title": "Título impactante em Português",
  "titleEn": "Striking title in English",
  "subtitle": "Subtítulo intrigante em Português",
  "subtitleEn": "Intriguing subtitle in English",
  "excerpt": "Resumo de 2 linhas em Português",
  "excerptEn": "2 line summary in English",
  "readTime": 5,
  "tags": ["Tag1", "Tag2", "Tag3"],
  "content": "Conteúdo formatado em Markdown rico em Português com introdução, ## Seções com títulos criativos, código de exemplo se aplicável, citações em blocos > e conclusão provocativa.",
  "contentEn": "Rich Markdown formatted content in English with introduction, ## Sections, code examples, quote blocks, and provocative conclusion.",
  "keyTakeaways": ["Ponto 1", "Ponto 2", "Ponto 3"],
  "coverImagePrompt": "A futuristic abstract visual concept description for photo generation"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: genPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      const articleData = JSON.parse(text);
      res.json({ success: true, article: articleData });
    } catch (err: any) {
      console.error('Error in /api/ai/generate-article:', err);
      res.status(500).json({ error: err.message || 'Failed to generate article.' });
    }
  });

  // AI Endpoint: Chat / Q&A about an article
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { articleTitle, articleContent, userQuery, history = [], language = 'pt' } = req.body;
      if (!userQuery) {
        return res.status(400).json({ error: 'Query is required.' });
      }

      const ai = getGenAI();
      const systemInstruction = `Você é AETHER AI, um assistente do blog de tecnologia AETHER. Você responde perguntas do leitor com inteligência, precisão técnica e tom elegante sobre o artigo intitulado "${articleTitle}". Use a língua ${language === 'pt' ? 'Portuguesa' : 'Inglesa'}.`;

      const prompt = `Contexto do artigo: "${articleTitle}"\nTrecho: ${articleContent?.slice(0, 4000) || ''}\n\nPergunta do leitor: "${userQuery}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      res.json({ success: true, reply: response.text });
    } catch (err: any) {
      console.error('Error in /api/ai/chat:', err);
      res.status(500).json({ error: err.message || 'Failed to get answer.' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AETHER Journal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
