import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      team_key,
      first_name,
      last_name,
      tc_no,
      phone,
      email,
      institution,
      jersey_number,
    } = body;

    // Validate required fields
    if (
      !team_key ||
      !first_name ||
      !last_name ||
      !phone ||
      !email ||
      !institution ||
      jersey_number === undefined
    ) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanlar gereklidir' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Step 1: Get team by key
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, status')
      .eq('team_key', team_key)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Geçersiz takım anahtarı' },
        { status: 404 }
      );
    }

    // Step 2: Check if team is already approved
    if (team.status === 'approved') {
      return NextResponse.json(
        { error: 'Bu takımın başvurusu onaylanmıştır.' },
        { status: 400 }
      );
    }

    // Step 3: Check team quota (max 15 players)
    const { count, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', team.id);

    if (countError) {
      return NextResponse.json(
        { error: 'Oyuncu sayısı kontrol edilemedi' },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= 15) {
      return NextResponse.json(
        { error: 'Takım kontenjanı dolmuştur.' },
        { status: 400 }
      );
    }

    // Step 4: Check for duplicate email or tc_no in this team
    if (email) {
      const { data: existingEmail } = await supabase
        .from('players')
        .select('id')
        .eq('team_id', team.id)
        .eq('email', email)
        .maybeSingle();

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Bu e-posta adresiyle bu takımda zaten kayıt var.' },
          { status: 400 }
        );
      }
    }

    if (tc_no && tc_no.trim()) {
      const { data: existingTc } = await supabase
        .from('players')
        .select('id')
        .eq('team_id', team.id)
        .eq('tc_no', tc_no)
        .maybeSingle();

      if (existingTc) {
        return NextResponse.json(
          { error: 'Bu TC numarasıyla bu takımda zaten kayıt var.' },
          { status: 400 }
        );
      }
    }

    // Step 5: Insert player record
    const { data: player, error: insertError } = await supabase
      .from('players')
      .insert({
        team_id: team.id,
        first_name,
        last_name,
        tc_no: tc_no || null,
        phone,
        email,
        institution,
        jersey_number,
      })
      .select('id')
      .single();

    if (insertError || !player) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Oyuncu kaydı oluşturulamadı' },
        { status: 500 }
      );
    }

    // Step 6: Return success with player_id and team_id
    return NextResponse.json(
      {
        success: true,
        player_id: player.id,
        team_id: team.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
