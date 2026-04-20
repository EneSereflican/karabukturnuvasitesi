import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const team_id = searchParams.get('team_id');

    if (!team_id) {
      return NextResponse.json({ error: 'team_id gerekli' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: lineup, error } = await supabase
      .from('lineups')
      .select('*')
      .eq('team_id', team_id)
      .single();

    if (error || !lineup) {
      return NextResponse.json({ lineup: null }, { status: 200 });
    }

    const allIds = [...(lineup.players || []), ...(lineup.substitutes || [])];

    const { data: players } = await supabase
      .from('players')
      .select('id, first_name, last_name, jersey_number')
      .in('id', allIds);

    return NextResponse.json({ lineup, players: players || [] }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
