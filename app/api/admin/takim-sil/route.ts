import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin token
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (!adminToken || !(await verifyAdminToken(adminToken))) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Get team ID from request body
    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json(
        { error: 'Takım ID gerekli' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch all documents for this team to get file paths
    const { data: documentsData, error: docsError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('team_id', teamId);

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return NextResponse.json(
        { error: 'Silme işlemi başarısız' },
        { status: 500 }
      );
    }

    // Delete files from storage
    if (documentsData && documentsData.length > 0) {
      const filePaths = documentsData.map((doc) => doc.file_path);
      
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
        return NextResponse.json(
          { error: 'Silme işlemi başarısız' },
          { status: 500 }
        );
      }
    }

    // Delete team from database (cascade will delete players and documents)
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (deleteError) {
      console.error('Error deleting team:', deleteError);
      return NextResponse.json(
        { error: 'Silme işlemi başarısız' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in takim-sil endpoint:', error);
    return NextResponse.json(
      { error: 'Silme işlemi başarısız' },
      { status: 500 }
    );
  }
}
