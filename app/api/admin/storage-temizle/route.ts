import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createServiceClient();

    // TC kimlik dosyalarının yollarını storage.objects'ten çek
    const { data: objects, error: listError } = await supabase
      .from('storage.objects')
      .select('name')
      .eq('bucket_id', 'documents')
      .or('name.like.%tc_front%,name.like.%tc_back%');

    if (listError) {
      // Alternatif yöntem: storage API ile listele
      const { data: files, error: storageError } = await supabase
        .storage
        .from('documents')
        .list('teams', { limit: 1000 });

      return NextResponse.json({ 
        error: listError.message,
        files: files?.length 
      }, { status: 500 });
    }

    if (!objects || objects.length === 0) {
      return NextResponse.json({ message: 'Silinecek dosya yok', deleted: 0 });
    }

    const paths = objects.map((o: { name: string }) => o.name);

    // 100'er parça halinde sil
    let totalDeleted = 0;
    for (let i = 0; i < paths.length; i += 100) {
      const chunk = paths.slice(i, i + 100);
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove(chunk);
      if (!deleteError) totalDeleted += chunk.length;
    }

    return NextResponse.json({ success: true, deleted: totalDeleted });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
