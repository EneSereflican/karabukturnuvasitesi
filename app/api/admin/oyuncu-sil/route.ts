import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/admin-auth';
import { createSecureAdminClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin token
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: 'Oyuncu ID gerekli' },
        { status: 400 }
      );
    }

    const supabase = await createSecureAdminClient();

    // Fetch all documents for the player
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, file_path')
      .eq('owner_id', playerId)
      .eq('owner_type', 'player');

    if (docsError) {
      console.error('Documents fetch error:', docsError);
      return NextResponse.json(
        { error: 'Silme işlemi başarısız' },
        { status: 500 }
      );
    }

    // Delete files from storage
    if (documents && documents.length > 0) {
      const filePaths = documents.map((doc) => doc.file_path);

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove(filePaths);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        return NextResponse.json(
          { error: 'Silme işlemi başarısız' },
          { status: 500 }
        );
      }
    }

    // Delete document records from database
    const { error: deleteDocsError } = await supabase
      .from('documents')
      .delete()
      .eq('owner_id', playerId)
      .eq('owner_type', 'player');

    if (deleteDocsError) {
      console.error('Documents deletion error:', deleteDocsError);
      return NextResponse.json(
        { error: 'Silme işlemi başarısız' },
        { status: 500 }
      );
    }

    // Delete player record
    const { error: deletePlayerError } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (deletePlayerError) {
      console.error('Player deletion error:', deletePlayerError);
      return NextResponse.json(
        { error: 'Silme işlemi başarısız' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Player deletion error:', error);
    return NextResponse.json(
      { error: 'Silme işlemi başarısız' },
      { status: 500 }
    );
  }
}
