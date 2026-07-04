'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fixtures, type FixtureMatch } from '@/lib/portfolio-data';

interface PlayerStat {
  playerId: string;
  playerName: string;
  teamName: string;
  count: number;
}

type TabKey = 'goal' | 'yellow_card' | 'red_card';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'goal', label: 'Gol Kralı' },
  { key: 'yellow_card', label: 'Sarı Kartlar' },
  { key: 'red_card', label: 'Kırmızı Kartlar' },
];

export default function IstatistiklerPage() {
  const [matches, setMatches] = useState<FixtureMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('goal');

  useEffect(() => {
    setMatches(fixtures);
    setLoading(false);
  }, []);

  const buildTeamMap = (): Record<string, string> => {
    const map: Record<string, string> = {};
    for (const match of matches) {
      if (match.home_team) map[match.home_team.id] = match.home_team.name;
      if (match.away_team) map[match.away_team.id] = match.away_team.name;
    }
    return map;
  };

  const getStats = (eventType: TabKey): PlayerStat[] => {
    const teamMap = buildTeamMap();
    const playerMap: Record<string, PlayerStat> = {};

    for (const match of matches) {
      for (const event of match.events) {
        if (event.event_type !== eventType) continue;

        const playerName = event.player_name || 'Bilinmeyen Oyuncu';
        const playerId = `${event.team_id}:${playerName.toLowerCase()}`;

        if (!playerMap[playerId]) {
          playerMap[playerId] = {
            playerId,
            playerName,
            teamName: teamMap[event.team_id] || 'Bilinmeyen Takım',
            count: 0,
          };
        }
        playerMap[playerId].count++;
      }
    }

    return Object.values(playerMap).sort((a, b) => b.count - a.count);
  };

  const stats = getStats(activeTab);

  const getRankDisplay = (rank: number): string => {
    if (activeTab !== 'goal') return `${rank}`;
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const getColumnHeader = (): { label: string; icon: string } => {
    switch (activeTab) {
      case 'goal':
        return { label: 'Gol', icon: '⚽' };
      case 'yellow_card':
        return { label: 'Sarı Kart', icon: '🟨' };
      case 'red_card':
        return { label: 'Kırmızı Kart', icon: '🟥' };
    }
  };

  const allEvents = matches.flatMap((m) => m.events);
  const hasEvents = allEvents.length > 0;

  const colHeader = getColumnHeader();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link href="/" style={styles.backLink}>
          ← Ana Sayfa
        </Link>

        <h1 style={styles.title}>İstatistikler</h1>

        {loading ? (
          <div style={styles.spinnerWrapper}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Yükleniyor...</p>
          </div>
        ) : !hasEvents ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              Henüz istatistik bulunmamaktadır
            </p>
          </div>
        ) : (
          <>
            {/* Sekmeler */}
            <div style={styles.tabsRow}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab.key ? styles.tabActive : {}),
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tablo */}
            {stats.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>
                  Bu kategoride henüz veri bulunmamaktadır
                </p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: 56 }}>Sıra</th>
                      <th style={{ ...styles.th, textAlign: 'left' as const, minWidth: 140 }}>
                        Oyuncu
                      </th>
                      <th style={{ ...styles.th, textAlign: 'left' as const, minWidth: 120 }} className="col-team">
                        Takım
                      </th>
                      <th style={{ ...styles.th, width: 100 }}>
                        {colHeader.icon} {colHeader.label}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((player, idx) => {
                      const rank = idx + 1;
                      return (
                        <tr
                          key={player.playerId}
                          style={{
                            ...styles.tr,
                            animation: `fadeIn 0.3s ease ${idx * 0.03}s both`,
                          }}
                        >
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.rankCell,
                                ...(activeTab === 'goal' && rank <= 3
                                  ? { fontSize: 20 }
                                  : {}),
                              }}
                            >
                              {getRankDisplay(rank)}
                            </span>
                          </td>
                          <td
                            style={{
                              ...styles.td,
                              textAlign: 'left' as const,
                              fontWeight: 600,
                              color: '#ffffff',
                            }}
                            className="col-player"
                          >
                            {player.playerName}
                          </td>
                          <td
                            style={{
                              ...styles.td,
                              textAlign: 'left' as const,
                              color: '#8a9a8e',
                            }}
                            className="col-team"
                          >
                            {player.teamName}
                          </td>
                          <td
                            style={{
                              ...styles.td,
                              fontWeight: 800,
                              color: '#f0a500',
                              fontSize: 16,
                            }}
                          >
                            {player.count}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .col-team { display: none !important; }
          .col-player { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
    maxWidth: 900,
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
  tabsRow: {
    display: 'flex',
    gap: 0,
    marginBottom: 24,
    borderBottom: '2px solid #2d4a32',
  },
  tab: {
    flex: 1,
    padding: '10px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    color: '#5a7a5e',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: -2,
  },
  tabActive: {
    color: '#ffffff',
    borderBottomColor: '#f0a500',
  },
  tableWrapper: {
    overflowX: 'auto' as const,
    borderRadius: 16,
    border: '1px solid #2d4a32',
    backgroundColor: '#1a2e1d',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 14,
  },
  th: {
    padding: '14px 12px',
    textAlign: 'center' as const,
    fontSize: 12,
    fontWeight: 700,
    color: '#8a9a8e',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    borderBottom: '2px solid #2d4a32',
  },
  tr: {
    borderBottom: '1px solid #1e3523',
  },
  td: {
    padding: '12px',
    textAlign: 'center' as const,
    fontSize: 14,
    color: '#c0c0c0',
  },
  rankCell: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#8a9a8e',
    minWidth: 28,
  },
};
