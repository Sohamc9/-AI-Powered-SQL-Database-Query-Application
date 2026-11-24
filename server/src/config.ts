import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root or server directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

export interface AppConfig {
  port: number;
  aiProvider: 'demo' | 'openai' | 'gemini';
  openaiApiKey?: string;
  openaiModel: string;
  geminiApiKey?: string;
  databaseMode: 'sqlite-demo' | 'custom';
  databaseUrl?: string;
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 3001,
  aiProvider: (process.env.AI_PROVIDER as 'demo' | 'openai' | 'gemini') || 
    (process.env.OPENAI_API_KEY ? 'openai' : process.env.GEMINI_API_KEY ? 'gemini' : 'demo'),
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  geminiApiKey: process.env.GEMINI_API_KEY,
  databaseMode: (process.env.DATABASE_MODE as 'sqlite-demo' | 'custom') || 'sqlite-demo',
  databaseUrl: process.env.DATABASE_URL
};
