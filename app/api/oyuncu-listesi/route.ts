import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const team_id = searchParams.get('team_id');

    if (!team_id) {
      return NextResponse.json({ error: 'team_id gerekli' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: players, error } = await supabase
      .from('players')
      .select('id, first_name, last_name, jersey_number')
      .eq('team_id', team_id)
      .order('jersey_number', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Oyuncular getirilemedi' }, { status: 500 });
    }

    return NextResponse.json({ players }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
