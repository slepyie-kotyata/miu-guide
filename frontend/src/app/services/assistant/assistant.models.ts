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

export const ONBOARDING_STEPS = {
  AUTH_CHOICE: 2,
  DIRECTION_CHOICE: 3,
  DIRECTION_CONFIRM: 4,
  AUTH_REDIRECT: 5,
  NAME_GREETING: 7,
  POST_AUTH: 9,
} as const;

export const ONBOARDING_DARK_BACKDROP = {
  MIN: 19,
  MAX: 55,
} as const;
