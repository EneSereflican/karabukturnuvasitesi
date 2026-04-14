import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set({
    name: 'admin_token',
    value: '',
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
  });

  return response;
}
