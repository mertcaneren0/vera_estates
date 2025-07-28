interface StructuredDataProps {
  type: 'organization' | 'localBusiness' | 'product' | 'article' | 'breadcrumb' | 'faq'
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
    }

    switch (type) {
      case 'organization':
        return {
          ...baseSchema,
          '@type': 'Organization',
          name: data.name || 'Vera Gayrimenkul',
          url: data.url || 'https://veragayrimenkul.com',
          logo: data.logo || 'https://veragayrimenkul.com/logo.png',
          description: data.description || 'Profesyonel gayrimenkul değerleme, analiz ve danışmanlık hizmetleri',
          foundingDate: data.foundingDate || '2019',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'TR',
            addressLocality: data.city || 'İstanbul',
            streetAddress: data.address || '',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: data.phone || '+90-542-241-4541',
            contactType: 'customer service',
            availableLanguage: 'Turkish',
          },
          sameAs: data.socialMedia || [],
          aggregateRating: data.rating && {
            '@type': 'AggregateRating',
            ratingValue: data.rating.value,
            reviewCount: data.rating.count,
          },
        }

      case 'localBusiness':
        return {
          ...baseSchema,
          '@type': 'RealEstateAgent',
          name: data.name || 'Vera Gayrimenkul',
          url: data.url || 'https://veragayrimenkul.com',
          image: data.image || 'https://veragayrimenkul.com/logo.png',
          description: data.description || 'Gayrimenkul değerleme ve danışmanlık hizmetleri',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'TR',
            addressLocality: data.city || 'İstanbul',
            streetAddress: data.address || '',
          },
          geo: data.coordinates && {
            '@type': 'GeoCoordinates',
            latitude: data.coordinates.lat,
            longitude: data.coordinates.lng,
          },
          telephone: data.phone || '+90-542-241-4541',
          email: data.email || 'info@veragrup.com',
          priceRange: data.priceRange || '$$',
          openingHours: data.hours || 'Mo-Fr 09:00-18:00',
          serviceArea: {
            '@type': 'AdministrativeArea',
            name: data.serviceArea || 'İstanbul',
          },
        }

      case 'product':
        return {
          ...baseSchema,
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.images || [],
          brand: {
            '@type': 'Brand',
            name: 'Vera Gayrimenkul',
          },
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'TRY',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: 'Vera Gayrimenkul',
            },
          },
          additionalProperty: data.features?.map((feature: any) => ({
            '@type': 'PropertyValue',
            name: feature.name,
            value: feature.value,
          })) || [],
        }

      case 'breadcrumb':
        return {
          ...baseSchema,
          '@type': 'BreadcrumbList',
          itemListElement: data.items?.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })) || [],
        }

      case 'faq':
        return {
          ...baseSchema,
          '@type': 'FAQPage',
          mainEntity: data.questions?.map((qa: any) => ({
            '@type': 'Question',
            name: qa.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: qa.answer,
            },
          })) || [],
        }

      default:
        return baseSchema
    }
  }

  const schema = generateSchema()

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
} 