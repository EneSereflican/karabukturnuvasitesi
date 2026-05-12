import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/admin-auth';
import { createSecureAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const cookieStore = cookies();
    const token = (await cookieStore).get('admin_token')?.value;

    if (!token || !(await verifyAdminToken(token))) {
      return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), {
        status: 401,
      });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const download = searchParams.get('download');

    if (!path) {
      return new Response(
        JSON.stringify({ error: 'Dosya yolu gereklidir' }),
        {
          status: 400,
        }
      );
    }

    const supabase = await createSecureAdminClient();

    // Download file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .download(path);

    if (error || !data) {
      console.error('Download error:', error);
      return new Response(
        JSON.stringify({ error: 'Belge yüklenemedi' }),
        {
          status: 500,
        }
      );
    }

    // Extract filename from path
    const fileName = path.split('/').pop() ?? 'dosya';

    // Determine Content-Type based on file extension
    const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
    let contentType = 'application/octet-stream';

    if (extension === 'pdf') {
      contentType = 'application/pdf';
    } else if (extension === 'jpg' || extension === 'jpeg') {
      contentType = 'image/jpeg';
    } else if (extension === 'png') {
      contentType = 'image/png';
    }

    // Convert Blob to ArrayBuffer
    const buffer = await data.arrayBuffer();

    // Create response headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);

    if (download) {
      headers.set(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );
    } else {
      headers.set(
        'Content-Disposition',
        `inline; filename="${fileName}"`
      );
    }

    return new Response(buffer, { headers });
  } catch (error) {
    console.error('Document error:', error);
    return new Response(
      JSON.stringify({ error: 'Belge yüklenemedi' }),
      {
        status: 500,
      }
    );
  }
}
