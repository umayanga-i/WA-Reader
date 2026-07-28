import type { ChatMessage, MessageType, ParsedChat } from '../types/chat';

// ─── Regex Patterns ───────────────────────────────────────────────────────────

/**
 * Matches WhatsApp message header lines in various formats:
 *
 * 26/11/2024, 20:55 - John: Hello
 * 11/26/2024, 8:55 PM - John: Hello
 * [26/11/2024, 20:55] John: Hello  (some export formats use brackets)
 *
 * Groups:
 *  1: date string (e.g. "26/11/2024")
 *  2: time string (e.g. "20:55" or "8:55 PM")
 *  3: sender name
 *  4: message text
 */
const MESSAGE_REGEX =
  /^(?:\[)?(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})(?:,\s*|\s+)(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)(?:\])?(?:\s*-\s*)([^:]+?):\s([\s\S]*?)$/;

/**
 * System messages (no sender:message pattern after the timestamp)
 *
 * Groups:
 *  1: date string
 *  2: time string
 *  3: system message text
 */
const SYSTEM_REGEX =
  /^(?:\[)?(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})(?:,\s*|\s+)(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)(?:\])?(?:\s*-\s*)(.+)$/;

// ─── Media Detection ─────────────────────────────────────────────────────────

const MEDIA_PATTERNS: Array<{ pattern: RegExp; type: MessageType }> = [
  { pattern: /<Media omitted>/i, type: 'image' },
  { pattern: /^IMG-\d/i, type: 'image' },
  { pattern: /^VID-\d/i, type: 'video' },
  { pattern: /^AUD-\d/i, type: 'audio' },
  { pattern: /^PTT-\d/i, type: 'voice_note' },
  { pattern: /^STK-\d/i, type: 'sticker' },
  { pattern: /^GIF-\d/i, type: 'gif' },
  { pattern: /\.(pdf)(\s+\(file attached\))?$/i, type: 'document' },
  { pattern: /\.(doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)(\s+\(file attached\))?$/i, type: 'document' },
  { pattern: /^location:\s*https?:\/\//i, type: 'location' },
  { pattern: /^\+?\d[\d\s\-]{6,}$/i, type: 'contact' },
];

const DELETED_PATTERNS = [
  /you deleted this message/i,
  /this message was deleted/i,
  /message was deleted/i,
];

// ─── Date Parsing ─────────────────────────────────────────────────────────────

function parseDate(dateStr: string, timeStr: string): Date {
  // Normalize separators
  const cleanDate = dateStr.replace(/[.\-]/g, '/');
  const parts = cleanDate.split('/');
  if (parts.length !== 3) return new Date(NaN);

  let day: number, month: number, year: number;

  // Detect if format is MM/DD/YYYY or DD/MM/YYYY
  // WhatsApp exports vary by locale — we use a heuristic:
  // if first part > 12, it must be a day; otherwise assume DD/MM/YYYY
  const first = parseInt(parts[0], 10);
  const second = parseInt(parts[1], 10);
  const yearStr = parts[2];

  year = yearStr.length === 2 ? 2000 + parseInt(yearStr, 10) : parseInt(yearStr, 10);

  if (first > 12) {
    // Definitely DD/MM/YYYY
    day = first;
    month = second;
  } else {
    // Assume DD/MM/YYYY (most common WhatsApp export)
    day = first;
    month = second;
  }

  // Parse time
  const timeClean = timeStr.trim();
  const amPmMatch = timeClean.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?/);
  if (!amPmMatch) return new Date(NaN);

  let hours = parseInt(amPmMatch[1], 10);
  const minutes = parseInt(amPmMatch[2], 10);
  const ampm = amPmMatch[3]?.toLowerCase();

  if (ampm === 'pm' && hours !== 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function formatDate(d: Date): string {
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(d: Date): string {
  if (isNaN(d.getTime())) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// ─── Message Type Detection ───────────────────────────────────────────────────

function detectMessageType(text: string): MessageType {
  for (const { pattern, type } of MEDIA_PATTERNS) {
    if (pattern.test(text.trim())) return type;
  }
  for (const pattern of DELETED_PATTERNS) {
    if (pattern.test(text.trim())) return 'deleted';
  }
  return 'text';
}

// ─── ID Generation ────────────────────────────────────────────────────────────

function generateId(index: number, timestamp: number): string {
  return `msg-${timestamp}-${index}`;
}

// ─── Main Parser ─────────────────────────────────────────────────────────────

export interface ParseOptions {
  /** The participant name considered as "me" */
  myName?: string;
}

export function parseWhatsAppChat(
  rawText: string,
  options: ParseOptions = {}
): ParsedChat {
  const lines = rawText.split('\n');
  const messages: ChatMessage[] = [];
  const participantSet = new Set<string>();

  let currentMessage: Partial<ChatMessage> | null = null;
  let messageIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip BOM / empty header lines
    if (i === 0 && line.startsWith('\uFEFF')) {
      lines[i] = line.slice(1);
    }

    const msgMatch = MESSAGE_REGEX.exec(line);
    if (msgMatch) {
      // Commit previous message
      if (currentMessage && currentMessage.sender) {
        messages.push(finalizeMessage(currentMessage, messageIndex, options.myName));
        messageIndex++;
      }

      const [, dateStr, timeStr, sender, text] = msgMatch;
      const date = parseDate(dateStr, timeStr);
      participantSet.add(sender.trim());

      currentMessage = {
        date: formatDate(date),
        time: formatTime(date),
        timestamp: isNaN(date.getTime()) ? 0 : date.getTime(),
        sender: sender.trim(),
        text: text,
        type: 'text',
      };
      continue;
    }

    const sysMatch = SYSTEM_REGEX.exec(line);
    if (sysMatch) {
      // Commit previous message
      if (currentMessage && currentMessage.sender) {
        messages.push(finalizeMessage(currentMessage, messageIndex, options.myName));
        messageIndex++;
      }

      const [, dateStr, timeStr, sysText] = sysMatch;
      const date = parseDate(dateStr, timeStr);

      // Commit as a system message with sentinel sender
      currentMessage = {
        date: formatDate(date),
        time: formatTime(date),
        timestamp: isNaN(date.getTime()) ? 0 : date.getTime(),
        sender: '~system~',
        text: sysText.trim(),
        type: 'system',
      };
      continue;
    }

    // Continuation line — append to previous message
    if (currentMessage) {
      currentMessage.text = (currentMessage.text ?? '') + '\n' + line;
    }
  }

  // Commit final message
  if (currentMessage && currentMessage.sender) {
    messages.push(finalizeMessage(currentMessage, messageIndex, options.myName));
  }

  const participants = Array.from(participantSet);

  const timestamps = messages
    .filter((m) => m.timestamp > 0)
    .map((m) => m.timestamp);

  return {
    messages,
    participants,
    dateRange: {
      start: timestamps.length ? new Date(Math.min(...timestamps)) : new Date(),
      end: timestamps.length ? new Date(Math.max(...timestamps)) : new Date(),
    },
  };
}

function finalizeMessage(
  partial: Partial<ChatMessage>,
  index: number,
  myName?: string
): ChatMessage {
  const text = (partial.text ?? '').trim();
  const sender = partial.sender ?? '';
  const type = sender === '~system~' ? 'system' : detectMessageType(text);
  const timestamp = partial.timestamp ?? 0;

  return {
    id: generateId(index, timestamp),
    date: partial.date ?? '',
    time: partial.time ?? '',
    timestamp,
    sender: sender === '~system~' ? 'System' : sender,
    text,
    isMine: myName ? sender === myName : false,
    type,
  };
}

// ─── Participant Extraction (pre-parse, fast) ─────────────────────────────────

/**
 * Quickly scan the file text to extract participant names without full parsing.
 * Used to populate the "who is me?" selector before full parse.
 */
export function extractParticipants(rawText: string): string[] {
  const lines = rawText.split('\n');
  const participants = new Set<string>();

  for (const line of lines) {
    const match = MESSAGE_REGEX.exec(line);
    if (match) {
      participants.add(match[3].trim());
      if (participants.size >= 50) break; // cap scan for huge files
    }
  }

  return Array.from(participants);
}
