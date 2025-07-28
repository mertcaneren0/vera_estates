import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        USE_CLOUD_STORAGE: process.env.USE_CLOUD_STORAGE,
        CLOUDINARY_CONFIGURED: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      },
      storage: {
        uploadPath: path.join(process.cwd(), 'public/uploads'),
        uploadPathExists: fs.existsSync(path.join(process.cwd(), 'public/uploads')),
        uploadPathWritable: false,
        files: [] as string[]
      },
      system: {
        cwd: process.cwd(),
        platform: process.platform,
      }
    };

    // Check if upload directory is writable
    try {
      const testFile = path.join(process.cwd(), 'public/uploads/test.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      diagnostics.storage.uploadPathWritable = true;
    } catch (error) {
      diagnostics.storage.uploadPathWritable = false;
    }

    // List files in upload directory
    try {
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        diagnostics.storage.files = files.slice(0, 10); // First 10 files
      }
    } catch (error) {
      diagnostics.storage.files = ['Error reading directory'];
    }

    return NextResponse.json({
      success: true,
      diagnostics
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      diagnostics: null
    }, { status: 500 });
  }
} 