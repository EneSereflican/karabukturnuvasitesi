import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_key, tc_no } = body;

    if (!team_key || !tc_no) {
      return NextResponse.json(
        { error: 'Takım anahtarı ve TC kimlik numarası gerekli' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, status, rejection_note')
      .eq('team_key', team_key)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Geçersiz takım anahtarı' },
        { status: 404 }
      );
    }

    if (team.status !== 'rejected') {
      return NextResponse.json(
        { error: 'Bu takımın başvurusu reddedilmemiş' },
        { status: 400 }
      );
    }

    // Fetch player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, first_name, last_name')
      .eq('tc_no', tc_no)
      .eq('team_id', team.id)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Bu TC kimlik numarası ile kayıt bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        player_id: player.id,
        player_name: `${player.first_name} ${player.last_name}`,
        team_name: team.name,
        rejection_note: team.rejection_note,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Player lookup error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
