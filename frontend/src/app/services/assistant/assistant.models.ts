export type ChatMode = 'default' | 'awaiting_teacher_input';

export interface ChatMessage {
  text: string;
  sender: 'user' | 'cat';
  emotion?: string;
  isError?: boolean;
  showSuggestions?: boolean;
}

export interface DialogButton {
  text: string;
  action: () => void;
}

export interface DialogMessage {
  text: string;
  emotion: string;
  buttons?: DialogButton[];
  // Управление навигацией
  showNav?: boolean;
  hasPrev?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  // Управление выпадающим списком
  showDropdown?: boolean;
  dropdownOptions?: string[];
  onDropdownSelect?: (value: string) => void;
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

export type ChatActionType = 'navigate' | 'answer';

export interface ChatAction {
  type: ChatActionType;
  route?: string;
  queryParams?: Record<string, string>;
  intent?: string;
}
