'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
}

interface MatchEvent {
  id: string;
  event_type: 'goal' | 'yellow_card' | 'red_card';
  minute: number;
  player_id: string;
  team_id: string;
  player_name: string | null;
}

interface Match {
  id: string;
  week: number;
  match_date: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: Team;
  away_team: Team;
  events: MatchEvent[];
}

export default function FiksturPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch('/api/mac-listesi');
        const data = await res.json();
        if (data.matches) {
          setMatches(data.matches);
          const weeks = [...new Set(data.matches.map((m: Match) => m.week))].sort(
            (a, b) => (a as number) - (b as number)
          );
          if (weeks.length > 0) setActiveWeek(weeks[0] as number);
        }
      } catch {
        console.error('Maçlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  const weeks = [...new Set(matches.map((m) => m.week))].sort((a, b) => a - b);
  const filteredMatches = matches.filter((m) => m.week === activeWeek);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return '⚽';
      case 'yellow_card':
        return '🟨';
      case 'red_card':
        return '🟥';
      default:
        return '•';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'goal':
        return 'Gol';
      case 'yellow_card':
        return 'Sarı Kart';
      case 'red_card':
        return 'Kırmızı Kart';
      default:
        return '';
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link href="/" style={styles.backLink}>
          ← Ana Sayfa
        </Link>

        <h1 style={styles.title}>Fikstür</h1>

        {loading ? (
          <div style={styles.spinnerWrapper}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Yükleniyor...</p>
          </div>
        ) : matches.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Henüz fikstür oluşturulmamıştır</p>
          </div>
        ) : (
          <>
            {/* Hafta Sekmeleri */}
            <div style={styles.tabsWrapper}>
              <div style={styles.tabs}>
                {weeks.map((week) => (
                  <button
                    key={week}
                    onClick={() => {
                      setActiveWeek(week);
                      setExpandedMatch(null);
                    }}
                    style={{
                      ...styles.tab,
                      ...(activeWeek === week ? styles.tabActive : {}),
                    }}
                  >
                    Hafta {week}
                  </button>
                ))}
              </div>
            </div>

            {/* Maç Listesi */}
            <div style={styles.matchList}>
              {filteredMatches.map((match) => {
                const isExpanded = expandedMatch === match.id;
                const sortedEvents = [...match.events].sort(
                  (a, b) => a.minute - b.minute
                );

                return (
                  <div key={match.id}>
                    <div
                      style={{
                        ...styles.matchCard,
                        ...(isExpanded ? styles.matchCardExpanded : {}),
                      }}
                      onClick={() =>
                        setExpandedMatch(isExpanded ? null : match.id)
                      }
                    >
                      {/* Status Badge */}
                      <div style={styles.badgeRow}>
                        <span
                          style={{
                            ...styles.badge,
                            ...(match.status === 'completed'
                              ? styles.badgeCompleted
                              : styles.badgeScheduled),
                          }}
                        >
                          {match.status === 'completed'
                            ? 'Tamamlandı'
                            : 'Oynanacak'}
                        </span>
                      </div>

                      {/* Maç İçeriği */}
                      <div style={styles.matchContent}>
                        <div style={styles.teamName}>
                          {match.home_team?.name || 'Ev Sahibi'}
                        </div>

                        <div style={styles.scoreSection}>
                          {match.status === 'completed' ? (
                            <div style={styles.score}>
                              <span style={styles.scoreNum}>
                                {match.home_score ?? 0}
                              </span>
                              <span style={styles.scoreDivider}>-</span>
                              <span style={styles.scoreNum}>
                                {match.away_score ?? 0}
                              </span>
                            </div>
                          ) : (
                            <div style={styles.vsSection}>
                              <span style={styles.vsText}>vs</span>
                              <span style={styles.dateText}>
                                {match.match_date
                                  ? `${formatDate(match.match_date)} • ${formatTime(match.match_date)}`
                                  : 'Tarih belirtilmemiş'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div style={styles.teamName}>
                          {match.away_team?.name || 'Deplasman'}
                        </div>
                      </div>

                      {/* Expand indicator */}
                      {match.events.length > 0 && (
                        <div style={styles.expandHint}>
                          {isExpanded ? '▲ Olayları gizle' : '▼ Olayları göster'}
                        </div>
                      )}
                    </div>

                    {/* Maç Olayları */}
                    {isExpanded && sortedEvents.length > 0 && (
                      <div style={styles.eventsPanel}>
                        <div style={styles.eventsTitle}>Maç Olayları</div>
                        {sortedEvents.map((event) => (
                          <div key={event.id} style={styles.eventRow}>
                            <span style={styles.eventMinute}>
                              {event.minute}&apos;
                            </span>
                            <span style={styles.eventIcon}>
                              {getEventIcon(event.event_type)}
                            </span>
                            <span style={styles.eventInfo}>
                              <span style={styles.eventPlayer}>
                                {event.player_name || 'Bilinmeyen Oyuncu'}
                              </span>
                              <span style={styles.eventType}>
                                {getEventLabel(event.event_type)}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0d1f12',
    color: '#e0e0e0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '24px 16px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#f0a500',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 24,
    transition: 'opacity 0.2s',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center' as const,
  },
  spinnerWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #2d4a32',
    borderTopColor: '#f0a500',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#8a9a8e',
    fontSize: 14,
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#8a9a8e',
    fontSize: 16,
    backgroundColor: '#1a2e1d',
    padding: '20px 32px',
    borderRadius: 12,
    border: '1px solid #2d4a32',
  },
  tabsWrapper: {
    overflowX: 'auto' as const,
    marginBottom: 24,
    WebkitOverflowScrolling: 'touch' as any,
  },
  tabs: {
    display: 'flex',
    gap: 8,
    paddingBottom: 4,
  },
  tab: {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid #2d4a32',
    backgroundColor: '#1a2e1d',
    color: '#8a9a8e',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  tabActive: {
    backgroundColor: '#f0a500',
    color: '#0d1f12',
    borderColor: '#f0a500',
  },
  matchList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  matchCard: {
    backgroundColor: '#1a2e1d',
    border: '1px solid #2d4a32',
    borderRadius: 16,
    padding: '14px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    animation: 'fadeIn 0.3s ease',
  },
  matchCardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: 'transparent',
  },
  badgeRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badge: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  badgeScheduled: {
    backgroundColor: 'rgba(240, 165, 0, 0.15)',
    color: '#f0a500',
    border: '1px solid rgba(240, 165, 0, 0.3)',
  },
  badgeCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    color: '#4caf50',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  },
  matchContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 600,
    color: '#ffffff',
    textAlign: 'center' as const,
    wordBreak: 'break-word',
    hyphens: 'auto',
    minWidth: 0,
  },
  scoreSection: {
    flexShrink: 0,
    textAlign: 'center' as const,
  },
  score: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  scoreNum: {
    fontSize: 20,
    fontWeight: 800,
    color: '#f0a500',
    minWidth: 28,
    textAlign: 'center' as const,
  },
  scoreDivider: {
    fontSize: 20,
    color: '#5a7a5e',
    fontWeight: 300,
  },
  vsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 700,
    color: '#5a7a5e',
  },
  dateText: {
    fontSize: 11,
    color: '#8a9a8e',
    textAlign: 'center',
    wordBreak: 'break-word',
  },
  expandHint: {
    textAlign: 'center' as const,
    fontSize: 11,
    color: '#5a7a5e',
    marginTop: 10,
  },
  eventsPanel: {
    backgroundColor: '#15271a',
    border: '1px solid #2d4a32',
    borderTop: 'none',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: '14px 12px',
    animation: 'fadeIn 0.25s ease',
  },
  eventsTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#8a9a8e',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  eventRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 0',
    borderBottom: '1px solid #1e3523',
  },
  eventMinute: {
    fontSize: 13,
    fontWeight: 700,
    color: '#f0a500',
    minWidth: 32,
  },
  eventIcon: {
    fontSize: 16,
  },
  eventInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  eventPlayer: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e0e0e0',
  },
  eventType: {
    fontSize: 11,
    color: '#8a9a8e',
  },
};
