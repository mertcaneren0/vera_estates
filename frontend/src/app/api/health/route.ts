import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'vera-gayrimenkul'
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'ERROR', error: 'Health check failed' },
      { status: 500 }
    );
  }
} 