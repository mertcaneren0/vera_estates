'use client';

import { useState, useEffect } from 'react';
import { MapPinIcon, HomeIcon, CalendarIcon, MagnifyingGlassIcon, FunnelIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import StructuredData from "@/components/SEO/StructuredData";

// Bu component client-side olduğu için metadata'yı layout.tsx'te tanımladık

interface Listing {
  id: number;
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
  zoningType?: string;
  businessType?: string;
  images: string[];
  createdAt: string;
}

export default function IlanlarPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  const propertyTypes = [
    'Satılık Daire',
    'Kiralık Daire', 
    'Satılık Arsa',
    'Tarla',
    'Satılık İş Yeri',
    'Kiralık İş Yeri'
  ];

  // Fetch listings
  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings');
      const result = await response.json();
      if (result.success) {
        setListings(result.data);
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Filter listings
  const filteredListings = listings.filter(listing => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !selectedType || listing.type === selectedType;
    const matchesCity = !selectedCity || listing.city === selectedCity;
    
    const price = parseInt(listing.price);
    const minPrice = priceRange.min ? parseInt(priceRange.min) : 0;
    const maxPrice = priceRange.max ? parseInt(priceRange.max) : Infinity;
    const matchesPrice = price >= minPrice && price <= maxPrice;

    return matchesSearch && matchesType && matchesCity && matchesPrice;
  });

  // Get unique cities
  const cities = [...new Set(listings.map(listing => listing.city))];

  // Format price
  const formatPrice = (price: string) => {
    const num = parseInt(price);
    return `${num.toLocaleString('tr-TR')} ₺`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 gün önce';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return date.toLocaleDateString('tr-TR');
  };

  // Get property icon
  const getPropertyIcon = (type: string) => {
    if (type.includes('Daire')) {
      return <HomeIcon className="h-5 w-5" />;
    }
    return <HomeIcon className="h-5 w-5" />;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-vera-600 via-vera-700 to-vera-800 py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Gayrimenkul İlanları
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200">
              Size en uygun gayrimenkul seçeneklerini keşfedin.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">

        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="İlan başlığı, açıklama, şehir, ilçe veya mahalle ile arayın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vera-600 focus:border-vera-600 sm:text-sm"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredListings.length} ilan bulundu
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vera-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filtrele
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Property Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Emlak Tipi
                  </label>
                  <select
                    id="type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vera-600 focus:ring-vera-600 sm:text-sm"
                  >
                    <option value="">Tümü</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Şehir
                  </label>
                  <select
                    id="city"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vera-600 focus:ring-vera-600 sm:text-sm"
                  >
                    <option value="">Tümü</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Min Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="0"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vera-600 focus:ring-vera-600 sm:text-sm"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="Sınırsız"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-vera-600 focus:ring-vera-600 sm:text-sm"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedType('');
                    setSelectedCity('');
                    setPriceRange({ min: '', max: '' });
                    setSearchTerm('');
                  }}
                  className="text-sm text-vera-600 hover:text-vera-800"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Listings Grid - Dark Theme Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vera-600"></div>
            <span className="ml-2 text-gray-500">İlanlar yükleniyor...</span>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">İlan bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              {listings.length === 0 
                ? "Henüz ilan eklenmemiş. Admin panelinden ilan ekleyebilirsiniz."
                : "Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-200"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="relative w-full md:w-80 aspect-[4/3] overflow-hidden flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
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
                    
                    {/* Prime Pick Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                        <StarIcon className="h-4 w-4 mr-1" />
                        Öne Çıkan
                      </div>
                    </div>

                    {/* Property Type Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-vera-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {listing.type}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <div className="h-full flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {listing.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {listing.description}
                        </p>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-6">
                          <MapPinIcon className="h-5 w-5 mr-2 text-vera-600" />
                          <span className="text-base">
                            {listing.neighborhood}, {listing.district}, {listing.city}
                          </span>
                        </div>

                        {/* Property Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-xl font-bold text-gray-900">
                              {listing.grossArea}
                            </div>
                            <div className="text-sm text-gray-500">m² Alan</div>
                          </div>
                          <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-xl font-bold text-gray-900">
                              {listing.roomType || '-'}
                            </div>
                            <div className="text-sm text-gray-500">Oda</div>
                          </div>
                          <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-xl font-bold text-gray-900">
                              {listing.floor || '-'}
                            </div>
                            <div className="text-sm text-gray-500">Kat</div>
                          </div>
                          <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-xl font-bold text-gray-900">
                              {listing.buildingAge || '-'}
                            </div>
                            <div className="text-sm text-gray-500">Yaş</div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                          {/* Price */}
                          <div className="text-3xl font-bold text-vera-600 mb-1">
                            {formatPrice(listing.price)}
                          </div>
                          <div className="text-sm text-gray-500">Liste Fiyatı</div>
                        </div>

                        <div className="flex flex-col md:items-end space-y-3">
                          {/* Agent and Date */}
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="font-medium">Vera Gayrimenkul</span>
                            <span className="mx-2">•</span>
                            <span>{formatDate(listing.createdAt)}</span>
                          </div>

                          {/* Action Button */}
                          <a
                            href={`/ilanlar/${listing.id}`}
                            className="inline-flex items-center justify-center bg-vera-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-vera-700 transition-colors duration-200 group-hover:bg-vera-700"
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            Detayları Gör
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        {!loading && filteredListings.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Aradığınız Gayrimenkulü Bulamadınız mı?
              </h3>
              <p className="text-gray-600 mb-6">
                Uzman ekibimiz size özel seçenekler sunmak için hazır. İhtiyaçlarınızı paylaşın, size en uygun fırsatları getirelim.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/iletisim"
                  className="inline-flex items-center justify-center rounded-md bg-vera-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-vera-700 focus:outline-none focus:ring-2 focus:ring-vera-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  İletişime Geçin
                </a>
                <a
                  href="/hizmetler"
                  className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-base font-medium text-vera-600 shadow-sm ring-1 ring-vera-600 hover:bg-vera-50 focus:outline-none focus:ring-2 focus:ring-vera-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Hizmetlerimizi İnceleyin
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 