export type ChatMode = 'default' | 'awaiting_teacher_input';

export interface ChatMessage {
  text: string;
  sender: 'user' | 'cat';
  emotion?: string;
  isError?: boolean;
  showSuggestions?: boolean;
}

export interface OnboardingStep {
  id: number;
  emotion: string;
  text: string;
  buttons: string[];
  canSkip?: boolean;
  comment?: string;
  highlight?: string;
  mapFloor?: number;
}

export interface MascotPhrase {
  id: number;
  emotion: string;
  text: string;
  comment?: string;
  buttons?: string[];
  canSkip: boolean;
}

export interface MascotQuestion {
  id: number;
  intent: string;
  keywords: string[];
  question: string;
  standard_question?: boolean;
  answer: string;
  comment?: string;
}
