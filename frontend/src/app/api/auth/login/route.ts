import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

// Environment variables - secure credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // Hashed password
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Rate limiting için basit memory store
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 dakika

export async function POST(request: NextRequest) {
  try {
    // Environment variables kontrolü
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !JWT_SECRET) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { success: false, error: 'Server konfigürasyon hatası' },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-posta ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Rate limiting kontrolü
    const attempts = loginAttempts.get(clientIP);
    if (attempts && attempts.count >= MAX_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      if (timeSinceLastAttempt < LOCKOUT_TIME) {
        const remainingTime = Math.ceil((LOCKOUT_TIME - timeSinceLastAttempt) / 60000);
        return NextResponse.json(
          { success: false, error: `Çok fazla başarısız giriş denemesi. ${remainingTime} dakika sonra tekrar deneyin.` },
          { status: 429 }
        );
      } else {
        // Lockout süresi doldu, reset yap
        loginAttempts.delete(clientIP);
      }
    }

    // Email kontrolü
    if (email !== ADMIN_EMAIL) {
      // Başarısız denemeyi kaydet
      const currentAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      loginAttempts.set(clientIP, {
        count: currentAttempts.count + 1,
        lastAttempt: Date.now()
      });

      return NextResponse.json(
        { success: false, error: 'Geçersiz kimlik bilgileri' },
        { status: 401 }
      );
    }

    // Şifre kontrolü (hashed)
    const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isPasswordValid) {
      // Başarısız denemeyi kaydet
      const currentAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      loginAttempts.set(clientIP, {
        count: currentAttempts.count + 1,
        lastAttempt: Date.now()
      });

      return NextResponse.json(
        { success: false, error: 'Geçersiz kimlik bilgileri' },
        { status: 401 }
      );
    }

    // Başarılı giriş - rate limiting'i temizle
    loginAttempts.delete(clientIP);

    // JWT token oluşturma
    const token = await new SignJWT({ 
      email: ADMIN_EMAIL,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('vera-admin')
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      expiry
    });

    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Server hatası' },
      { status: 500 }
    );
  }
} 