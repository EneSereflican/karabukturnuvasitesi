import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { team_name, institution, jersey_color } = body;

    // Validate required fields
    if (!team_name || !institution) {
      return NextResponse.json(
        { error: 'team_name ve institution alanları zorunludur' },
        { status: 400 }
      );
    }

    // Generate team_key
    const team_key = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    // Create service client
    const supabase = createServiceClient();

    // Insert into teams table
    const { error } = await supabase.from('teams').insert({
      name: team_name,
      institution,
      jersey_color: jersey_color || null,
      team_key,
      status: 'pending',
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Takım oluşturulurken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, team_key },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Takım oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
