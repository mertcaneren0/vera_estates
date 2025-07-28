import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache buster: Hybrid PostgreSQL + JSON fallback implementation - v6.1 (FORCE UPDATE)
// PostgreSQL'e geçiş sürecindeyken JSON fallback kullanıyoruz

// Initialize Prisma Client (conditionally)
let prisma: any = null;
let USE_POSTGRES = false;

// PostgreSQL setup (only if DATABASE_URL is available)
async function initializePrisma() {
  if (process.env.DATABASE_URL && !prisma) {
    try {
      const { PrismaClient } = await import('../../../generated/prisma');
      prisma = new PrismaClient();
      USE_POSTGRES = true;
      console.log('✅ PostgreSQL connection established');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️ PostgreSQL unavailable, falling back to JSON storage:', errorMessage);
      USE_POSTGRES = false;
    }
  }
}

// Fallback JSON file system (temporary)
const DATA_FILE = path.join(process.cwd(), 'data', 'listings.json');

// Data klasörünü oluştur
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Verileri dosyadan oku
function readListings() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsedData = JSON.parse(data);
      // Sort listings by order if exists, otherwise by id
      parsedData.listings.sort((a: any, b: any) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return b.id - a.id; // Fallback to id sorting
      });
      return parsedData;
    }
  } catch (error) {
    console.error('Error reading listings:', error);
  }
  return { listings: [], nextId: 1 };
}

// Verileri dosyaya yaz
function writeListings(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing listings:', error);
  }
}

// File validation fonksiyonları
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/webp', 
  'image/heic',
  'image/heif',
  'image/gif',
  'image/bmp',
  'image/tiff'
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB (artırıldı)
const MAX_FILES = 20; // Dosya sayısı da artırıldı

