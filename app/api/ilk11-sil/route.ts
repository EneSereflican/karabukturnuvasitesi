import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_id, identifier } = body;

    if (!team_id || !identifier) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const isEmail = identifier.includes('@');
    const isPhone = /^[0-9]{10,11}$/.test(identifier.replace(/\s/g, ''));

    let personName: string | null = null;

    let captainQuery = supabase
      .from('captains')
      .select('first_name, last_name')
      .eq('team_id', team_id);

    if (isEmail) {
      captainQuery = captainQuery.eq('email', identifier);
    } else if (isPhone) {
      captainQuery = captainQuery.eq('phone', identifier.replace(/\s/g, ''));
    } else {
      captainQuery = captainQuery.eq('tc_no', identifier);
    }

    const { data: captain } = await captainQuery.single();

    if (captain) {
      personName = `${captain.first_name} ${captain.last_name}`;
    } else {
      let playerQuery = supabase
        .from('players')
        .select('first_name, last_name')
        .eq('team_id', team_id);

      if (isEmail) {
        playerQuery = playerQuery.eq('email', identifier);
      } else if (isPhone) {
        playerQuery = playerQuery.eq('phone', identifier.replace(/\s/g, ''));
      } else {
        playerQuery = playerQuery.eq('tc_no', identifier);
      }

      const { data: player } = await playerQuery.single();
      if (player) {
        personName = `${player.first_name} ${player.last_name}`;
      }
    }

    if (!personName) {
      return NextResponse.json(
        { error: 'Bu bilgi ile takımda kayıtlı kişi bulunamadı' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('lineups')
      .update({
        players: [],
        substitutes: [],
        formation: null,
        deleted_by_name: personName,
        created_by_name: null,
        updated_at: new Date().toISOString(),
      })
      .eq('team_id', team_id);

    if (error) return NextResponse.json({ error: 'Silme başarısız' }, { status: 500 });

    return NextResponse.json({ success: true, deleted_by: personName }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
