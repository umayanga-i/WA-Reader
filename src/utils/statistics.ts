import type {
  ChatMessage,
  ChatStatistics,
  DailyActivity,
  MonthlyActivity,
  ParticipantStats,
  WeeklyActivity,
} from '../types/chat';

// ─── Stopwords ────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'its', 'be', 'was', 'are',
  'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need',
  'i', 'me', 'my', 'you', 'your', 'he', 'she', 'we', 'they', 'them',
  'their', 'this', 'that', 'these', 'those', 'not', 'no', 'so', 'up',
  'out', 'if', 'about', 'as', 'into', 'just', 'all', 'also', 'than',
  'then', 'when', 'what', 'how', 'who', 'ok', 'okay', 'yeah', 'yes',
  'lol', 'like', 'get', 'got', 'know', 'said', 'im', 'its', 'it\'s',
]);

// ─── Emoji Regex ──────────────────────────────────────────────────────────────

const EMOJI_REGEX =
  /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function topN<T extends Record<string, number>>(
  counts: T,
  n: number
): Array<{ key: string; count: number }> {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}

function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ─── Main Stats Computation ───────────────────────────────────────────────────

export function computeStatistics(messages: ChatMessage[]): ChatStatistics {
  if (messages.length === 0) {
    return {
      totalMessages: 0,
      participants: [],
      firstMessage: null,
      lastMessage: null,
      mostActiveDay: null,
      mostActiveMonth: null,
      mostActiveHour: null,
      longestInactivePeriod: null,
      avgReplyTimeMs: null,
      dailyActivity: [],
      weeklyActivity: [],
      monthlyActivity: [],
      topEmojis: [],
      topWords: [],
    };
  }

  const nonSystem = messages.filter((m) => m.type !== 'system');
  const participantMap: Map<string, ParticipantStats> = new Map();
  const dailyCounts: Record<string, number> = {};
  const weeklyCounts: Record<string, number> = {};
  const monthlyCounts: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};
  const globalEmojiCounts: Record<string, number> = {};
  const globalWordCounts: Record<string, number> = {};

  let replyTimeSum = 0;
  let replyTimeCount = 0;
  let lastSender = '';
  let lastTimestamp = 0;

  for (const msg of nonSystem) {
    // Per-participant stats
    if (!participantMap.has(msg.sender)) {
      participantMap.set(msg.sender, {
        name: msg.sender,
        messageCount: 0,
        totalChars: 0,
        avgMessageLength: 0,
        longestMessage: '',
        emojiCounts: {},
        wordCounts: {},
      });
    }
    const pStats = participantMap.get(msg.sender)!;
    pStats.messageCount++;
    pStats.totalChars += msg.text.length;
    if (msg.text.length > pStats.longestMessage.length) {
      pStats.longestMessage = msg.text;
    }

    // Emojis
    const emojis = msg.text.match(EMOJI_REGEX) ?? [];
    for (const emoji of emojis) {
      pStats.emojiCounts[emoji] = (pStats.emojiCounts[emoji] ?? 0) + 1;
      globalEmojiCounts[emoji] = (globalEmojiCounts[emoji] ?? 0) + 1;
    }

    // Words
    const words = msg.text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));
    for (const word of words) {
      pStats.wordCounts[word] = (pStats.wordCounts[word] ?? 0) + 1;
      globalWordCounts[word] = (globalWordCounts[word] ?? 0) + 1;
    }

    // Daily / weekly / monthly / hourly
    dailyCounts[msg.date] = (dailyCounts[msg.date] ?? 0) + 1;

    if (msg.timestamp > 0) {
      const d = new Date(msg.timestamp);
      const weekKey = isoWeek(d);
      const monthKey = msg.date.slice(0, 7);
      const hour = d.getHours();
      weeklyCounts[weekKey] = (weeklyCounts[weekKey] ?? 0) + 1;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] ?? 0) + 1;
      hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
    }

    // Reply time (sender changes)
    if (lastSender && lastSender !== msg.sender && lastTimestamp > 0 && msg.timestamp > 0) {
      const diff = msg.timestamp - lastTimestamp;
      if (diff > 0 && diff < 3_600_000 * 24) {
        replyTimeSum += diff;
        replyTimeCount++;
      }
    }
    lastSender = msg.sender;
    lastTimestamp = msg.timestamp;
  }

  // Finalize avgMessageLength
  for (const [, p] of participantMap) {
    p.avgMessageLength = p.messageCount > 0 ? Math.round(p.totalChars / p.messageCount) : 0;
  }

  // Most active day / month / hour
  const mostActiveDay = Object.entries(dailyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const mostActiveMonth = Object.entries(monthlyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const mostActiveHourEntry = Object.entries(hourCounts).sort((a, b) => Number(b[0]) - Number(a[0]))[0];
  const mostActiveHour = mostActiveHourEntry ? parseInt(mostActiveHourEntry[0], 10) : null;

  // Longest inactive period
  let longestInactivePeriod: number | null = null;
  const timestamps = nonSystem.map((m) => m.timestamp).filter((t) => t > 0).sort((a, b) => a - b);
  for (let i = 1; i < timestamps.length; i++) {
    const gap = timestamps[i] - timestamps[i - 1];
    if (longestInactivePeriod === null || gap > longestInactivePeriod) {
      longestInactivePeriod = gap;
    }
  }

  // Activity arrays
  const dailyActivity: DailyActivity[] = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const weeklyActivity: WeeklyActivity[] = Object.entries(weeklyCounts)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const monthlyActivity: MonthlyActivity[] = Object.entries(monthlyCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const topEmojis = topN(globalEmojiCounts, 20).map(({ key, count }) => ({
    emoji: key,
    count,
  }));

  const topWords = topN(globalWordCounts, 30).map(({ key, count }) => ({
    word: key,
    count,
  }));

  return {
    totalMessages: nonSystem.length,
    participants: Array.from(participantMap.values()),
    firstMessage: nonSystem[0] ?? null,
    lastMessage: nonSystem[nonSystem.length - 1] ?? null,
    mostActiveDay,
    mostActiveMonth,
    mostActiveHour,
    longestInactivePeriod: longestInactivePeriod ? longestInactivePeriod / 3_600_000 : null,
    avgReplyTimeMs: replyTimeCount > 0 ? replyTimeSum / replyTimeCount : null,
    dailyActivity,
    weeklyActivity,
    monthlyActivity,
    topEmojis,
    topWords,
  };
}
