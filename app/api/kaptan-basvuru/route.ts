import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get form fields
    const team_name = formData.get('team_name') as string;
    const institution = formData.get('institution') as string;
    const jersey_color = formData.get('jersey_color') as string | null;
    const responsible1_name = formData.get('responsible1_name') as string | null;
    const responsible1_phone = formData.get('responsible1_phone') as string | null;
    const responsible1_email = formData.get('responsible1_email') as string | null;
    const responsible2_name = formData.get('responsible2_name') as string | null;
    const responsible2_phone = formData.get('responsible2_phone') as string | null;
    const responsible2_email = formData.get('responsible2_email') as string | null;

    // Validate required fields
    if (!team_name || !institution) {
      return NextResponse.json(
        { error: 'Zorunlu alanlar eksik' },
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
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: team_name,
        institution,
        jersey_color: jersey_color || null,
        team_key,
        status: 'pending',
        responsible1_name: responsible1_name || null,
        responsible1_phone: responsible1_phone || null,
        responsible1_email: responsible1_email || null,
        responsible2_name: responsible2_name || null,
        responsible2_phone: responsible2_phone || null,
        responsible2_email: responsible2_email || null,
      })
      .select('id')
      .single();

    if (teamError || !teamData) {
      console.error('Supabase insert error:', teamError);
      return NextResponse.json(
        { error: 'Takım oluşturulurken hata oluştu' },
        { status: 500 }
      );
    }

    const team_id = teamData.id;

    return NextResponse.json({ success: true, team_key }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Takım oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
