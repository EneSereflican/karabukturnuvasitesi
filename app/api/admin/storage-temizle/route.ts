import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createServiceClient();

    // Tüm takım klasörlerini listele
    const { data: teamFolders } = await supabase.storage
      .from('documents')
      .list('teams', { limit: 1000 });

    if (!teamFolders) {
      return NextResponse.json({ message: 'Klasör bulunamadı' });
    }

    let totalDeleted = 0;

    for (const team of teamFolders) {
      // Her takımın players klasörünü listele
      const { data: playerFolders } = await supabase.storage
        .from('documents')
        .list(`teams/${team.name}/players`, { limit: 1000 });

      if (!playerFolders) continue;

      for (const player of playerFolders) {
        const basePath = `teams/${team.name}/players/${player.name}`;

        // tc_front klasörünü sil
        const { data: tcFrontFiles } = await supabase.storage
          .from('documents')
          .list(`${basePath}/tc_front`, { limit: 1000 });

        if (tcFrontFiles && tcFrontFiles.length > 0) {
          const paths = tcFrontFiles.map(f => `${basePath}/tc_front/${f.name}`);
          const { error } = await supabase.storage.from('documents').remove(paths);
          if (!error) totalDeleted += paths.length;
        }

        // tc_back klasörünü sil
        const { data: tcBackFiles } = await supabase.storage
          .from('documents')
          .list(`${basePath}/tc_back`, { limit: 1000 });

        if (tcBackFiles && tcBackFiles.length > 0) {
          const paths = tcBackFiles.map(f => `${basePath}/tc_back/${f.name}`);
          const { error } = await supabase.storage.from('documents').remove(paths);
          if (!error) totalDeleted += paths.length;
        }
      }
    }

    return NextResponse.json({ success: true, deleted: totalDeleted });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}