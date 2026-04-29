import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { match_id } = body;

    if (!match_id) {
      return NextResponse.json({ error: 'match_id zorunludur' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', match_id);

    if (error) {
      return NextResponse.json({ error: 'Maç silinemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
