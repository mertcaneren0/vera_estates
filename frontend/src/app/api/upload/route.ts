import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cloud storage configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const USE_CLOUD_STORAGE = process.env.USE_CLOUD_STORAGE === 'true';

// Cloudinary upload function
async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  const formData = new FormData();
  const timestamp = Math.round(Date.now() / 1000);
  
  // Create signature for Cloudinary
  const crypto = require('crypto');
  const stringToSign = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  formData.append('file', new Blob([buffer]), filename);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', CLOUDINARY_API_KEY!);
  formData.append('signature', signature);
  formData.append('folder', 'vera-gayrimenkul'); // Organize uploads in folder

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const result = await response.json();
  return result.secure_url;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    const uploadedFiles: string[] = [];

    // Check if cloud storage is configured and enabled
    if (USE_CLOUD_STORAGE && CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      console.log('Using cloud storage (Cloudinary)');
      
      for (const file of files) {
        if (file.size === 0) continue;

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(file.name);
        const fileName = `${timestamp}_${randomString}${extension}`;
        
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          const cloudUrl = await uploadToCloudinary(buffer, fileName);
          uploadedFiles.push(cloudUrl);
        } catch (error) {
          console.error('Cloud upload error:', error);
          // Fallback to local storage on cloud error
          return await uploadToLocal(files);
        }
      }
    } else {
      console.log('Using local storage (cloud storage not configured)');
      return await uploadToLocal(files);
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      storage: 'cloud'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosya yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Local storage fallback function
async function uploadToLocal(files: File[]) {
  try {
    // Upload klasörünü oluştur
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Debug logging
    console.log('Upload directory path:', uploadDir);
    console.log('Current working directory:', process.cwd());
    
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating upload directory...');
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Verify directory exists and is writable
    if (!fs.existsSync(uploadDir)) {
      throw new Error(`Upload directory does not exist: ${uploadDir}`);
    }

    const uploadedFiles: string[] = [];

    for (const file of files) {
      if (file.size === 0) continue;

      // Dosya adını benzersiz yap
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(file.name);
      const fileName = `${timestamp}_${randomString}${extension}`;
      
      // Dosyayı kaydet
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log('Saving file to:', filePath);
      fs.writeFileSync(filePath, buffer);
      
      // Verify file was saved
      if (fs.existsSync(filePath)) {
        console.log('File saved successfully:', fileName);
        uploadedFiles.push(`/uploads/${fileName}`);
      } else {
        console.error('File was not saved:', filePath);
        throw new Error(`Failed to save file: ${fileName}`);
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      storage: 'local',
      debug: {
        uploadDir,
        cwd: process.cwd(),
        filesCount: uploadedFiles.length
      }
    });

  } catch (error) {
    console.error('Local upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Dosya yüklenirken hata oluştu (yerel)',
        debug: {
          uploadDir: path.join(process.cwd(), 'public/uploads'),
          cwd: process.cwd(),
          error: error instanceof Error ? error.stack : String(error)
        }
      },
      { status: 500 }
    );
  }
} 