import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

const DEFAULT_TITLE = 'Anchor: Anxiety Navigator | Immediate Panic Attack Relief';
const DEFAULT_DESCRIPTION =
  'Free anxiety relief app with 7-step panic de-escalation, 24/7 AI support, and privacy-first design. Evidence-based techniques for immediate relief during panic attacks.';
const DEFAULT_IMAGE = '/og-image.png';
const SITE_URL = 'https://getanchor.app';

/**
 * SEO component using react-helmet-async
 * Manages meta tags for each page
 */
export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MobileApplication',
          name: 'Anchor: Your Anxiety Buddy',
          operatingSystem: 'iOS, Android',
          applicationCategory: 'HealthApplication',
          description: DEFAULT_DESCRIPTION,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '100',
          },
        })}
      </script>
    </Helmet>
  );
}
