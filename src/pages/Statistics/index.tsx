import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Header } from '../../components/Header';
import { StatsCard } from '../../components/StatsCard';
import { useChat } from '../../hooks/useChat';
import { computeStatistics } from '../../utils/statistics';
import { formatDateDivider, getDurationString } from '../../utils/date';

export function StatisticsPage() {
  const { chat } = useChat();
  const navigate = useNavigate();

  const stats = useMemo(
    () => (chat ? computeStatistics(chat.messages) : null),
    [chat]
  );

  if (!chat || !stats) {
    navigate('/');
    return null;
  }


  // Format most active day
  const formattedDay = stats.mostActiveDay
    ? formatDateDivider(stats.mostActiveDay)
    : 'N/A';

  const formattedMonth = stats.mostActiveMonth
    ? (() => {
        const [y, m] = stats.mostActiveMonth.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[parseInt(m, 10) - 1]} ${y}`;
      })()
    : 'N/A';

  const avgReplyStr = stats.avgReplyTimeMs != null
    ? getDurationString(stats.avgReplyTimeMs)
    : 'N/A';

  const inactiveStr = stats.longestInactivePeriod != null
    ? `${Math.round(stats.longestInactivePeriod)} hours`
    : 'N/A';

  const totalDays = chat.dateRange.end && chat.dateRange.start
    ? Math.max(1, Math.round((chat.dateRange.end.getTime() - chat.dateRange.start.getTime()) / 86_400_000))
    : 1;

  const msgsPerDay = (stats.totalMessages / totalDays).toFixed(1);

  return (
    <div style={styles.root}>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.pageTitle}>📊 Chat Statistics</h1>
          <p style={styles.pageSub}>
            {stats.firstMessage?.date && `${formatDateDivider(stats.firstMessage.date)} — `}
            {stats.lastMessage?.date && formatDateDivider(stats.lastMessage.date)}
          </p>

          {/* ─── Top Stats Grid ─── */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Overview</h2>
            <div style={styles.grid}>
              <StatsCard
                icon="💬"
                title="Total Messages"
                value={stats.totalMessages.toLocaleString()}
                sub={`~${msgsPerDay} messages/day`}
                accent
              />
              <StatsCard
                icon="📅"
                title="Chat Duration"
                value={`${totalDays} days`}
                sub={`${stats.firstMessage?.date ?? ''} → ${stats.lastMessage?.date ?? ''}`}
              />
              <StatsCard
                icon="🔥"
                title="Most Active Day"
                value={formattedDay}
              />
              <StatsCard
                icon="📆"
                title="Most Active Month"
                value={formattedMonth}
              />
              <StatsCard
                icon="⏰"
                title="Most Active Hour"
                value={stats.mostActiveHour !== null ? `${stats.mostActiveHour}:00` : 'N/A'}
              />
              <StatsCard
                icon="⚡"
                title="Avg Reply Time"
                value={avgReplyStr}
              />
              <StatsCard
                icon="😴"
                title="Longest Silence"
                value={inactiveStr}
              />
            </div>
          </section>

          {/* ─── Per Participant ─── */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Participants</h2>
            <div style={styles.grid}>
              {stats.participants.map((p) => (
                <StatsCard
                  key={p.name}
                  icon="👤"
                  title={p.name}
                  value={p.messageCount.toLocaleString()}
                  sub={`messages · avg ${p.avgMessageLength} chars`}
                >
                  <div style={styles.participantBar}>
                    <div
                      style={{
                        ...styles.participantBarFill,
                        width: `${(p.messageCount / stats.totalMessages) * 100}%`,
                      }}
                    />
                  </div>
                </StatsCard>
              ))}
            </div>
          </section>

          {/* ─── Daily Activity Chart ─── */}
          {stats.dailyActivity.length > 1 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Daily Activity</h2>
              <div style={styles.chartCard}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.dailyActivity} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      tickFormatter={(v: string) => v.slice(5)}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ─── Monthly Activity Chart ─── */}
          {stats.monthlyActivity.length > 1 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Monthly Activity</h2>
              <div style={styles.chartCard}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.monthlyActivity} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      tickFormatter={(v: string) => v.slice(0, 7)}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ─── Top Emojis ─── */}
          {stats.topEmojis.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Top Emojis</h2>
              <div style={styles.emojiGrid}>
                {stats.topEmojis.slice(0, 12).map((e) => (
                  <div key={e.emoji} style={styles.emojiItem}>
                    <span style={styles.emoji}>{e.emoji}</span>
                    <span style={styles.emojiCount}>{e.count}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── Top Words ─── */}
          {stats.topWords.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Top Words</h2>
              <div style={styles.wordCloud}>
                {stats.topWords.slice(0, 25).map((w) => {
                  const maxCount = stats.topWords[0].count;
                  const scale = 0.75 + (w.count / maxCount) * 0.75;
                  return (
                    <span
                      key={w.word}
                      style={{
                        ...styles.wordTag,
                        fontSize: `${scale}rem`,
                        opacity: 0.5 + (w.count / maxCount) * 0.5,
                      }}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* ─── Export section ─── */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Export</h2>
            <div style={styles.exportRow}>
              <ExportBtn
                id="export-json-btn"
                label="Export as JSON"
                icon="📋"
                onClick={() => exportJSON(chat.messages)}
              />
              <ExportBtn
                id="export-html-btn"
                label="Export as HTML"
                icon="🌐"
                onClick={() => exportHTML(chat.messages)}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// ─── Export helpers ───────────────────────────────────────────────────────────

import type { ChatMessage } from '../../types/chat';

function exportJSON(messages: ChatMessage[]) {
  const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wa-chat-export.json';
  a.click();
  URL.revokeObjectURL(url);
}

function exportHTML(messages: ChatMessage[]) {
  const rows = messages.map((m) => {
    const align = m.isMine ? 'right' : 'left';
    const bg = m.isMine ? '#d9fdd3' : '#fff';
    return `<div style="display:flex;justify-content:${align};margin:4px 16px;">
      <div style="background:${bg};padding:8px 12px 20px;border-radius:8px;max-width:65%;position:relative;box-shadow:0 1px 2px rgba(0,0,0,0.1);font-family:sans-serif;font-size:14px;">
        ${!m.isMine ? `<b style="color:#25D366;font-size:12px;display:block;">${m.sender}</b>` : ''}
        ${m.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}
        <span style="position:absolute;bottom:4px;right:8px;font-size:11px;color:#888;">${m.time}</span>
      </div>
    </div>`;
  }).join('\n');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>WA Chat Export</title>
<style>body{background:#efeae2;margin:0;padding:20px 0;}</style>
</head><body>${rows}</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wa-chat-export.html';
  a.click();
  URL.revokeObjectURL(url);
}

function ExportBtn({ id, label, icon, onClick }: { id: string; label: string; icon: string; onClick: () => void }) {
  return (
    <button
      id={id}
      onClick={onClick}
      style={styles.exportBtn}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)')}
    >
      <span style={{ fontSize: 24 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    background: 'var(--bg-primary)',
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '32px 24px 64px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  pageSub: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    marginBottom: 0,
  },
  section: {
    marginTop: '40px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  participantBar: {
    height: '4px',
    background: 'var(--bg-tertiary)',
    borderRadius: '2px',
    marginTop: '8px',
    overflow: 'hidden',
  },
  participantBarFill: {
    height: '100%',
    background: 'var(--accent)',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  chartCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: 'var(--shadow-sm)',
  },
  emojiGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  emojiItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '12px 16px',
    minWidth: '60px',
  },
  emoji: {
    fontSize: '28px',
  },
  emojiCount: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  wordCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
    padding: '20px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '14px',
  },
  wordTag: {
    color: 'var(--accent)',
    fontWeight: 600,
    cursor: 'default',
    transition: 'transform var(--transition-fast)',
  },
  exportRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    transition: 'background var(--transition-fast)',
    fontFamily: 'inherit',
    boxShadow: 'var(--shadow-sm)',
  },
};
