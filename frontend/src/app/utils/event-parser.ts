export interface ParsedEvent {
  time: string;
  title: string;
}

export function parseEvent(item: string): ParsedEvent {
  if (!item) return {time: '', title: ''};

  const parts = item.split('—');

  if (parts.length > 1) {
    return {
      time: parts[0].trim(),
      title: parts[1].trim(),
    };
  }

  const fallbackParts = item.split(/\s+-\s+(?![0-9])/);
  if (fallbackParts.length > 1) {
    return {
      time: fallbackParts[0].trim(),
      title: fallbackParts[1].trim(),
    };
  }

  return {time: '', title: item};
}
