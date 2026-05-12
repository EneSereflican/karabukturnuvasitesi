import { NextRequest, NextResponse } from 'next/server';
import { createSecureAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json({ error: 'event_id zorunludur' }, { status: 400 });
    }

    const supabase = await createSecureAdminClient();

    const { error } = await supabase
      .from('match_events')
      .delete()
      .eq('id', event_id);

    if (error) {
      return NextResponse.json({ error: 'Olay silinemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
