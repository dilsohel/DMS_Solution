import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client with recommended telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

// POST /api/ai/chat - Multi-turn Chat & Search Grounding
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      systemInstruction,
      model = 'gemini-3.8-flash',
      enableSearch = false,
      businessContext,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Build enhanced system instruction with live business context
    let fullSystemInstruction = systemInstruction || 
      'You are the DMS Solution AI Business Copilot, an expert advisor for shop owners, wholesalers, and manufacturers.';
    
    if (businessContext) {
      fullSystemInstruction += `\n\nLive Business Context:
- Business Name: ${businessContext.name || 'DMS Business'}
- Business Type: ${businessContext.type || 'Retail & Wholesale'}
- Currency: ${businessContext.currency || '৳'}
- Total Sales: ${businessContext.currency || '৳'}${Number(businessContext.totalSales || 0).toLocaleString()}
- Today's Sales: ${businessContext.currency || '৳'}${Number(businessContext.todaySales || 0).toLocaleString()}
- Net Profit: ${businessContext.currency || '৳'}${Number(businessContext.netProfit || 0).toLocaleString()}
- Customer Receivables (Dues): ${businessContext.currency || '৳'}${Number(businessContext.receivables || 0).toLocaleString()}
- Supplier Payables: ${businessContext.currency || '৳'}${Number(businessContext.payables || 0).toLocaleString()}
- Low Stock Product Count: ${businessContext.lowStockCount || 0} items
- Cash in Hand: ${businessContext.currency || '৳'}${Number(businessContext.cashBalance || 0).toLocaleString()}
- Bank & MFS Balance: ${businessContext.currency || '৳'}${Number(businessContext.bankBalance || 0).toLocaleString()}`;
    }

    fullSystemInstruction += '\nAlways provide practical, numbers-grounded, actionable business advice. Be concise, polite, and encouraging.';

    // Format conversation history for Gemini contents
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: typeof m.content === 'string' ? [{ text: m.content }] : m.parts,
    }));

    // Choose appropriate model alias or fallback safely
    let targetModel = model;
    if (targetModel === 'gemini-4-argon' && !process.env.GEMINI_API_KEY) {
      targetModel = 'gemini-3.8-flash';
    }

    // Configure tools: Google Search Grounding when enabled
    const config: any = {
      systemInstruction: fullSystemInstruction,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config,
    });

    const replyText = response.text || 'No response generated.';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    const searchQueries = groundingMetadata?.webSearchQueries || [];
    const searchChunks = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Web Source',
      uri: chunk.web?.uri || '',
    })) || [];

    return res.json({
      reply: replyText,
      searchQueries,
      sources: searchChunks,
      modelUsed: targetModel,
    });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process AI chat request',
    });
  }
});

// Setup Vite development server or production static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

startServer();
