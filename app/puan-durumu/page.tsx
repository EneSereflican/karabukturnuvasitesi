'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
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
}

interface TeamStanding {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export default function PuanDurumuPage() {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    async function fetchAndCalculate() {
      try {
        const res = await fetch('/api/mac-listesi');
        const data = await res.json();

        if (!data.matches) return;

        const completed = (data.matches as Match[]).filter(
          (m) => m.status === 'completed'
        );

        if (completed.length === 0) {
          setHasCompleted(false);
          return;
        }

        setHasCompleted(true);

        const teamsMap: Record<string, TeamStanding> = {};

        const ensureTeam = (team: Team) => {
          if (!teamsMap[team.id]) {
            teamsMap[team.id] = {
              id: team.id,
              name: team.name,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDiff: 0,
              points: 0,
            };
          }
        };

        for (const match of completed) {
          const hs = match.home_score ?? 0;
          const as_ = match.away_score ?? 0;

          ensureTeam(match.home_team);
          ensureTeam(match.away_team);

          const home = teamsMap[match.home_team.id];
          const away = teamsMap[match.away_team.id];

          home.played++;
          away.played++;

          home.goalsFor += hs;
          home.goalsAgainst += as_;
          away.goalsFor += as_;
          away.goalsAgainst += hs;

          if (hs > as_) {
            home.won++;
            home.points += 3;
            away.lost++;
          } else if (hs < as_) {
            away.won++;
            away.points += 3;
            home.lost++;
          } else {
            home.drawn++;
            away.drawn++;
            home.points += 1;
            away.points += 1;
          }
        }

        const sorted = Object.values(teamsMap)
          .map((t) => ({ ...t, goalDiff: t.goalsFor - t.goalsAgainst }))
          .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            return b.goalsFor - a.goalsFor;
          });

        setStandings(sorted);
      } catch {
        console.error('Veriler yüklenemedi');
      } finally {
        setLoading(false);
      }
    }

    fetchAndCalculate();
  }, []);

  const getRankStyle = (rank: number): React.CSSProperties => {
    if (rank <= 4) {
      return {
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        color: '#4caf50',
        border: '1px solid rgba(76, 175, 80, 0.3)',
      };
    }
    if (rank <= 16) {
      return {
        backgroundColor: 'rgba(240, 165, 0, 0.15)',
        color: '#f0a500',
        border: '1px solid rgba(240, 165, 0, 0.3)',
      };
    }
    return {
      backgroundColor: 'rgba(150, 150, 150, 0.15)',
      color: '#888',
      border: '1px solid rgba(150, 150, 150, 0.3)',
    };
  };

  const getRankLabel = (rank: number): string => {
    if (rank <= 4) return 'Direkt';
    if (rank <= 16) return 'Playoff';
    return 'Elendi';
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link href="/" style={styles.backLink}>
          ← Ana Sayfa
        </Link>

        <h1 style={styles.title}>Puan Durumu</h1>

        {loading ? (
          <div style={styles.spinnerWrapper}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Yükleniyor...</p>
          </div>
        ) : !hasCompleted ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              Henüz sonuçlanmış maç bulunmamaktadır
            </p>
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, ...styles.thFirst }}>Sıra</th>
                    <th style={{ ...styles.th, ...styles.thTeam }}>Takım</th>
                    <th style={styles.th}>O</th>
                    <th style={styles.th}>G</th>
                    <th style={styles.th}>B</th>
                    <th style={styles.th}>M</th>
                    <th style={styles.th}>AG</th>
                    <th style={styles.th}>YG</th>
                    <th style={styles.th}>A</th>
                    <th style={{ ...styles.th, ...styles.thLast }}>P</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, idx) => {
                    const rank = idx + 1;
                    return (
                      <tr
                        key={team.id}
                        style={{
                          ...styles.tr,
                          animation: `fadeIn 0.3s ease ${idx * 0.03}s both`,
                        }}
                      >
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.rankBadge,
                              ...getRankStyle(rank),
                            }}
                          >
                            {rank}
                          </span>
                        </td>
                        <td style={{ ...styles.td, ...styles.tdTeam }}>
                          {team.name}
                        </td>
                        <td style={styles.td}>{team.played}</td>
                        <td style={styles.td}>{team.won}</td>
                        <td style={styles.td}>{team.drawn}</td>
                        <td style={styles.td}>{team.lost}</td>
                        <td style={styles.td}>{team.goalsFor}</td>
                        <td style={styles.td}>{team.goalsAgainst}</td>
                        <td
                          style={{
                            ...styles.td,
                            color:
                              team.goalDiff > 0
                                ? '#4caf50'
                                : team.goalDiff < 0
                                  ? '#e57373'
                                  : '#8a9a8e',
                            fontWeight: 700,
                          }}
                        >
                          {team.goalDiff > 0
                            ? `+${team.goalDiff}`
                            : team.goalDiff}
                        </td>
                        <td style={{ ...styles.td, ...styles.tdPoints }}>
                          {team.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={styles.legend}>
              <div style={styles.legendRow}>
                <span style={{ ...styles.legendDot, backgroundColor: '#4caf50' }} />
                <span style={styles.legendLabel}>İlk 4 takım direkt tur</span>
              </div>
              <div style={styles.legendRow}>
                <span style={{ ...styles.legendDot, backgroundColor: '#f0a500' }} />
                <span style={styles.legendLabel}>
                  5-16. takımlar playoff oynayacak
                </span>
              </div>
            </div>
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
    whiteSpace: 'nowrap' as const,
  },
  thFirst: {
    width: 56,
  },
  thTeam: {
    textAlign: 'left' as const,
    minWidth: 140,
  },
  thLast: {
    width: 48,
  },
  tr: {
    borderBottom: '1px solid #1e3523',
    transition: 'background-color 0.15s',
  },
  td: {
    padding: '12px',
    textAlign: 'center' as const,
    fontSize: 14,
    color: '#c0c0c0',
    whiteSpace: 'nowrap' as const,
  },
  tdTeam: {
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#ffffff',
  },
  tdPoints: {
    fontWeight: 800,
    color: '#f0a500',
    fontSize: 16,
  },
  rankBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 20,
    marginTop: 16,
    padding: '14px 20px',
    backgroundColor: '#1a2e1d',
    borderRadius: 12,
    border: '1px solid #2d4a32',
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendLabel: {
    fontSize: 13,
    color: '#8a9a8e',
  },
};
