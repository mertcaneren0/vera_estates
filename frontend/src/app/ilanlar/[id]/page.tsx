'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StructuredData from "@/components/SEO/StructuredData";
import { 
  MapPinIcon, 
  HomeIcon, 
  CalendarIcon, 
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShareIcon,
  HeartIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Listing {
  id: string | number;
  title: string;
  description: string;
  price: string;
  city: string;
  district: string;
  neighborhood: string;
  grossArea: string;
  netArea: string;
  type: string;
  roomType?: string;
  buildingAge?: string;
  floor?: string;
  totalFloors?: string;
  heatingType?: string;
  parkingType?: string;
  hasBalcony?: boolean;
  hasElevator?: boolean;
  isFurnished?: boolean;
  isInComplex?: boolean;
  complexName?: string;
  dues?: string;
  deposit?: string;
  zoningType?: string;
  businessType?: string;
  roomCount?: string;
  floorCount?: string;
  elevatorCount?: string;
  hasTenant?: boolean;
  condition?: string;
  blockNumber?: string;
  parcelNumber?: string;
  mapNumber?: string;
  floorAreaRatio?: string;
  heightLimit?: string;
  topography?: string;
  irrigation?: string;
  roadStatus?: string;
  creditEligible?: string;
  deedType?: string;
  listingSource?: string;
  swapOption?: string;
  usageStatus?: string;
  kitchenType?: string;
  bathroomCount?: string;
  images: string[];
  createdAt: string;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const fetchListing = async () => {
    try {
      const response = await fetch('/api/listings');
      const result = await response.json();
      
      if (result.success) {
        const foundListing = result.data.find((item: Listing) => item.id.toString() === params.id as string);
        if (foundListing) {
          setListing(foundListing);
          // Ilan bulunduktan sonra benzer ilanları getir
          fetchSimilarListings(foundListing, result.data);
        } else {
          setError('İlan bulunamadı');
        }
      } else {
        setError('İlan yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('İlan detayı yüklenirken hata:', error);
      setError('İlan yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarListings = async (currentListing: Listing, allListings: Listing[]) => {
    try {
      setSimilarLoading(true);
      
      // Aynı tipte olan diğer ilanları bul (mevcut ilan hariç)
      const similar = allListings
        .filter(item => 
          item.type === currentListing.type && 
          item.id.toString() !== currentListing.id.toString()
        )
        .slice(0, 3); // İlk 3 tanesini al
      
      setSimilarListings(similar);
    } catch (error) {
      console.error('Benzer ilanlar yüklenirken hata:', error);
    } finally {
      setSimilarLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  // Klavye kontrolü için useEffect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen || !listing || !listing.images || listing.images.length === 0) return;

      switch (event.key) {
        case 'Escape':
          setIsModalOpen(false);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setModalImageIndex(modalImageIndex === 0 ? listing.images.length - 1 : modalImageIndex - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          setModalImageIndex(modalImageIndex === listing.images.length - 1 ? 0 : modalImageIndex + 1);
          break;
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Modal açıkken scroll'u kapat
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Modal kapanınca scroll'u aç
    };
  }, [isModalOpen, modalImageIndex, listing]);

  // Format price
  const formatPrice = (price: string) => {
    const num = parseInt(price);
    return num.toLocaleString('tr-TR') + ' ₺';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get property type icon
  const getPropertyIcon = (type: string) => {
    if (type.includes('Daire')) {
      return <HomeIcon className="h-6 w-6" />;
    } else if (type.includes('İş Yeri')) {
      return <BuildingOfficeIcon className="h-6 w-6" />;
    }
    return <HomeIcon className="h-6 w-6" />;
  };

  // Image Source Formatter - Base64 & path support
  const getImageSrc = (src: string) => {
    // Base64 kontrolü
    if (src?.startsWith('data:')) {
      return src; // Zaten base64 ise doğrudan kullan
    }
    
    // Path kontrolü - kontrol et, URL'ye çevir
    if (src?.startsWith('/uploads/')) {
      // Local path - Gerçek bir dosya yolu, ancak Docker'da çalışmayabilir
      // İlan görselleri için bir fallback placeholder döndür
      console.log('Legacy image path detected:', src);
      return '/placeholder-property.jpg';
    }
    
    // URL kontrolü
    if (src?.startsWith('http')) {
      return src; // Tam URL'leri doğrudan kullan
    }
    
    // Hiçbiri değilse placeholder göster
    return '/placeholder-property.jpg';
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vera-600"></div>
            <span className="ml-2 text-gray-500">İlan detayı yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center py-20">
            <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">{error}</h3>
            <div className="mt-6">
              <button
                onClick={() => router.push('/ilanlar')}
                className="inline-flex items-center rounded-md bg-vera-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-vera-700"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                İlanlara Geri Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button
                  onClick={() => router.push('/ilanlar')}
                  className="text-vera-600 hover:text-vera-800 flex items-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  İlanlar
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500">{listing.title}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden relative">
                <div className="flex items-center justify-center h-96 bg-gradient-to-r from-vera-100 to-vera-200 relative cursor-pointer" onClick={() => {
                  if (listing.images && listing.images.length > 0) {
                    setModalImageIndex(currentImageIndex);
                    setIsModalOpen(true);
                  }
                }}>
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img 
                        src={getImageSrc(listing.images[currentImageIndex])} 
                        alt={listing.title}
                        className="w-full h-full object-cover absolute inset-0 hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="flex items-center justify-center w-full h-full">${getPropertyIcon(listing.type)}<div class="ml-4"><p class="text-vera-600 font-medium">Fotoğraf Yüklenemedi</p><p class="text-sm text-gray-500">Görsel bulunamadı</p></div></div>`;
                          }
                        }}
                      />
                      
                      {/* Büyütme ikonu ve yazısı */}
                      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full z-10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                      
                      {/* Büyütme talimatı */}
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm z-10">
                        Büyütmek için tıklayın
                      </div>
                      
                      {/* Navigation Arrows */}
                      {listing.images.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex(currentImageIndex === 0 ? listing.images.length - 1 : currentImageIndex - 1)}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 z-10"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(currentImageIndex === listing.images.length - 1 ? 0 : currentImageIndex + 1)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 z-10"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {/* Image Counter */}
                      {listing.images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
                          {currentImageIndex + 1} / {listing.images.length}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {getPropertyIcon(listing.type)}
                      <div className="ml-4">
                        <p className="text-vera-600 font-medium">Fotoğraf Yüklenmedi</p>
                        <p className="text-sm text-gray-500">İlan fotoğrafları yakında eklenecek</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Image Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                  {listing.images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                        index === currentImageIndex ? 'border-vera-600 ring-2 ring-vera-200' : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                      onDoubleClick={() => {
                        setModalImageIndex(index);
                        setIsModalOpen(true);
                      }}
                    >
                      <img 
                        src={getImageSrc(image)} 
                        alt={`${listing.title} - ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col space-y-4 mb-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {getPropertyIcon(listing.type)}
                    <span className="text-sm font-medium text-vera-600">{listing.type}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:text-3xl">{listing.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm sm:text-base">{listing.neighborhood}, {listing.district}, {listing.city}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right sm:flex-shrink-0">
                  <p className="text-xl font-bold text-vera-600 sm:text-3xl">{formatPrice(listing.price)}</p>
                  {listing.type.includes('Kiralık') && (
                    <p className="text-sm text-gray-500">Aylık</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Açıklama</h3>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">İlan Detayları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Details */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brüt Alan:</span>
                    <span className="font-medium">{listing.grossArea} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Alan:</span>
                    <span className="font-medium">{listing.netArea} m²</span>
                  </div>
                  {listing.roomType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Oda Sayısı:</span>
                      <span className="font-medium">{listing.roomType}</span>
                    </div>
                  )}
                  {listing.floor && listing.totalFloors && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kat:</span>
                      <span className="font-medium">{listing.floor}/{listing.totalFloors}</span>
                    </div>
                  )}
                  {listing.buildingAge && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Yapı Yaşı:</span>
                      <span className="font-medium">{listing.buildingAge} yıl</span>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  {listing.heatingType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Isıtma:</span>
                      <span className="font-medium">{listing.heatingType}</span>
                    </div>
                  )}
                  {listing.parkingType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Otopark:</span>
                      <span className="font-medium">{listing.parkingType}</span>
                    </div>
                  )}
                  {listing.creditEligible && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Krediye Uygun:</span>
                      <span className="font-medium">{listing.creditEligible}</span>
                    </div>
                  )}
                  {listing.deedType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tapu Durumu:</span>
                      <span className="font-medium">{listing.deedType}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">İlan Tarihi:</span>
                    <span className="font-medium">{formatDate(listing.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              {(listing.hasBalcony || listing.hasElevator || listing.isFurnished || listing.isInComplex) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Özellikler</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {listing.hasBalcony && (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Balkonlu</span>
                      </div>
                    )}
                    {listing.hasElevator && (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Asansörlü</span>
                      </div>
                    )}
                    {listing.isFurnished && (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Eşyalı</span>
                      </div>
                    )}
                    {listing.isInComplex && (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Sitede</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">İletişim</h3>
              
              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-vera-600 mb-2">{formatPrice(listing.price)}</p>
                  {listing.type.includes('Kiralık') && (
                    <p className="text-sm text-gray-500">Aylık kira bedeli</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href="tel:+905422414541"
                  className="w-full inline-flex items-center justify-center rounded-md bg-vera-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-vera-700 focus:outline-none focus:ring-2 focus:ring-vera-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Hemen Ara
                </a>
                
                <a
                  href="mailto:info@veragrup.com?subject=İlan Hakkında Bilgi Talebi&body=Merhaba, ${listing.title} ilanı hakkında bilgi almak istiyorum."
                  className="w-full inline-flex items-center justify-center rounded-md bg-white px-4 py-3 text-base font-medium text-vera-600 shadow-sm ring-1 ring-vera-600 hover:bg-vera-50 focus:outline-none focus:ring-2 focus:ring-vera-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  E-posta Gönder
                </a>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Paylaş</h4>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: listing.title,
                          text: listing.description,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link kopyalandı!');
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <ShareIcon className="h-4 w-4 mr-1" />
                    Paylaş
                  </button>
                </div>
              </div>

              {/* Property Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Özet Bilgiler</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tip:</span>
                    <span className="font-medium">{listing.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alan:</span>
                    <span className="font-medium">{listing.grossArea} m²</span>
                  </div>
                  {listing.roomType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Oda:</span>
                      <span className="font-medium">{listing.roomType}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Konum:</span>
                    <span className="font-medium">{listing.district}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Benzer İlanlar
            {listing && (
              <span className="text-base font-normal text-gray-600 ml-2">
                ({listing.type} kategorisinden)
              </span>
            )}
          </h2>
          
          {similarLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vera-600"></div>
              <span className="ml-2 text-gray-500">Benzer ilanlar yükleniyor...</span>
            </div>
          ) : similarListings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Benzer İlan Bulunamadı</h3>
              <p className="text-gray-600 mb-4">
                {listing?.type} kategorisinde başka ilan bulunmuyor.
              </p>
              <button
                onClick={() => router.push('/ilanlar')}
                className="inline-flex items-center rounded-md bg-vera-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-vera-700"
              >
                Tüm İlanları Görüntüle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarListings.map((similarListing) => (
                <div
                  key={similarListing.id}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-200"
                  onClick={() => router.push(`/ilanlar/${similarListing.id}`)}
                >
                  {/* Image Section */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    {similarListing.images && similarListing.images.length > 0 ? (
                      <img 
                        src={getImageSrc(similarListing.images[0])} 
                        alt={similarListing.title}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <HomeIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Property Type Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-vera-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {similarListing.type}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    {/* Price */}
                    <div className="mb-3">
                      <div className="text-xl font-bold text-vera-600">
                        {formatPrice(similarListing.price)}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {similarListing.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {similarListing.neighborhood}, {similarListing.district}
                      </span>
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="text-center bg-gray-50 rounded-lg p-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {similarListing.grossArea}
                        </div>
                        <div className="text-xs text-gray-500">m² Alan</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {similarListing.roomType || '-'}
                        </div>
                        <div className="text-xs text-gray-500">Oda</div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      className="w-full bg-vera-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-vera-700 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/ilanlar/${similarListing.id}`);
                      }}
                    >
                      Detayları Gör
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Show More Button */}
          {similarListings.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push(`/ilanlar?type=${encodeURIComponent(listing?.type || '')}`)}
                className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-vera-600 shadow-sm ring-1 ring-vera-600 hover:bg-vera-50 transition-colors duration-200"
              >
                {listing?.type} Kategorisindeki Tüm İlanları Gör
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Image Gallery */}
      {isModalOpen && listing && listing.images && listing.images.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-black rounded-lg max-w-6xl w-full max-h-screen overflow-hidden">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-lg font-medium">{listing.title}</h3>
                    <p className="text-sm opacity-75">{modalImageIndex + 1} / {listing.images.length}</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Main Image */}
              <div className="relative flex items-center justify-center min-h-[400px] max-h-[80vh]">
                <img 
                  src={getImageSrc(listing.images[modalImageIndex])} 
                  alt={`${listing.title} - ${modalImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Navigation Arrows */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setModalImageIndex(modalImageIndex === 0 ? listing.images.length - 1 : modalImageIndex - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setModalImageIndex(modalImageIndex === listing.images.length - 1 ? 0 : modalImageIndex + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {listing.images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <div className="flex space-x-2 overflow-x-auto justify-center">
                    {listing.images.map((image, index) => (
                      <div 
                        key={index} 
                        className={`flex-shrink-0 w-16 h-16 bg-gray-800 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                          index === modalImageIndex ? 'border-white ring-2 ring-white/50' : 'border-transparent hover:border-white/50'
                        }`}
                        onClick={() => setModalImageIndex(index)}
                      >
                        <img 
                          src={getImageSrc(image)} 
                          alt={`${listing.title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyboard Instructions */}
              <div className="absolute bottom-20 right-4 text-white/75 text-xs">
                <p>← → ok tuşları ile gezinin</p>
                <p>ESC ile kapat</p>
              </div>
            </div>
                     </div>
         </div>
       )}

       {/* Structured Data for Property */}
       {listing && (
         <>
           <StructuredData 
             type="product"
             data={{
               name: listing.title,
               description: listing.description,
               price: listing.price,
               images: listing.images?.map(img => `https://veragayrimenkul.com${img}`) || [],
               features: [
                 { name: "Brüt Alan", value: `${listing.grossArea} m²` },
                 { name: "Net Alan", value: `${listing.netArea} m²` },
                 { name: "Konum", value: `${listing.neighborhood}, ${listing.district}, ${listing.city}` },
                 { name: "Tip", value: listing.type },
                 ...(listing.roomType ? [{ name: "Oda Sayısı", value: listing.roomType }] : []),
                 ...(listing.floor && listing.totalFloors ? [{ name: "Kat", value: `${listing.floor}/${listing.totalFloors}` }] : []),
               ]
             }}
           />
           
           <StructuredData 
             type="breadcrumb"
             data={{
               items: [
                 { name: "Ana Sayfa", url: "https://veragayrimenkul.com" },
                 { name: "İlanlar", url: "https://veragayrimenkul.com/ilanlar" },
                 { name: listing.title, url: `https://veragayrimenkul.com/ilanlar/${listing.id}` }
               ]
             }}
           />
         </>
       )}
    </div>
  );
} 