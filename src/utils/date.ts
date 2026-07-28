import type { ChatMessage } from '../types/chat';

// ─── Date Formatting ─────────────────────────────────────────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDateDivider(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';

  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatMonthYear(isoDate: string): string {
  const [year, month] = isoDate.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

export function formatShortMonth(isoDate: string): string {
  const [year, month] = isoDate.split('-').map(Number);
  return `${SHORT_MONTHS[month - 1]} ${year}`;
}

export function formatDisplayTime(time: string): string {
  return time;
}

// ─── Date Grouping ────────────────────────────────────────────────────────────

export interface DateGroup {
  date: string; // "YYYY-MM-DD"
  label: string;
  messageIndices: number[];
}

/** Group messages by date, returning date label + indices into the messages array */
export function groupMessagesByDate(messages: ChatMessage[]): DateGroup[] {
  const groups: Map<string, DateGroup> = new Map();

  messages.forEach((msg, i) => {
    if (!groups.has(msg.date)) {
      groups.set(msg.date, {
        date: msg.date,
        label: formatDateDivider(msg.date),
        messageIndices: [],
      });
    }
    groups.get(msg.date)!.messageIndices.push(i);
  });

  return Array.from(groups.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Sidebar Navigation ───────────────────────────────────────────────────────

export interface SidebarMonth {
  key: string;  // "YYYY-MM"
  label: string;
  firstMessageIndex: number;
}

export function buildSidebarMonths(messages: ChatMessage[]): SidebarMonth[] {
  const months: Map<string, SidebarMonth> = new Map();

  messages.forEach((msg, i) => {
    const key = msg.date.slice(0, 7); // "YYYY-MM"
    if (!months.has(key)) {
      const [year, month] = key.split('-').map(Number);
      months.set(key, {
        key,
        label: `${SHORT_MONTHS[month - 1]} ${year}`,
        firstMessageIndex: i,
      });
    }
  });

  return Array.from(months.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export function getDurationString(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h`;
  return `${Math.round(ms / 86_400_000)}d`;
}
