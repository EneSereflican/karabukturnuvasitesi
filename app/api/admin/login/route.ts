import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate credentials
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createAdminToken();

    // Set response with cookie
    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Girişs sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
