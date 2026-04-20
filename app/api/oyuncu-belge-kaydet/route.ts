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
    const { player_id, team_id, documents } = body;

    // Validate required fields
    if (!player_id || !team_id || !documents || !Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksiktir' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Prepare documents for bulk insert
    const documentsToInsert = documents.map((doc: Document) => ({
      owner_type: 'player',
      owner_id: player_id,
      team_id,
      document_type: doc.document_type,
      file_path: doc.file_path,
      file_name: doc.file_name,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
    }));

    // Insert all documents
    const { error: insertError } = await supabase
      .from('documents')
      .insert(documentsToInsert);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Belgeler kaydedilemedi' },
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
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
