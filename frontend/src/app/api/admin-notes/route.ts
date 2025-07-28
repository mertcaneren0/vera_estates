import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

// GET - Admin notlarını getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Listing ID gerekli' },
        { status: 400 }
      );
    }

    const notes = await prisma.adminNote.findMany({
      where: {
        listingId: listingId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: notes
    });

  } catch (error) {
    console.error('Admin notes fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Notlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni admin notu ekle
export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for admin notes');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { listingId, title, content, noteType, priority, isPrivate } = body;

    // Validation
    if (!listingId || !title || !content) {
      console.log('Validation failed:', { listingId, title, content });
      return NextResponse.json(
        { success: false, error: 'Listing ID, başlık ve içerik gerekli' },
        { status: 400 }
      );
    }

    console.log('Creating note with data:', {
      listingId,
      title,
      content,
      noteType: noteType || 'GENERAL',
      priority: priority || 'MEDIUM',
      isPrivate: isPrivate || false,
      createdBy: 'admin'
    });

    const note = await prisma.adminNote.create({
      data: {
        listingId: String(listingId), // String'e çevir
        title,
        content,
        noteType: noteType || 'GENERAL',
        priority: priority || 'MEDIUM',
        isPrivate: isPrivate || false,
        createdBy: 'admin' // Şimdilik sabit, sonra JWT'den alınacak
      }
    });

    console.log('Note created successfully:', note);

    return NextResponse.json({
      success: true,
      data: note,
      message: 'Not başarıyla eklendi'
    });

  } catch (error) {
    console.error('Admin note create error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { success: false, error: `Not eklenirken hata oluştu: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// PUT - Admin notunu güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, noteType, priority, isPrivate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Not ID gerekli' },
        { status: 400 }
      );
    }

    const note = await prisma.adminNote.update({
      where: { id },
      data: {
        title,
        content,
        noteType,
        priority,
        isPrivate,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: note,
      message: 'Not başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Admin note update error:', error);
    return NextResponse.json(
      { success: false, error: 'Not güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Admin notunu sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Not ID gerekli' },
        { status: 400 }
      );
    }

    await prisma.adminNote.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Not başarıyla silindi'
    });

  } catch (error) {
    console.error('Admin note delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Not silinirken hata oluştu' },
      { status: 500 }
    );
  }
} 