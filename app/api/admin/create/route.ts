import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tüm alanlar gerekli' },
        { status: 400 }
      );
    }

    // Verify admin token
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const verified = await verifyAdminToken(token);
    if (!verified) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    const supabase = createServiceClient();

    // Insert admin
    const { error } = await supabase
      .from('admins')
      .insert([
        {
          email,
          password_hash: hash,
          name,
        },
      ]);

    if (error) {
      return NextResponse.json(
        { error: 'Hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Hata oluştu' },
      { status: 500 }
    );
  }
}
