import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

interface TeamMember {
  id: string;
  fullName: string;
  title: string;
  description: string;
  image: string;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'team.json');

// Ensure directories exist
async function ensureDirectories() {
  const { mkdir } = await import('fs/promises');
  const { existsSync } = await import('fs');
  
  const dataDir = path.dirname(DATA_FILE);
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

// Read team members from file
async function readTeamMembers(): Promise<TeamMember[]> {
  try {
    await ensureDirectories();
    const { existsSync } = await import('fs');
    if (existsSync(DATA_FILE)) {
      const data = await readFile(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
    // Return default data if file doesn't exist
    const defaultData: TeamMember[] = [
      {
        id: '1',
        fullName: 'Ahmet Yılmaz',
        title: 'Gayrimenkul Uzmanı',
        description: 'Gayrimenkul sektöründe 10 yıllık deneyime sahip uzmanımız. Müşteri memnuniyeti odaklı çalışır.',
        image: 'https://via.placeholder.com/400x400/21375e/ffffff?text=Ahmet+Y%C4%B1lmaz',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        fullName: 'Ayşe Demir',
        title: 'Satış Danışmanı',
        description: 'Profesyonel satış danışmanlığı ile müşterilerimize en uygun gayrimenkul çözümlerini sunar.',
        image: 'https://via.placeholder.com/400x400/21375e/ffffff?text=Ay%C5%9Fe+Demir',
        createdAt: new Date().toISOString(),
      }
    ];
    await writeTeamMembers(defaultData);
    return defaultData;
  } catch (error) {
    console.error('Error reading team members:', error);
    return [];
  }
}

// Write team members to file
async function writeTeamMembers(teamMembers: TeamMember[]): Promise<void> {
  try {
    await ensureDirectories();
    const { writeFile } = await import('fs/promises');
    await writeFile(DATA_FILE, JSON.stringify(teamMembers, null, 2));
  } catch (error) {
    console.error('Error writing team members:', error);
  }
}

// GET - Tüm ekip üyelerini getir
export async function GET() {
  try {
    const teamMembers = await readTeamMembers();
    return NextResponse.json({
      success: true,
      data: teamMembers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Ekip üyeleri alınırken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni ekip üyesi ekle
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const fullName = formData.get('fullName') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as File;

    if (!fullName || !title || !description) {
      return NextResponse.json(
        { success: false, error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    // Handle file upload - Base64 encoding
    let imageUrl = 'https://via.placeholder.com/400x400/21375e/ffffff?text=Yeni+%C3%9Cye';
    if (image && image.size > 0) {
      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        
        // MIME type'ı belirle
        const mimeType = image.type || 'image/jpeg';
        
        // Data URL formatında kaydet
        imageUrl = `data:${mimeType};base64,${base64String}`;
      } catch (fileError) {
        console.error('File upload error:', fileError);
        // Keep placeholder if upload fails
      }
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      fullName,
      title,
      description,
      image: imageUrl,
      createdAt: new Date().toISOString(),
    };

    const teamMembers = await readTeamMembers();
    teamMembers.push(newMember);
    await writeTeamMembers(teamMembers);

    return NextResponse.json({
      success: true,
      message: 'Ekip üyesi başarıyla eklendi',
      data: newMember
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Ekip üyesi eklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Ekip üyesi sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Ekip üyesi ID gerekli' },
        { status: 400 }
      );
    }

    const teamMembers = await readTeamMembers();
    const memberIndex = teamMembers.findIndex((member: TeamMember) => member.id === id);
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Ekip üyesi bulunamadı' },
        { status: 404 }
      );
    }

    teamMembers.splice(memberIndex, 1);
    await writeTeamMembers(teamMembers);

    return NextResponse.json({
      success: true,
      message: 'Ekip üyesi başarıyla silindi'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Ekip üyesi silinirken hata oluştu' },
      { status: 500 }
    );
  }
} 