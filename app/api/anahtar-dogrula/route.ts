import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_key } = body;

    if (!team_key) {
      return NextResponse.json(
        { error: 'Takım anahtarı gereklidir' },
        { status: 400 }
      );
    }

    // Create service client
    const supabase = createServiceClient();

    // Fetch team by team_key
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, institution, status')
      .eq('team_key', team_key)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Geçersiz takım anahtarı' },
        { status: 404 }
      );
    }

    // Check if team status is approved
    if (team.status === 'approved') {
      return NextResponse.json(
        {
          error:
            'Bu takımın başvurusu onaylanmıştır, yeni oyuncu kabul edilemiyor',
        },
        { status: 400 }
      );
    }

    // Count players in the team
    const { count, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact' })
      .eq('team_id', team.id);

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json(
        { error: 'Bir hata oluştu' },
        { status: 500 }
      );
    }

    // totalMembers includes players only
    const totalMembers = count || 0;

    if (totalMembers >= 15) {
      return NextResponse.json(
        { error: 'Takım kontenjanı dolmuştur' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        team_id: team.id,
        team_name: team.name,
        institution: team.institution,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
