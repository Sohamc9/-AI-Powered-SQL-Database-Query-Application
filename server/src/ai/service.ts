import { config } from '../config.js';
import { generateDemoSql, AiGeneratedSqlResponse } from './demoGenerator.js';
import { generateOpenAiSql, generateGeminiSql } from './providers.js';

export interface AiStatus {
  isConfigured: boolean;
  provider: 'demo' | 'openai' | 'gemini';
  providerName: string;
  hasOpenAiKey: boolean;
  hasGeminiKey: boolean;
}

export class AiService {
  /**
   * Returns current AI provider configuration status
   */
  public getStatus(): AiStatus {
    const hasOpenAi = Boolean(config.openaiApiKey && config.openaiApiKey.trim().length > 0);
    const hasGemini = Boolean(config.geminiApiKey && config.geminiApiKey.trim().length > 0);

    let activeProvider: 'demo' | 'openai' | 'gemini' = 'demo';
    let providerName = 'Demo Assistant (Rule-Based & Schema-Aware)';

    if (config.aiProvider === 'openai' && hasOpenAi) {
      activeProvider = 'openai';
      providerName = `OpenAI (${config.openaiModel})`;
    } else if (config.aiProvider === 'gemini' && hasGemini) {
      activeProvider = 'gemini';
      providerName = 'Google Gemini';
    } else if (hasOpenAi) {
      activeProvider = 'openai';
      providerName = `OpenAI (${config.openaiModel})`;
    } else if (hasGemini) {
      activeProvider = 'gemini';
      providerName = 'Google Gemini';
    }

    return {
      isConfigured: activeProvider !== 'demo',
      provider: activeProvider,
      providerName,
      hasOpenAiKey: hasOpenAi,
      hasGeminiKey: hasGemini
    };
  }

  /**
   * Generates SQL from natural language prompt
   */
  public async generateSql(prompt: string): Promise<AiGeneratedSqlResponse> {
    const trimmed = prompt.trim();
    if (!trimmed) {
      throw new Error('Prompt cannot be empty.');
    }

    const status = this.getStatus();

    if (status.provider === 'openai') {
      try {
        return await generateOpenAiSql(trimmed);
      } catch (err: any) {
        console.warn('OpenAI request failed, falling back to Demo Assistant:', err.message);
        const fallback = generateDemoSql(trimmed);
        fallback.explanation = `(Note: OpenAI failed: ${err.message}. Showing Demo suggestion instead.) ${fallback.explanation}`;
        return fallback;
      }
    }

    if (status.provider === 'gemini') {
      try {
        return await generateGeminiSql(trimmed);
      } catch (err: any) {
        console.warn('Gemini request failed, falling back to Demo Assistant:', err.message);
        const fallback = generateDemoSql(trimmed);
        fallback.explanation = `(Note: Gemini failed: ${err.message}. Showing Demo suggestion instead.) ${fallback.explanation}`;
        return fallback;
      }
    }

    // Default: Smart Demo Assistant
    return generateDemoSql(trimmed);
  }
}

export const aiService = new AiService();
