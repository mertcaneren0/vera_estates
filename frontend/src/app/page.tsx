'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import ListingApplicationForm from "@/components/ListingApplicationForm";
import StructuredData from "@/components/SEO/StructuredData";
import { HomeIcon, MapPinIcon, EyeIcon } from '@heroicons/react/24/outline';

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

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest 6 listings for homepage
  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings');
      const result = await response.json();
      if (result.success && result.data) {
        // Sort by creation date (newest first) and get only the latest 6 listings
        const latestSixListings = result.data
          .sort((a: Listing, b: Listing) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6);
        
        console.log(`Ana sayfada gösterilen ilan sayısı: ${latestSixListings.length}`);
        setListings(latestSixListings);
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

  // Format price
  const formatPrice = (price: string) => {
    const num = parseInt(price);
    return `${num.toLocaleString('tr-TR')} ₺`;
  };
  return (
    <div className="bg-gradient-to-br from-gray-100 to-white">
      {/* Hero Section - Enhanced */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-vera-50/20" style={{width: "100%", height: "100vh"}}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/1.jpg')",
            filter: "brightness(0.25)"
          }}
        />
        {/* Enhanced Overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-vera-900/90 via-vera-800/80 to-vera-700/60" />
        
        <div className="mx-auto max-w-7xl h-full flex items-center justify-start lg:px-8">
          <div className="px-6 lg:px-0 flex items-center justify-start w-full h-full">
            <div className="ml-0 mr-auto max-w-4xl text-left pl-8 lg:pl-16">
              <div className="max-w-4xl">
                <div className="mb-6">
                  <p className="text-lg font-semibold text-vera-yellow-400 uppercase tracking-wider">
                    Yatırımlarınızdaki Çözüm Ortağınız
                  </p>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
                  VERA GAYRİMENKUL
                </h1>
                <p className="mt-6 text-base leading-7 text-gray-200 font-light sm:mt-8 sm:text-xl sm:leading-8">
                  Gayrimenkul sektöründe uzman kadromuz ve güvenilir hizmet anlayışımızla, yatırım hedeflerinize ulaşmanız için en doğru çözümleri sunuyoruz. Profesyonel danışmanlık hizmetimizle yanınızdayız.
                </p>
                <div className="mt-8 flex flex-col items-start gap-4 sm:mt-12 sm:flex-row sm:items-center sm:justify-start sm:gap-x-8">
                  <Link
                    href="/ilanlar"
                    className="rounded-corporate bg-vera-600 px-6 py-3 text-sm font-semibold text-white shadow-corporate-lg hover:bg-vera-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vera-600 transition-all duration-300 sm:px-8 sm:py-4 sm:text-base"
                  >
                    İlanları Görüntüle
                  </Link>
                  <Link 
                    href="/iletisim" 
                    className="text-sm font-semibold leading-6 text-white hover:text-vera-yellow-400 transition-colors duration-300 sm:text-base"
                  >
                    Bize Ulaşın <span aria-hidden="true" className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İstatistikler Section - Enhanced */}
      <div className="bg-gradient-to-br from-vera-600 via-vera-700 to-vera-800 py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Rakamlarla Vera Gayrimenkul: Güveninizin Teminatı
              </h2>
              <p className="mt-6 text-xl leading-8 text-vera-100 font-light">
                Yılların deneyimi ve müşteri memnuniyeti odaklı yaklaşımımızla sektörde öncü konumdayız
              </p>
            </div>
            <dl className="mt-20 grid grid-cols-1 gap-6 overflow-hidden rounded-corporate-lg text-center sm:grid-cols-2 lg:grid-cols-4 bg-white/10 backdrop-blur-sm">
              <div className="flex flex-col bg-white/10 p-10 backdrop-blur-sm border border-white/20">
                <dt className="text-base font-semibold leading-6 text-vera-100">Memnun Yatırımcı</dt>
                <dd className="order-first text-4xl font-bold tracking-tight text-white">500+</dd>
              </div>
              <div className="flex flex-col bg-white/10 p-10 backdrop-blur-sm border border-white/20">
                <dt className="text-base font-semibold leading-6 text-vera-100">Portföy ve İlan</dt>
                <dd className="order-first text-4xl font-bold tracking-tight text-white">1000+</dd>
              </div>
              <div className="flex flex-col bg-white/10 p-10 backdrop-blur-sm border border-white/20">
                <dt className="text-base font-semibold leading-6 text-vera-100">Yıllık Deneyim</dt>
                <dd className="order-first text-4xl font-bold tracking-tight text-white">5+</dd>
              </div>
              <div className="flex flex-col bg-white/10 p-10 backdrop-blur-sm border border-white/20">
                <dt className="text-base font-semibold leading-6 text-vera-100">Referans</dt>
                <dd className="order-first text-4xl font-bold tracking-tight text-white">50+</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Son İlanlar Section - New */}
      <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-white py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              En Son Eklenen İlanlar
            </h2>
            <p className="mt-6 text-xl leading-8 text-gray-600 font-light">
              Son eklenen 6 gayrimenkul ilanımızı inceleyin ve fırsatları kaçırmayın
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vera-600"></div>
              <span className="ml-2 text-gray-500">İlanlar yükleniyor...</span>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz ilan bulunmuyor</h3>
              <p className="mt-1 text-sm text-gray-500">
                Yakında yeni ilanlar eklenecek.
              </p>
            </div>
          ) : (
            <>
              <div className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-8 sm:mt-24 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      {listing.images && listing.images.length > 0 ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <div className="absolute top-3 left-3">
                        <div className="bg-vera-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {listing.type}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      {/* Price */}
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-vera-600">
                          {formatPrice(listing.price)}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                        {listing.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {listing.neighborhood}, {listing.district}, {listing.city}
                        </span>
                      </div>

                      {/* Property Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {listing.grossArea}
                          </div>
                          <div className="text-xs text-gray-500">m² Alan</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {listing.roomType || '-'}
                          </div>
                          <div className="text-xs text-gray-500">Oda</div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Link
                        href={`/ilanlar/${listing.id}`}
                        className="w-full bg-vera-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-vera-700 transition-colors duration-200 flex items-center justify-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Detayları Gör
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Listings Button */}
              <div className="mt-16 text-center">
                <Link
                  href="/ilanlar"
                  className="inline-flex items-center justify-center rounded-md bg-vera-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-vera-700 focus:outline-none focus:ring-2 focus:ring-vera-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Tüm İlanları Görüntüle
                  <span aria-hidden="true" className="ml-2">→</span>
                </Link>
                <p className="mt-3 text-sm text-gray-500">
                  Daha fazla ilan için tüm ilanlar sayfasını ziyaret edin
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Güven Göstergeleri Section - Enhanced */}
      <div className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-32 sm:py-40 overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-gradient-to-tr from-vera-50/10 via-transparent to-vera-100/10"></div>
        <div className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Neden Bizi Tercih Ediyorlar?
            </h2>
            <p className="mt-6 text-xl leading-8 text-gray-600 font-light">
              Güvenilir hizmet anlayışımız ve uzman kadromuzla sektörde öncü konumdayız
            </p>
          </div>
          
          {/* Müşteri Yorumları - Enhanced */}
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-8 sm:mt-24 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col justify-between rounded-corporate-lg bg-gradient-to-br from-gray-50 to-white p-10 shadow-corporate-lg ring-1 ring-gray-200/50 hover:shadow-corporate-xl transition-all duration-300">
              <div className="flex items-center gap-x-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-vera-600 to-vera-700 rounded-full flex items-center justify-center shadow-corporate">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Ahmet Yılmaz</h4>
                  <p className="text-sm text-vera-600 font-medium">Yatırımcı</p>
                </div>
              </div>
              <blockquote className="text-base leading-7 text-gray-600 font-light">
                "Vera Gayrimenkul'ün profesyonel yaklaşımı ve detaylı analizleri sayesinde doğru yatırım kararı aldım. Kesinlikle tavsiye ederim."
              </blockquote>
            </div>

            <div className="flex flex-col justify-between rounded-corporate-lg bg-gradient-to-br from-gray-50 to-white p-10 shadow-corporate-lg ring-1 ring-gray-200/50 hover:shadow-corporate-xl transition-all duration-300">
              <div className="flex items-center gap-x-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-vera-600 to-vera-700 rounded-full flex items-center justify-center shadow-corporate">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Fatma Demir</h4>
                  <p className="text-sm text-vera-600 font-medium">Kurumsal Müşteri</p>
                </div>
              </div>
              <blockquote className="text-base leading-7 text-gray-600 font-light">
                "Şirketimizin gayrimenkul portföyünün değerlemesi için tercih ettiğimiz Vera Gayrimenkul, beklentilerimizin üzerinde hizmet sundu."
              </blockquote>
            </div>

            <div className="flex flex-col justify-between rounded-corporate-lg bg-gradient-to-br from-gray-50 to-white p-10 shadow-corporate-lg ring-1 ring-gray-200/50 hover:shadow-corporate-xl transition-all duration-300">
              <div className="flex items-center gap-x-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-vera-600 to-vera-700 rounded-full flex items-center justify-center shadow-corporate">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Mehmet Kaya</h4>
                  <p className="text-sm text-vera-600 font-medium">Emlak Yatırımcısı</p>
                </div>
              </div>
              <blockquote className="text-base leading-7 text-gray-600 font-light">
                "5 yıldır birlikte çalışıyoruz. Her zaman güvenilir, şeffaf ve profesyonel hizmet aldım."
              </blockquote>
            </div>
          </div>

          

          {/* Ekip İstatistikleri - Enhanced */}
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-8 sm:mt-24 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            <div className="text-center group">
              <div className="text-4xl font-bold text-vera-600 group-hover:text-vera-700 transition-colors duration-300">15+</div>
              <div className="text-base text-gray-600 font-medium mt-2">Ortalama Deneyim Yılı</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold text-vera-600 group-hover:text-vera-700 transition-colors duration-300">100%</div>
              <div className="text-base text-gray-600 font-medium mt-2">Lisanslı Uzman</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold text-vera-600 group-hover:text-vera-700 transition-colors duration-300">50+</div>
              <div className="text-base text-gray-600 font-medium mt-2">Tamamlanan Proje</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold text-vera-600 group-hover:text-vera-700 transition-colors duration-300">24/7</div>
              <div className="text-base text-gray-600 font-medium mt-2">Müşteri Desteği</div>
            </div>
          </div>

          
        </div>
        </div>
      </div>

      {/* 3'lü Blok Section - Enhanced */}
      <div className="bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50 py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Vera Grup Şirketleri</h2>
          <p className="mt-6 text-xl leading-8 text-gray-600 font-light">
            Gayrimenkul sektöründe entegre çözümler sunan grup şirketlerimizle, yatırımlarınızda başarıya ulaşmanız için kapsamlı hizmetler sunuyoruz.
          </p>
        </div>
        <div className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-8 sm:mt-24 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Vera Gayrimenkul - Enhanced */}
          <div className="flex flex-col justify-between rounded-corporate-lg bg-gradient-to-br from-white to-gray-50 p-10 shadow-corporate-lg ring-1 ring-gray-200/50 hover:shadow-corporate-xl transition-all duration-300">
            <div>
              <h3 className="text-2xl font-semibold leading-8 text-gray-900">Vera Gayrimenkul</h3>
              <p className="mt-6 text-base leading-7 text-gray-600 font-light">
                Gayrimenkul değerleme, danışmanlık ve analiz hizmetleri ile yatırım kararlarınızda güvenilir çözüm ortağınız. Uzman kadromuzla en doğru yatırım fırsatlarını sunuyoruz.
              </p>
            </div>
            <Link
              href="/kurumsal/vera-gayrimenkul"
              className="mt-10 text-base font-semibold leading-6 text-vera-600 hover:text-vera-500 transition-colors duration-300"
            >
              Detaylı Bilgi <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>

          {/* Vera İnşaat - Enhanced */}
          <div className="flex flex-col justify-between rounded-corporate-lg bg-gradient-to-br from-white to-gray-50 p-10 shadow-corporate-lg ring-1 ring-gray-200/50 hover:shadow-corporate-xl transition-all duration-300">
            <div>
              <h3 className="text-2xl font-semibold leading-8 text-gray-900">Vera İnşaat</h3>
              <p className="mt-6 text-base leading-7 text-gray-600 font-light">
                Yarınlara değer katan yapı çözümleri sunar. Modern mimari ve kaliteli inşaat hizmetleriyle projelerinizi hayata geçiriyoruz.
              </p>
            </div>
          </div>

          {/* Vera Grup - Enhanced */}
          <div className="flex flex-col justify-between rounded-corporate-lg bg-gradient-to-br from-white to-gray-50 p-10 shadow-corporate-lg ring-1 ring-gray-200/50 hover:shadow-corporate-xl transition-all duration-300">
            <div>
              <h3 className="text-2xl font-semibold leading-8 text-gray-900">Vera Grup</h3>
              <p className="mt-6 text-base leading-7 text-gray-600 font-light">
                Gayrimenkul sektöründe entegre çözümler sunan holding yapımızla, yatırımdan pazarlamaya kadar tüm süreçlerde yanınızdayız.
              </p>
            </div>
            <Link
              href="/kurumsal/vera-grup"
              className="mt-10 text-base font-semibold leading-6 text-vera-600 hover:text-vera-500 transition-colors duration-300"
            >
              Detaylı Bilgi <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Hizmetlerimiz Section - Enhanced */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Hizmetlerimiz</h2>
            <p className="mt-6 text-xl leading-8 text-gray-600 font-light">
              Gayrimenkul yatırımlarınızda ihtiyaç duyacağınız tüm profesyonel hizmetleri tek çatı altında sunuyoruz
            </p>
          </div>
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-8 sm:mt-24 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {/* Değerleme - Enhanced */}
            <div className="flex flex-col justify-between rounded-corporate-lg bg-gradient-to-br from-white to-gray-50 p-10 shadow-corporate-lg ring-1 ring-gray-200/50 hover:shadow-corporate-xl transition-all duration-300">
              <div>
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-vera-100 to-vera-200 rounded-corporate mb-6 shadow-corporate">
                  <svg className="w-8 h-8 text-vera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold leading-8 text-gray-900">Değerleme</h3>
                <p className="mt-6 text-base leading-7 text-gray-600 font-light">
                  Lisanslı eksperlerimizle gayrimenkulünüzün gerçek piyasa değerini belirliyor, yatırım kararlarınızda size rehberlik ediyoruz.
                </p>
              </div>
              <Link
                href="/hizmetler/degerleme"
                className="mt-10 text-base font-semibold leading-6 text-vera-600 hover:text-vera-500 transition-colors duration-300"
              >
                Detaylı Bilgi <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>

            {/* Danışmanlık - Enhanced */}
            <div className="flex flex-col justify-between rounded-corporate-lg bg-gradient-to-br from-white to-gray-50 p-10 shadow-corporate-lg ring-1 ring-gray-200/50 hover:shadow-corporate-xl transition-all duration-300">
              <div>
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-vera-100 to-vera-200 rounded-corporate mb-6 shadow-corporate">
                  <svg className="w-8 h-8 text-vera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold leading-8 text-gray-900">Danışmanlık</h3>
                <p className="mt-6 text-base leading-7 text-gray-600 font-light">
                  Gayrimenkul yatırımlarında doğru kararlar alabilmeniz için uzman kadromuzla kapsamlı danışmanlık hizmeti sunuyoruz.
                </p>
              </div>
              <Link
                href="/hizmetler/danismanlik"
                className="mt-10 text-base font-semibold leading-6 text-vera-600 hover:text-vera-500 transition-colors duration-300"
              >
                Detaylı Bilgi <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>

            {/* Analiz - Enhanced */}
            <div className="flex flex-col justify-between rounded-corporate-lg bg-gradient-to-br from-white to-gray-50 p-10 shadow-corporate-lg ring-1 ring-gray-200/50 hover:shadow-corporate-xl transition-all duration-300">
              <div>
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-vera-100 to-vera-200 rounded-corporate mb-6 shadow-corporate">
                  <svg className="w-8 h-8 text-vera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold leading-8 text-gray-900">Analiz</h3>
                <p className="mt-6 text-base leading-7 text-gray-600 font-light">
                  Piyasa analizi, yatırım analizi ve risk değerlendirmesi ile gayrimenkul yatırımlarınızda en doğru stratejileri belirliyoruz.
                </p>
              </div>
              <Link
                href="/hizmetler/analiz"
                className="mt-10 text-base font-semibold leading-6 text-vera-600 hover:text-vera-500 transition-colors duration-300"
              >
                Detaylı Bilgi <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* İlan Verme Formu ve Yönlendirme - Enhanced */}
      <div className="bg-gradient-to-br from-gray-200 via-gray-100 to-white py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-12 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {/* İlan Verme Formu */}
            <ListingApplicationForm />

            {/* Mevcut İlanlara Yönlendirme - Enhanced */}
            <div className="rounded-corporate-lg bg-gradient-to-br from-white to-gray-50 p-10 shadow-corporate-lg ring-1 ring-gray-200/50">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Mevcut İlanlar</h2>
              <p className="mt-6 text-base leading-7 text-gray-600 font-light">
                Satılık ve kiralık gayrimenkul ilanlarımızı inceleyin.
              </p>
              <div className="mt-10 space-y-6">
                <Link
                  href="/ilanlar?type=satilik"
                  className="block rounded-corporate bg-gradient-to-br from-gray-50 to-white p-8 text-center hover:shadow-corporate-lg transition-all duration-300 border border-gray-200/50"
                >
                  <h3 className="text-xl font-semibold text-gray-900">Satılık İlanlar</h3>
                  <p className="mt-3 text-base text-gray-600 font-light">Satılık gayrimenkul fırsatlarını keşfedin</p>
                </Link>
                <Link
                  href="/ilanlar?type=kiralik"
                  className="block rounded-corporate bg-gradient-to-br from-gray-50 to-white p-8 text-center hover:shadow-corporate-lg transition-all duration-300 border border-gray-200/50"
                >
                  <h3 className="text-xl font-semibold text-gray-900">Kiralık İlanlar</h3>
                  <p className="mt-3 text-base text-gray-600 font-light">Kiralık gayrimenkul seçeneklerini inceleyin</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data for Local SEO */}
      <StructuredData 
        type="organization"
        data={{
          name: "Vera Gayrimenkul",
          alternateName: "Vera Grup Gayrimenkul",
          url: "https://veragayrimenkul.com",
          logo: "https://veragayrimenkul.com/logo.png",
          description: "Lüleburgaz merkezli gayrimenkul firması. Emlak değerleme, satış, kiralama ve yatırım danışmanlığı hizmetleri. Kırklareli ve çevre illerde uzman hizmet.",
          foundingDate: "2019",
          address: {
            streetAddress: "İnönü Mahallesi Murat Hüdavendigar Caddesi No: 112 / 1A",
            addressLocality: "Lüleburgaz",
            addressRegion: "Kırklareli",
            postalCode: "39750",
            addressCountry: "TR"
          },
          phone: "+90-542-241-4541",
          email: "info@veragrup.com",
          areaServed: [
            "Lüleburgaz",
            "Kırklareli", 
            "Tekirdağ",
            "Edirne",
            "Çorlu",
            "Babaeski",
            "Marmara Bölgesi"
          ],
          socialMedia: [
            "https://www.linkedin.com/company/vera-gayrimenkul",
            "https://www.instagram.com/veragayrimenkul"
          ],
          keywords: "lüleburgaz gayrimenkul, vera gayrimenkul, kırklareli emlak, gayrimenkul değerleme lüleburgaz",
          priceRange: "₺₺",
          serviceArea: {
            geoRadius: "50",
            geoMidpoint: {
              latitude: "41.401926595091744",
              longitude: "27.357004176957318"
            }
          }
        }}
      />
      
      <StructuredData 
        type="localBusiness"
        data={{
          name: "Vera Gayrimenkul",
          url: "https://veragayrimenkul.com",
          image: "https://veragayrimenkul.com/logo.png",
          description: "Gayrimenkul değerleme, analiz ve danışmanlık hizmetleri",
          city: "İstanbul",
          phone: "+90-542-241-4541",
          email: "info@veragrup.com",
          hours: "Mo-Fr 09:00-18:00",
          serviceArea: "İstanbul"
        }}
      />
    </div>
  );
}
