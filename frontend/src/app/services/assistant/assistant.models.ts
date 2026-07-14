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

export const EMOTION = {
  SIT_EOPEN_MOPEN: 'sit-eopen-mopen',
  SIT_EOPEN_MCLOSED: 'sit-eopen-mclosed',
  SIT_ECLOSED_MCLOSED: 'sit-eclosed-mclosed',
  SIT_ECLOSED_MOPEN: 'sit-eclosed-mopen',
  PAW_EOPEN_MOPEN: 'paw-eopen-mopen',
  PAW_ECLOSED_MOPEN: 'paw-eclosed-mopen',
  PAW_EOPEN_MCLOSED: 'paw-eopen-mclosed',
  SAD_ECLOSED_MCLOSED: 'sad-eclosed-mclosed',
} as const;
