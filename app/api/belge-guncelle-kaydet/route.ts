import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Document {
  document_type: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player_id, team_id, team_key, documents } = body;

    // Validate required fields
    if (!player_id || !team_id || !team_key || !documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksiktir' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Process each document
    for (const doc of documents) {
      const { document_type, file_path, file_name, file_size, mime_type } = doc;

      // Delete old record with same owner_id and document_type
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('owner_id', player_id)
        .eq('document_type', document_type);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return NextResponse.json(
          { error: 'Eski belge silinirken hata oluştu' },
          { status: 500 }
        );
      }

      // Insert new record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          owner_type: 'player',
          owner_id: player_id,
          team_id,
          document_type,
          file_path,
          file_name,
          file_size,
          mime_type,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json(
          { error: 'Belge kaydedilirken hata oluştu' },
          { status: 500 }
        );
      }
    }

    // Update team status to pending
    const { error: updateTeamError } = await supabase
      .from('teams')
      .update({
        status: 'pending',
        rejection_note: null,
        rejected_player_ids: [],
      })
      .eq('team_key', team_key);

    if (updateTeamError) {
      console.error('Update team error:', updateTeamError);
      return NextResponse.json(
        { error: 'Takım statüsü güncellenirken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Güncelleme başarısız' },
      { status: 500 }
    );
  }
}
