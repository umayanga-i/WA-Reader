import type { ChatMessage } from '../types/chat';

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  /** Indices into the messages array that match the query */
  matchIndices: number[];
}

/**
 * Search messages by text content, sender name, or date.
 * Returns indices of matching messages (into the passed array).
 */
export function searchMessages(
  messages: ChatMessage[],
  query: string
): SearchResult {
  if (!query.trim()) return { matchIndices: [] };

  const q = query.trim().toLowerCase();
  const matchIndices: number[] = [];

  messages.forEach((msg, i) => {
    if (
      msg.text.toLowerCase().includes(q) ||
      msg.sender.toLowerCase().includes(q) ||
      msg.date.includes(q) ||
      msg.time.includes(q)
    ) {
      matchIndices.push(i);
    }
  });

  return { matchIndices };
}

/**
 * Highlight all occurrences of `query` within `text` by wrapping them
 * in a special delimiter that can be rendered as a <mark> element.
 */
export function highlightText(
  text: string,
  query: string
): Array<{ text: string; highlight: boolean }> {
  if (!query.trim()) return [{ text, highlight: false }];

  const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
  const parts = text.split(new RegExp(`(${q})`, 'gi'));

  return parts.map((part) => ({
    text: part,
    highlight: part.toLowerCase() === query.toLowerCase(),
  }));
}

// ─── URL Detection ────────────────────────────────────────────────────────────

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export function extractLinks(text: string): string[] {
  return text.match(URL_REGEX) ?? [];
}

export function hasLinks(text: string): boolean {
  return URL_REGEX.test(text);
}
