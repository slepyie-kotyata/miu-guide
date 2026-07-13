import {inject, Injectable} from '@angular/core';
import {MascotPhrase, MascotQuestion} from './assistant.models';

import mascotPhrasesData from '../../../assets/mascot/mascot-phrases.json';
import mascotQuestionsData from '../../../assets/mascot/mascot-questions.json';
import {UserService} from "../user.service";

@Injectable({ providedIn: 'root' })
export class MascotDataService {
  private readonly phrases = mascotPhrasesData as MascotPhrase[];
  private readonly questions = mascotQuestionsData as MascotQuestion[];

  private readonly greetingIds = [100, 101, 102];
  private readonly errorPhraseIds = [103, 104, 105];

  private userService = inject(UserService);

  getPhrases(): MascotPhrase[] {
    return this.phrases;
  }

  getQuestions(): MascotQuestion[] {
    return this.questions;
  }

  getPhraseById(id: number): MascotPhrase | undefined {
    return this.phrases.find((p) => p.id === id);
  }

  getGreeting(): { text: string; emotion: string } {
    const candidates = this.phrases.filter((p) => this.greetingIds.includes(p.id));
    const phrase = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : this.phrases[0];

    const studentName = this.getStudentName();
    const text = this.interpolate(phrase.text, studentName);
    return { text, emotion: phrase.emotion };
  }

  getSuggestedQuestions(): string[] {
    return this.questions
      .filter((q) => q.keywords.length > 0 && q.standard_question && q.id < 10)
      .map((q) => q.standard_question);
  }

  getAnswerByIntent(intent: string): { text: string; emotion: string } | null {
    const question = this.questions.find((q) => q.intent === intent);
    if (!question) return null;

    const studentName = this.getStudentName();
    const text = this.interpolate(question.answer, studentName);
    const emotion = this.pickEmotionForIntent(intent);
    return { text, emotion };
  }

  getFallback(): MascotQuestion {
    const fallbacks = this.questions.filter((q) => q.intent.startsWith('fallback_unknown'));
    return fallbacks.length > 0
      ? fallbacks[Math.floor(Math.random() * fallbacks.length)]
      : this.questions[0];
  }

  getErrorMessage(): { text: string; emotion: string } {
    const candidates = this.phrases.filter((p) => this.errorPhraseIds.includes(p.id));
    const phrase = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : { text: 'Ой, что-то пошло не так. Попробуй ещё раз.', emotion: 'sad-eclosed-mclosed' };
    return { text: phrase.text, emotion: 'sad-eclosed-mclosed' };
  }

  private pickEmotionForIntent(intent: string): string {
    if (intent.startsWith('rofl') || intent.startsWith('rof')) {
      return 'paw-eclosed-mopen';
    }
    if (intent.startsWith('schedule') || intent === 'next_class_location') {
      return 'sit-eopen-mopen';
    }
    return 'paw-eopen-mopen';
  }

  private getStudentName(): string {
    const full_name = this.userService.userSignal()?.full_name;
    if (full_name) {
      const names = full_name.split(' ');
      if (names.length > 1) {
        return names[1];
      }
    }

    return 'студент';
  }

  private interpolate(text: string, value: string): string {
    return text
      .replace(/&value1/g, value)
      .replace(/&value2/g, value)
      .replace(/&value/g, value);
  }
}
