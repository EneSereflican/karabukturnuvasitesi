import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createServiceClient();
    let totalDeleted = 0;
    let errors = [];

    // documents tablosundan tc_front ve tc_back dosya yollarını çek
    const { data: docs, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .in('document_type', ['tc_front', 'tc_back']);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!docs || docs.length === 0) {
      return NextResponse.json({ message: 'Veritabanında silinecek kayıt yok', deleted: 0 });
    }

    const paths = docs.map((d: { file_path: string }) => d.file_path);

    // 100'er parça halinde storage'dan sil
    for (let i = 0; i < paths.length; i += 100) {
      const chunk = paths.slice(i, i + 100);
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove(chunk);
      
      if (deleteError) {
        errors.push(deleteError.message);
      } else {
        totalDeleted += chunk.length;
      }
    }

    // Veritabanı kayıtlarını da sil
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .in('document_type', ['tc_front', 'tc_back']);

    return NextResponse.json({ 
      success: true, 
      deleted: totalDeleted,
      dbError: dbError?.message,
      errors 
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
