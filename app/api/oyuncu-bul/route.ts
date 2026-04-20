import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_key, identifier } = body;

    if (!team_key || !identifier) {
      return NextResponse.json(
        { error: 'Takım anahtarı ve kimlik bilgisi gerekli' },
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

    // Determine if identifier is email or TC ID
    const isEmail = identifier.includes('@');

    // Fetch player
    let query = supabase
      .from('players')
      .select('id, first_name, last_name')
      .eq('team_id', team.id);

    if (isEmail) {
      query = query.eq('email', identifier);
    } else {
      query = query.eq('tc_no', identifier);
    }

    const { data: player, error: playerError } = await query.single();

    if (playerError || !player) {
      return NextResponse.json(
        {
          error:
            'Bu bilgi ile kayıt bulunamadı. TC kimlik numarası veya e-posta adresinizi kontrol edin.',
        },
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
