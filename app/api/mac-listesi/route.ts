import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Maçları çek, home_team ve away_team ilişkileriyle birlikte
    const { data: matches, error: matchesError } = await supabase
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

    if (matchesError) {
      return NextResponse.json({ error: 'Maçlar getirilemedi' }, { status: 500 });
    }

    // Her maç için event'leri çek
    const matchIds = matches.map((m: any) => m.id);

    const { data: events, error: eventsError } = await supabase
      .from('match_events')
      .select('id, match_id, event_type, minute, player_id, team_id')
      .in('match_id', matchIds);

    if (eventsError) {
      return NextResponse.json({ error: 'Olaylar getirilemedi' }, { status: 500 });
    }

    // Event'lerdeki oyuncu id'lerini topla
    const playerIds = [...new Set(events.map((e: any) => e.player_id).filter(Boolean))];

    let playersMap: Record<string, string> = {};

    if (playerIds.length > 0) {
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, first_name, last_name')
        .in('id', playerIds);

      if (playersError) {
        return NextResponse.json({ error: 'Oyuncular getirilemedi' }, { status: 500 });
      }

      playersMap = (players || []).reduce((acc: Record<string, string>, p: any) => {
        acc[p.id] = `${p.first_name} ${p.last_name}`;
        return acc;
      }, {});
    }

    // Event'leri maç id'sine göre grupla
    const eventsMap: Record<string, any[]> = {};
    for (const event of events) {
      const e = event as any;
      if (!eventsMap[e.match_id]) {
        eventsMap[e.match_id] = [];
      }
      eventsMap[e.match_id].push({
        id: e.id,
        event_type: e.event_type,
        minute: e.minute,
        player_id: e.player_id,
        team_id: e.team_id,
        player_name: e.player_id ? playersMap[e.player_id] || null : null,
      });
    }

    // Maçlara event'leri ekle
    const result = matches.map((match: any) => ({
      id: match.id,
      week: match.week,
      match_date: match.match_date,
      status: match.status,
      home_score: match.home_score,
      away_score: match.away_score,
      home_team: match.home_team,
      away_team: match.away_team,
      events: eventsMap[match.id] || [],
    }));

    return NextResponse.json({ matches: result }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
