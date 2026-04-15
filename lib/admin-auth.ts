import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.ADMIN_SECRET || 'default-secret'
);

interface AdminTokenPayload {
  id: string;
  email: string;
}

export async function createAdminToken(
  payload: AdminTokenPayload
): Promise<string> {
  const token = await new SignJWT({
    ...payload,
    role: 'admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(secret);

  return token;
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload.role === 'admin';
  } catch (error) {
    return false;
  }
}
