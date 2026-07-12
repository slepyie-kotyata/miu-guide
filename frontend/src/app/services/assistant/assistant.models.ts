export interface ChatMessage {
  text: string;
  sender: 'user' | 'cat';
}

export interface DialogButton {
  text: string;
  action: () => void;
}

export interface DialogMessage {
  text: string;
  emotion: string;
  buttons?: DialogButton[];
}
