import { Injectable, inject } from '@angular/core';
import { MascotDataService } from './mascot-data.service';
import { MascotQuestion } from './assistant.models';

interface IntentDocument {
  question: MascotQuestion;
  tokens: string[];
  tfidfVector: Map<string, number>;
}

@Injectable({ providedIn: 'root' })
export class ChatMatchingService {
  private mascotData = inject(MascotDataService);

  private readonly documents: IntentDocument[] = [];
  private readonly idf: Map<string, number> = new Map();
  private readonly threshold = 0.15;
  private readonly tfidfWeight = 0.6;
  private readonly levenshteinWeight = 0.4;

  constructor() {
    this.buildIndex();
  }

  matchIntent(userInput: string): MascotQuestion {
    const query = this.tokenize(userInput);
    if (query.length === 0) {
      return this.mascotData.getQuestions().find((q) => q.intent === 'fallback_unknown1')!;
    }

    const queryTfidf = this.computeTfIdf(query);
    let bestScore = -1;
    let bestQuestion: MascotQuestion | null = null;

    for (const doc of this.documents) {
      const tfidfScore = this.cosineSimilarity(queryTfidf, doc.tfidfVector);
      const levScore = this.levenshteinScore(query, doc.tokens);
      const combined = this.tfidfWeight * tfidfScore + this.levenshteinWeight * levScore;

      if (combined > bestScore) {
        bestScore = combined;
        bestQuestion = doc.question;
      }
    }

    if (!bestQuestion || bestScore < this.threshold) {
      return this.mascotData.getFallback();
    }

    return bestQuestion;
  }

  private buildIndex(): void {
    const questions = this.mascotData.getQuestions();
    const docFreq: Map<string, number> = new Map();
    const allDocs: { tokens: string[]; question: MascotQuestion }[] = [];

    for (const question of questions) {
      if (question.keywords.length === 0) continue;
      const tokens = this.tokenize(question.keywords.join(' '));
      allDocs.push({ tokens, question });

      const uniqueTokens = new Set(tokens);
      for (const token of uniqueTokens) {
        docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
      }
    }

    const totalDocs = allDocs.length;
    for (const [token, freq] of docFreq) {
      this.idf.set(token, Math.log((totalDocs + 1) / (freq + 1)) + 1);
    }

    for (const doc of allDocs) {
      this.documents.push({
        question: doc.question,
        tokens: doc.tokens,
        tfidfVector: this.computeTfIdf(doc.tokens),
      });
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  private computeTfIdf(tokens: string[]): Map<string, number> {
    const tf: Map<string, number> = new Map();
    for (const token of tokens) {
      tf.set(token, (tf.get(token) ?? 0) + 1);
    }
    const total = tokens.length || 1;

    const vector: Map<string, number> = new Map();
    for (const [token, count] of tf) {
      const tfValue = count / total;
      const idfValue = this.idf.get(token) ?? 0;
      vector.set(token, tfValue * idfValue);
    }
    return vector;
  }

  private cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const [key, value] of a) {
      normA += value * value;
      const bValue = b.get(key);
      if (bValue !== undefined) {
        dotProduct += value * bValue;
      }
    }
    for (const value of b.values()) {
      normB += value * value;
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  private levenshteinScore(queryTokens: string[], docTokens: string[]): number {
    if (docTokens.length === 0 || queryTokens.length === 0) return 0;

    let totalScore = 0;
    for (const qToken of queryTokens) {
      let bestMatch = 0;
      for (const dToken of docTokens) {
        const distance = this.levenshtein(qToken, dToken);
        const maxLen = Math.max(qToken.length, dToken.length);
        const similarity = maxLen === 0 ? 0 : 1 - distance / maxLen;

        if (similarity > bestMatch) {
          bestMatch = similarity;
        }
      }
      totalScore += bestMatch;
    }

    return totalScore / queryTokens.length;
  }

  private levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;

    if (m === 0) return n;
    if (n === 0) return m;

    const prev: number[] = new Array(n + 1);
    const curr: number[] = new Array(n + 1);

    for (let j = 0; j <= n; j++) {
      prev[j] = j;
    }

    for (let i = 1; i <= m; i++) {
      curr[0] = i;
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(
          prev[j] + 1,
          curr[j - 1] + 1,
          prev[j - 1] + cost
        );
      }
      for (let j = 0; j <= n; j++) {
        prev[j] = curr[j];
      }
    }

    return prev[n];
  }
}
