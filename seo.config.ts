// Base URL for the application - dynamically set based on environment
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gijol.vercel.app';

export const SEO = {
  titleTemplate: '%s | Gijol',
  defaultTitle: 'Gijol - 졸업 관리 시스템',
  description:
    'GIST 학부생을 위한 졸업 요건 분석 및 로드맵 관리 플랫폼. 성적표 업로드 하나로 졸업까지의 여정을 관리하세요.',
  canonical: BASE_URL,
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: BASE_URL,
    title: 'Gijol - 졸업 관리 시스템',
    description: '성적표 업로드로 졸업요건 분석, 맞춤형 수강 추천, 강의 로드맵까지. GIST 학생들을 위한 필수 서비스.',
    siteName: 'Gijol',
    images: [
      {
        url: `${BASE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: 'Gijol - 졸업 관리 시스템',
      },
    ],
  },
  twitter: {
    handle: '@gijol',
    site: '@gijol',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    { name: 'application-name', content: 'Gijol' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'Gijol' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'mobile-web-app-capable', content: 'yes' },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.svg',
      type: 'image/svg+xml',
    },
    {
      rel: 'icon',
      href: '/favicon-32x32.png',
      sizes: '32x32',
      type: 'image/png',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
  ],
};
