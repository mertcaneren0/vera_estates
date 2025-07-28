import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://veragayrimenkul.com' // Gerçek domain ile değiştirin

  // Statik sayfalar - Lüleburgaz odaklı SEO için daha yüksek priority
  const staticPages = [
    { page: '', priority: 1.0, changeFreq: 'daily' as const },
    { page: '/ilanlar', priority: 0.9, changeFreq: 'daily' as const },
    { page: '/iletisim', priority: 0.8, changeFreq: 'weekly' as const },
    { page: '/hizmetler/degerleme', priority: 0.8, changeFreq: 'weekly' as const },
    { page: '/hizmetler/danismanlik', priority: 0.8, changeFreq: 'weekly' as const },
    { page: '/hizmetler/analiz', priority: 0.8, changeFreq: 'weekly' as const },
    { page: '/ekibimiz', priority: 0.7, changeFreq: 'monthly' as const },
    { page: '/kariyer', priority: 0.6, changeFreq: 'monthly' as const },
    { page: '/referanslar', priority: 0.7, changeFreq: 'weekly' as const },
    { page: '/kurumsal/vera-gayrimenkul', priority: 0.7, changeFreq: 'monthly' as const },
    { page: '/kurumsal/vera-grup', priority: 0.6, changeFreq: 'monthly' as const },
    { page: '/kurumsal/kvkk', priority: 0.5, changeFreq: 'yearly' as const },
    { page: '/kurumsal/hizmet-politikasi', priority: 0.5, changeFreq: 'yearly' as const },
  ]

  const sitemap: MetadataRoute.Sitemap = staticPages.map(({ page, priority, changeFreq }) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority: priority,
  }))

  // Dinamik ilanlar için sitemap ekleme (production'da çalışacak)
  try {
    // Production'da çalışması için environment check
    if (process.env.NODE_ENV === 'production') {
      const response = await fetch(`${baseUrl}/api/listings`, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          result.data.forEach((listing: any) => {
            sitemap.push({
              url: `${baseUrl}/ilanlar/${listing.id}`,
              lastModified: new Date(listing.createdAt),
              changeFrequency: 'weekly',
              priority: 0.8, // İlanlar yüksek priority - önemli content
            });
          });
        }
      }
    }
  } catch (error) {
    console.error('Sitemap için ilanlar yüklenirken hata:', error);
    // Hata durumunda da statik sitemap'i döndür
  }

  return sitemap
} 