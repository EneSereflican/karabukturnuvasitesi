import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/admin-auth';
import { createSecureAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const cookieStore = cookies();
    const token = (await cookieStore).get('admin_token')?.value;

    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teamId, action, rejectionNote, rejectedPlayerIds } = body;

    const supabase = await createSecureAdminClient();

    if (action === 'approve') {
      // Check member count
      const { count: playerCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      const totalMembers = 1 + (playerCount ?? 0);

      if (totalMembers < 10) {
        return NextResponse.json(
          { error: 'Onay için en az 10 üye gereklidir' },
          { status: 400 }
        );
      }

      // Update team status
      const { error: updateError } = await supabase
        .from('teams')
        .update({
          status: 'approved',
          rejection_note: null,
        })
        .eq('id', teamId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'İşlem sırasında hata oluştu' },
          { status: 500 }
        );
      }
    } else if (action === 'reject') {
      if (!rejectionNote || rejectionNote.length < 10) {
        return NextResponse.json(
          { error: 'Red gerekçesi zorunludur' },
          { status: 400 }
        );
      }

      // Update team status
      const { error: updateError } = await supabase
        .from('teams')
        .update({
          status: 'rejected',
          rejection_note: rejectionNote,
          rejected_player_ids: rejectedPlayerIds || [],
        })
        .eq('id', teamId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'İşlem sırasında hata oluştu' },
          { status: 500 }
        );
      }
    } else if (action === 'unreject') {
      // Update team status to pending
      const { error: updateError } = await supabase
        .from('teams')
        .update({
          status: 'pending',
          rejection_note: null,
          rejected_player_ids: [],
        })
        .eq('id', teamId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'İşlem sırasında hata oluştu' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Decision error:', error);
    return NextResponse.json(
      { error: 'İşlem sırasında hata oluştu' },
      { status: 500 }
    );
  }
}
