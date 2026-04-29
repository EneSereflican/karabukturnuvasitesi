import { createServiceClient } from '@/lib/supabase/server';
import Link from 'next/link';
import AdminFiksturClient from './AdminFiksturClient';

type Team = {
  id: string;
  name: string;
};

type MatchEvent = {
  id: string;
  event_type: string;
  minute: number;
  player_id: string | null;
  team_id: string;
  player_name: string | null;
};

type Match = {
  id: string;
  week: number;
  match_date: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: Team | Team[];
  away_team: Team | Team[];
};

type Player = {
  id: string;
  first_name: string;
  last_name: string;
};

type InitialMatch = {
  id: string;
  week: number;
  match_date: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: Team;
  away_team: Team;
  events: MatchEvent[];
};

export default async function AdminFiksturPage() {
  const supabase = createServiceClient();

  // Takımları çek
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .order('name', { ascending: true });

  // Maçları çek
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id,
      week,
      match_date,
      status,
      home_score,
      away_score,
      home_team:teams!home_team_id(id, name),
      away_team:teams!away_team_id(id, name)
    `)
    .order('week', { ascending: true })
    .order('match_date', { ascending: true, nullsFirst: false });

  // Maç ID'lerini topla
  const matchIds = (matches || []).map((m: Match) => m.id);

  const eventsMap: Record<string, MatchEvent[]> = {};

  if (matchIds.length > 0) {
    const { data: events } = await supabase
      .from('match_events')
      .select('id, match_id, event_type, minute, player_id, team_id')
      .in('match_id', matchIds);

    // Oyuncu isimlerini çek
    type RawEvent = { id: string; match_id: string; event_type: string; minute: number; player_id: string | null; team_id: string };
    const playerIds = [
      ...new Set((events || []).map((e: RawEvent) => e.player_id).filter(Boolean)),
    ];

    let playersMap: Record<string, string> = {};

    if (playerIds.length > 0) {
      const { data: players } = await supabase
        .from('players')
        .select('id, first_name, last_name')
        .in('id', playerIds);

      playersMap = (players || []).reduce(
        (acc: Record<string, string>, p: Player) => {
          acc[p.id] = `${p.first_name} ${p.last_name}`;
          return acc;
        },
        {}
      );
    }

    for (const event of events || []) {
      const e = event as RawEvent;
      if (!eventsMap[e.match_id]) eventsMap[e.match_id] = [];
      eventsMap[e.match_id].push({
        id: e.id,
        event_type: e.event_type,
        minute: e.minute,
        player_id: e.player_id || null,
        team_id: e.team_id,
        player_name: e.player_id ? playersMap[e.player_id] || null : null,
      });
    }
  }

  const initialMatches: InitialMatch[] = (matches || []).map((m: Match) => {
    const homeTeam = Array.isArray(m.home_team) ? m.home_team[0] : m.home_team;
    const awayTeam = Array.isArray(m.away_team) ? m.away_team[0] : m.away_team;
    return {
      id: m.id,
      week: m.week,
      match_date: m.match_date,
      status: m.status,
      home_score: m.home_score,
      away_score: m.away_score,
      home_team: homeTeam,
      away_team: awayTeam,
      events: eventsMap[m.id] || [],
    };
  });

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors mb-6">
        ← Admin Paneli
      </Link>
      <AdminFiksturClient
        teams={teams || []}
        initialMatches={initialMatches}
      />
    </>
  );
}
