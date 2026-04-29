import { createServiceClient } from '@/lib/supabase/server';
import Link from 'next/link';
import AdminFiksturClient from './AdminFiksturClient';

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
    .order('match_date', { ascending: true });

  // Maç ID'lerini topla
  const matchIds = (matches || []).map((m: any) => m.id);

  let eventsMap: Record<string, any[]> = {};

  if (matchIds.length > 0) {
    const { data: events } = await supabase
      .from('match_events')
      .select('id, match_id, event_type, minute, player_id, team_id')
      .in('match_id', matchIds);

    // Oyuncu isimlerini çek
    const playerIds = [
      ...new Set((events || []).map((e: any) => e.player_id).filter(Boolean)),
    ];

    let playersMap: Record<string, string> = {};

    if (playerIds.length > 0) {
      const { data: players } = await supabase
        .from('players')
        .select('id, first_name, last_name')
        .in('id', playerIds);

      playersMap = (players || []).reduce(
        (acc: Record<string, string>, p: any) => {
          acc[p.id] = `${p.first_name} ${p.last_name}`;
          return acc;
        },
        {}
      );
    }

    for (const event of events || []) {
      const e = event as any;
      if (!eventsMap[e.match_id]) eventsMap[e.match_id] = [];
      eventsMap[e.match_id].push({
        id: e.id,
        event_type: e.event_type,
        minute: e.minute,
        player_id: e.player_id,
        team_id: e.team_id,
        player_name: e.player_id ? playersMap[e.player_id] || null : null,
      });
    }
  }

  const initialMatches = (matches || []).map((m: any) => ({
    id: m.id,
    week: m.week,
    match_date: m.match_date,
    status: m.status,
    home_score: m.home_score,
    away_score: m.away_score,
    home_team: m.home_team,
    away_team: m.away_team,
    events: eventsMap[m.id] || [],
  }));

  return (
    <>
      <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors mb-6 inline-flex">
        ← Admin Paneli
      </Link>
      <AdminFiksturClient
        teams={teams || []}
        initialMatches={initialMatches}
      />
    </>
  );
}
