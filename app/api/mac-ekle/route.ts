import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { home_team_id, away_team_id, week, match_date } = body;

    // Zorunlu alan kontrolü
    if (!home_team_id || !away_team_id || !week) {
      return NextResponse.json(
        { error: 'home_team_id, away_team_id ve week alanları zorunludur' },
        { status: 400 }
      );
    }

    // Aynı takım kontrolü
    if (home_team_id === away_team_id) {
      return NextResponse.json(
        { error: 'Aynı takım seçilemez' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Eklenecek veri
    const insertData: any = {
      home_team_id,
      away_team_id,
      week,
      status: 'scheduled',
    };

    if (match_date) {
      insertData.match_date = match_date;
    }

    // Maçı veritabanına ekle
    const { data, error } = await supabase
      .from('matches')
      .insert([insertData])
      .select('id')
      .single();

    if (error) {
      console.error('Maç ekleme hatası:', error);
      return NextResponse.json(
        { error: 'Maç eklenirken bir hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, match_id: data.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sunucu hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
