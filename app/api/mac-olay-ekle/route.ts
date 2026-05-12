import { NextRequest, NextResponse } from 'next/server';
import { createSecureAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { match_id, team_id, player_id, event_type, minute } = body;

    if (!match_id || !team_id || !player_id || !event_type || minute === undefined || minute === null) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    const validTypes = ['goal', 'yellow_card', 'red_card'];
    if (!validTypes.includes(event_type)) {
      return NextResponse.json({ error: 'Geçersiz event_type' }, { status: 400 });
    }

    const supabase = await createSecureAdminClient();

    const { error } = await supabase
      .from('match_events')
      .insert({
        match_id,
        team_id,
        player_id,
        event_type,
        minute,
      });

    if (error) {
      return NextResponse.json({ error: 'Olay eklenemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
