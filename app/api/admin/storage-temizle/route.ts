import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

async function listAllFiles(supabase: SupabaseClient, path: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from('documents')
    .list(path, { limit: 1000 });

  if (error || !data) return [];

  const files: string[] = [];
  for (const item of data) {
    const fullPath = path ? `${path}/${item.name}` : item.name;
    if (item.metadata) {
      if (fullPath.includes('tc_front') || fullPath.includes('tc_back')) {
        files.push(fullPath);
      }
    } else {
      const subFiles = await listAllFiles(supabase, fullPath);
      files.push(...subFiles);
    }
  }
  return files;
}

export async function POST() {
  try {
    const supabase = createServiceClient();
    const tcFiles = await listAllFiles(supabase, 'teams');

    if (tcFiles.length === 0) {
      return NextResponse.json({ message: 'Silinecek TC dosyası bulunamadı', deleted: 0 });
    }

    let totalDeleted = 0;
    for (let i = 0; i < tcFiles.length; i += 100) {
      const chunk = tcFiles.slice(i, i + 100);
      const { error } = await supabase.storage.from('documents').remove(chunk);
      if (!error) totalDeleted += chunk.length;
    }

    return NextResponse.json({ success: true, deleted: totalDeleted });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}