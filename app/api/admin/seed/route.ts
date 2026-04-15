import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const text = await request.text();
    console.log('Raw body:', text);

    if (!text) {
      return Response.json({ error: 'Body boş' }, { status: 400 });
    }

    const { secret, email, password, name } = JSON.parse(text);

    // Verify secret
    if (secret !== process.env.SEED_SECRET) {
      return NextResponse.json(
        { error: 'Yetkisiz' },
        { status: 401 }
      );
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tüm alanlar gerekli' },
        { status: 400 }
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
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Hata oluştu' },
      { status: 500 }
    );
  }
}
