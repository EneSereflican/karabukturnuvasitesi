import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { match_id, home_score, away_score, status, match_date, week } = body;

    // match_id zorunlu
    if (!match_id) {
      return NextResponse.json(
        { error: 'match_id alanı zorunludur' },
        { status: 400 }
      );
    }

    // Güncellenecek alanları oluştur (sadece body'de gelen alanlar)
    const updateData: any = {};

    if (home_score !== undefined) updateData.home_score = home_score;
    if (away_score !== undefined) updateData.away_score = away_score;
    if (status !== undefined) updateData.status = status;
    if (match_date !== undefined) updateData.match_date = match_date;
    if (week !== undefined) updateData.week = week;

    // Eğer güncellenecek alan yoksa
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek alan belirtilmedi' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Maçı güncelle
    const { error } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', match_id);

    if (error) {
      console.error('Maç güncelleme hatası:', error);
      return NextResponse.json(
        { error: 'Maç güncellenirken bir hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sunucu hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