function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Dosya boyutu kontrolü
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `Dosya boyutu çok büyük. Maksimum: ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  // MIME type kontrolü
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { isValid: false, error: `Desteklenmeyen dosya türü: ${file.type}. Desteklenen türler: ${ALLOWED_IMAGE_TYPES.join(', ')}` };
  }

  // Dosya uzantısı kontrolü (MIME type spoofing'e karşı)
  const fileName = file.name.toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.gif', '.bmp', '.tiff', '.tif'];
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return { isValid: false, error: 'Desteklenmeyen dosya uzantısı. Desteklenen: JPG, PNG, WEBP, HEIC, GIF, BMP, TIFF' };
  }

  return { isValid: true };
}

async function validateImageContent(buffer: Buffer): Promise<{ isValid: boolean; error?: string }> {
  // Magic number kontrolü (dosya header'ı kontrolü)
  const signatures = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46], // RIFF header
    gif: [0x47, 0x49, 0x46],        // GIF
    bmp: [0x42, 0x4D],              // BM
    tiff_le: [0x49, 0x49, 0x2A],    // TIFF Little Endian
    tiff_be: [0x4D, 0x4D, 0x00, 0x2A] // TIFF Big Endian
  };

  const firstBytes = Array.from(buffer.slice(0, 8));
  
  // HEIC/HEIF için özel kontrol (ftypheic veya ftypmif1 arıyoruz)
  const bufferStr = buffer.slice(0, 32).toString('ascii');
  const isHEIC = bufferStr.includes('ftyp') && (bufferStr.includes('heic') || bufferStr.includes('mif1') || bufferStr.includes('heif'));
  
  const isValidImage = isHEIC || Object.values(signatures).some(signature => 
    signature.every((byte, index) => firstBytes[index] === byte)
  );

  if (!isValidImage) {
    console.log('🔍 Buffer first 16 bytes:', firstBytes.slice(0, 16));
    console.log('🔍 Buffer as string (first 32):', bufferStr.slice(0, 32));
    return { isValid: false, error: 'Dosya içeriği geçerli bir resim formatında değil' };
  }

  return { isValid: true };
}

// Property type mapping - Frontend'den gelen string'leri Prisma enum'larına çevirir
const PROPERTY_TYPE_MAPPING: Record<string, string> = {
  'Satılık Daire': 'SATILIK_DAIRE',
  'Kiralık Daire': 'KIRALIK_DAIRE', 
  'Satılık Arsa': 'SATILIK_ARSA',
  'Tarla': 'TARLA',
  'Satılık İş Yeri': 'SATILIK_IS_YERI',
  'Kiralık İş Yeri': 'KIRALIK_IS_YERI'
};

// Status mapping
const STATUS_MAPPING: Record<string, string> = {
  'Aktif': 'ACTIVE',
  'Pasif': 'PASSIVE'
};

// Reverse mappings - Database'den frontend'e
const REVERSE_TYPE_MAPPING = Object.fromEntries(
  Object.entries(PROPERTY_TYPE_MAPPING).map(([k, v]) => [v, k])
);

const REVERSE_STATUS_MAPPING = Object.fromEntries(
  Object.entries(STATUS_MAPPING).map(([k, v]) => [v, k])
);

export async function GET() {
  try {
    // Try PostgreSQL first, fallback to JSON
    await initializePrisma();
    
    if (USE_POSTGRES && prisma) {
      console.log('🔄 PostgreSQL: Fetching listings from database');
      
      const listings = await prisma.listing.findMany({
        orderBy: [
          { createdAt: 'desc' }
        ]
      });

      // Transform database data to frontend format
      const transformedListings = listings.map((listing: any) => ({
        ...listing,
        type: REVERSE_TYPE_MAPPING[listing.type] || listing.type,
        status: REVERSE_STATUS_MAPPING[listing.status] || listing.status,
        images: Array.isArray(listing.images) ? listing.images : (listing.images ? [listing.images] : []),
        listingDate: listing.listingDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      }));

      console.log(`✅ PostgreSQL: Retrieved ${transformedListings.length} listings`);
      
      return NextResponse.json({ 
        success: true, 
        data: transformedListings 
      });
    } else {
      // Fallback to JSON file system
      console.log('📁 JSON: Fetching listings from file system');
      const data = readListings();
      console.log(`✅ JSON: Retrieved ${data.listings.length} listings`);
      
      return NextResponse.json({ 
        success: true, 
        data: data.listings 
      });
    }
  } catch (error) {
    console.error('❌ Error fetching listings:', error);
    
    // Try JSON fallback on any error
    try {
      console.log('🔄 Fallback: Attempting JSON file system...');
      const data = readListings();
      return NextResponse.json({ 
        success: true, 
        data: data.listings 
      });
    } catch (fallbackError) {
      console.error('❌ JSON fallback also failed:', fallbackError);
      return NextResponse.json(
        { success: false, error: 'İlanlar getirilemedi' },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 PostgreSQL POST request received - V6.0 FORCE UPDATE');
    const formData = await request.formData();
    console.log('FormData received, parsing...');
    
    // Form verilerini parse et
    const listingData: any = {};
    
    // Text alanları
    const textFields = [
      'id', 'title', 'description', 'price', 'city', 'district', 'neighborhood',
      'grossArea', 'netArea', 'creditEligible', 'deedType', 'listingSource',
      'swapOption', 'listingDate', 'status', 'type', 'order'
    ];
    
    textFields.forEach(field => {
      const value = formData.get(field);
      if (value) {
        listingData[field] = value.toString();
        console.log(`${field}: ${value}`);
      }
    });
    
    // Validation
    if (!listingData.title || !listingData.type || !listingData.price) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { success: false, error: 'Zorunlu alanlar eksik: title, type, price' },
        { status: 400 }
      );
    }
    
    // Property type'a göre özel alanları ekle
    const propertyType = listingData.type;
    
    if (propertyType?.includes('Daire')) {
      const apartmentFields = [
        'roomType', 'buildingAge', 'floor', 'totalFloors', 'heatingType',
        'bathroomCount', 'kitchenType', 'parkingType', 'usageStatus',
        'complexName', 'dues', 'deposit'
      ];
      
      apartmentFields.forEach(field => {
        const value = formData.get(field);
        if (value) listingData[field] = value.toString();
      });
      
      // Boolean alanlar
      const booleanFields = ['hasBalcony', 'hasElevator', 'isFurnished', 'isInComplex'];
      booleanFields.forEach(field => {
        listingData[field] = formData.get(field) === 'true';
      });
    }
    
    if (propertyType === 'Satılık Arsa' || propertyType === 'Tarla') {
      const landFields = [
        'zoningType', 'blockNumber', 'parcelNumber', 'mapNumber',
        'floorAreaRatio', 'heightLimit'
      ];
      
      landFields.forEach(field => {
        const value = formData.get(field);
        if (value) listingData[field] = value.toString();
      });
      
      if (propertyType === 'Tarla') {
        const fieldSpecific = ['topography', 'irrigation', 'roadStatus'];
        fieldSpecific.forEach(field => {
          const value = formData.get(field);
          if (value) listingData[field] = value.toString();
        });
      }
    }
    
    if (propertyType?.includes('İş Yeri')) {
      const businessFields = [
        'businessType', 'roomCount', 'floorCount', 'buildingAge',
        'heatingType', 'elevatorCount', 'condition', 'deposit'
      ];
      
      businessFields.forEach(field => {
        const value = formData.get(field);
        if (value) listingData[field] = value.toString();
      });
      
      listingData.hasTenant = formData.get('hasTenant') === 'true';
    }
    
    // 🔒 GÜVENLİ İMAJ İŞLEME - V5.0 SECURITY UPDATE
    let processedImages: string[] = [];
    
    console.log('🔒 SECURE IMAGES PROCESSING START - V5.0 🔒');
    
    // 1. DURUM: Doğrudan images olarak gelen dosyalar (file input)
    const imageFiles = formData.getAll('images') as File[];
    console.log('Image files received:', imageFiles.length);
    
    // Dosya sayısı kontrolü
    if (imageFiles.length > MAX_FILES) {
      return NextResponse.json(
        { success: false, error: `Çok fazla dosya. Maksimum ${MAX_FILES} dosya yükleyebilirsiniz.` },
        { status: 400 }
      );
    }
    
    if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
      try {
        for (const file of imageFiles) {
          if (file.size === 0) continue;

          console.log(`📁 Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

          // Dosya validasyonu
          const fileValidation = validateImageFile(file);
          if (!fileValidation.isValid) {
            console.error(`❌ File validation failed for ${file.name}:`, fileValidation.error);
            return NextResponse.json(
              { success: false, error: `Dosya validasyonu başarısız (${file.name}): ${fileValidation.error}` },
              { status: 400 }
            );
          }

          console.log(`✅ File validation passed for: ${file.name}`);

          // Dosyayı buffer'a çevir
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          console.log(`📊 Buffer created, size: ${buffer.length} bytes`);
          
          // İçerik validasyonu
          const contentValidation = await validateImageContent(buffer);
          if (!contentValidation.isValid) {
            console.error(`❌ Content validation failed for ${file.name}:`, contentValidation.error);
            return NextResponse.json(
              { success: false, error: `İçerik validasyonu başarısız (${file.name}): ${contentValidation.error}` },
              { status: 400 }
            );
          }

          console.log(`✅ Content validation passed for: ${file.name}`);

          // Dosyayı Base64'e çevir (sadece validasyondan geçtikten sonra)
          const mimeType = file.type;
          const base64String = `data:${mimeType};base64,${buffer.toString('base64')}`;
          
          processedImages.push(base64String);
          console.log(`✅ SECURE: Image file validated and converted, size: ${(base64String.length / 1024).toFixed(2)}KB`);
        }
      } catch (uploadError) {
        console.error('❌ Image file processing error:', uploadError);
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Bilinmeyen hata';
        const errorStack = uploadError instanceof Error ? uploadError.stack : 'Stack trace yok';
        console.error('❌ Error stack:', errorStack);
        return NextResponse.json(
          { success: false, error: `Dosya işleme hatası: ${errorMessage}. Lütfen geçerli resim dosyaları yükleyin.` },
          { status: 400 }
        );
      }
    }
    
    // Mevcut resimleri de ekle (güncelleme durumunda)
    const imageURLs = formData.get('imageURLs');
    if (imageURLs && imageURLs.toString().trim() !== '') {
      try {
        const urls = JSON.parse(imageURLs.toString());
        if (Array.isArray(urls) && urls.length > 0) {
          console.log('📝 Image URLs received:', urls.length);
          processedImages.push(...urls);
        }
      } catch (error) {
        console.error('❌ Error parsing imageURLs:', error);
      }
    }
    
    // Hiç resim eklenmediyse placeholder ekleme
    if (processedImages.length === 0) {
      console.log('⚠️ No images found, using placeholder');
      processedImages.push('/placeholder-property.jpg');
    }
    
    console.log('💾 Final images format:', processedImages.length, 'images processed securely');
    
    // Transform form data for database
    const dbData: any = {
      title: listingData.title,
      description: listingData.description || null,
      price: listingData.price || null,
      type: PROPERTY_TYPE_MAPPING[listingData.type] || listingData.type,
      status: STATUS_MAPPING[listingData.status] || 'ACTIVE',
      city: listingData.city || null,
      district: listingData.district || null,
      neighborhood: listingData.neighborhood || null,
      grossArea: listingData.grossArea || null,
      netArea: listingData.netArea || null,
      creditEligible: listingData.creditEligible || null,
      deedType: listingData.deedType || null,
      listingSource: listingData.listingSource || null,
      swapOption: listingData.swapOption || null,
      listingDate: listingData.listingDate ? new Date(listingData.listingDate) : new Date(),
      order: listingData.order ? parseInt(listingData.order) : null,
      images: processedImages
    };

    // Property type specific fields
    if (propertyType?.includes('Daire')) {
      Object.assign(dbData, {
        roomType: listingData.roomType || null,
        buildingAge: listingData.buildingAge || null,
        floor: listingData.floor || null,
        totalFloors: listingData.totalFloors || null,
        heatingType: listingData.heatingType || null,
        bathroomCount: listingData.bathroomCount || null,
        kitchenType: listingData.kitchenType || null,
        parkingType: listingData.parkingType || null,
        usageStatus: listingData.usageStatus || null,
        hasBalcony: listingData.hasBalcony || false,
        hasElevator: listingData.hasElevator || false,
        isFurnished: listingData.isFurnished || false,
        isInComplex: listingData.isInComplex || false,
        complexName: listingData.complexName || null,
        dues: listingData.dues || null,
        deposit: listingData.deposit || null,
      });
    }

    if (propertyType === 'Satılık Arsa' || propertyType === 'Tarla') {
      Object.assign(dbData, {
        zoningType: listingData.zoningType || null,
        blockNumber: listingData.blockNumber || null,
        parcelNumber: listingData.parcelNumber || null,
        mapNumber: listingData.mapNumber || null,
        floorAreaRatio: listingData.floorAreaRatio || null,
        heightLimit: listingData.heightLimit || null,
      });

      if (propertyType === 'Tarla') {
        Object.assign(dbData, {
          topography: listingData.topography || null,
          irrigation: listingData.irrigation || null,
          roadStatus: listingData.roadStatus || null,
        });
      }
    }

    if (propertyType?.includes('İş Yeri')) {
      Object.assign(dbData, {
        businessType: listingData.businessType || null,
        roomCount: listingData.roomCount || null,
        floorCount: listingData.floorCount || null,
        buildingAge: listingData.buildingAge || null,
        heatingType: listingData.heatingType || null,
        elevatorCount: listingData.elevatorCount || null,
        hasTenant: listingData.hasTenant || false,
        condition: listingData.condition || null,
        deposit: listingData.deposit || null,
      });
    }
    
    // Database'e kaydet veya güncelle
    if (listingData.id) {
      // ID varsa güncelleme yap
      console.log(`🔄 PostgreSQL: Updating listing with ID: ${listingData.id}`);
      
      const updatedListing = await prisma.listing.update({
        where: { id: listingData.id },
        data: {
          ...dbData,
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ PostgreSQL: Listing updated successfully`);
      
      return NextResponse.json({
        success: true,
        message: 'İlan başarıyla güncellendi',
        data: updatedListing
      });
    } else {
      // ID yoksa yeni ilan ekle
      console.log('🆕 PostgreSQL: Creating new listing');
      
      const newListing = await prisma.listing.create({
        data: dbData
      });
      
      console.log(`✅ PostgreSQL: New listing created with ID: ${newListing.id}`);
      
      return NextResponse.json({
        success: true,
        message: 'İlan başarıyla eklendi',
        data: newListing
      });
    }
    
  } catch (error) {
    console.error('❌ PostgreSQL: Listing operation error:', error);
    return NextResponse.json(
      { success: false, error: 'İlan işlenirken hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'İlan ID gerekli' },
        { status: 400 }
      );
    }
    
    console.log(`🗑️ PostgreSQL: Deleting listing with ID: ${id}`);
    
    await prisma.listing.delete({
      where: { id }
    });
    
    console.log(`✅ PostgreSQL: Listing deleted successfully`);
    
    return NextResponse.json({
      success: true,
      message: 'İlan başarıyla silindi'
    });
    
  } catch (error) {
    console.error('❌ PostgreSQL: Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'İlan silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PostgreSQL PUT request received - Order Update');
    const formData = await request.formData();
    
    const listingId = formData.get('id')?.toString();
    const orderValue = formData.get('order')?.toString();
    
    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'İlan ID gerekli' },
        { status: 400 }
      );
    }

    console.log(`📊 Updating order for listing ${listingId} to ${orderValue}`);

    // Initialize Prisma
    await initializePrisma();
    
    if (USE_POSTGRES && prisma) {
      const parsedOrder = orderValue && orderValue !== '' ? parseInt(orderValue) : null;
      
      const updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: { order: parsedOrder }
      });

      console.log(`✅ PostgreSQL: Order updated successfully for listing ${listingId}`);
      
      return NextResponse.json({
        success: true,
        message: 'Sıralama başarıyla güncellendi',
        data: updatedListing
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Database bağlantısı yok' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ PostgreSQL: Order update error:', error);
    return NextResponse.json(
      { success: false, error: 'Sıralama güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 