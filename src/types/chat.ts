// ─── Message Types ────────────────────────────────────────────────────────────

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice_note'
  | 'sticker'
  | 'gif'
  | 'document'
  | 'location'
  | 'contact'
  | 'deleted'
  | 'system';

// ─── Core Message Interface ───────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  /** ISO date string: "YYYY-MM-DD" */
  date: string;
  /** Human-readable time: "HH:MM" or "HH:MM AM/PM" */
  time: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  sender: string;
  text: string;
  /** True if this message belongs to the "me" participant */
  isMine: boolean;
  type: MessageType;
}

// ─── Parsed Chat ─────────────────────────────────────────────────────────────

export interface ParsedChat {
  messages: ChatMessage[];
  participants: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'amoled';

// ─── Search State ─────────────────────────────────────────────────────────────

export interface SearchState {
  query: string;
  results: number[];   // indices into filtered messages array
  currentIndex: number;
}

// ─── Filter State ─────────────────────────────────────────────────────────────

export interface FilterState {
  onlyMine: boolean;
  onlyOther: boolean;
  mediaOnly: boolean;
  linksOnly: boolean;
  deletedOnly: boolean;
  systemOnly: boolean;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface ParticipantStats {
  name: string;
  messageCount: number;
  totalChars: number;
  avgMessageLength: number;
  longestMessage: string;
  emojiCounts: Record<string, number>;
  wordCounts: Record<string, number>;
}

export interface ChatStatistics {
  totalMessages: number;
  participants: ParticipantStats[];
  firstMessage: ChatMessage | null;
  lastMessage: ChatMessage | null;
  mostActiveDay: string | null;
  mostActiveMonth: string | null;
  mostActiveHour: number | null;
  longestInactivePeriod: number | null; // in hours
  avgReplyTimeMs: number | null;
  dailyActivity: DailyActivity[];
  weeklyActivity: WeeklyActivity[];
  monthlyActivity: MonthlyActivity[];
  topEmojis: Array<{ emoji: string; count: number }>;
  topWords: Array<{ word: string; count: number }>;
}

export interface DailyActivity {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface WeeklyActivity {
  week: string; // "YYYY-WNN"
  count: number;
}

export interface MonthlyActivity {
  month: string; // "YYYY-MM"
  count: number;
}
