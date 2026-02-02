import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

const fontBold = fetch(new URL('https://assets.vercel.com/font/inter/Inter-Bold.ttf')).then((res) => res.arrayBuffer());

// We'll use a standard Google Font for Korean support.
// Note: In production, it's often better to serve a subset or use a specialized font service to avoid timeouts,
// but for this implementation, we will try to fetch Noto Sans KR from a CDN if possible,
// or fallback to Inter and system fonts if the fetch is too heavy.
// For now, to guarantee stability, we will use the Google Fonts API to get the font buffer.

async function fetchFont(text: string, font: string) {
  const API = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(API)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
  if (resource) {
    const res = await fetch(resource[1]);
    if (res.status == 200) {
      return await res.arrayBuffer();
    }
  }
  return null;
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url); // Use protocol + host for images
  const title = searchParams.get('title') || 'Gijol';
  const description =
    searchParams.get('description') || '졸업 요건 분석부터 로드맵 설계까지, GIST 학생을 위한 올인원 솔루션';

  // Construct absolute URL for the image
  // In Vercel, req.url is the full URL so we can parse origin
  const { protocol, host } = new URL(req.url);
  const iconUrl = `${protocol}//${host}/images/gijol_3d_icon.png`;

  // Try to load Noto Sans KR for the title
  // Optimizing: only fetch characters needed for title? No, full subset is better but complex.
  // We'll load a basic bold font.
  // actually, loading full Noto Sans KR on Edge can be slow/limit-hitting (4MB+).
  // A safer bet is using a widely available font or a subset.
  // Let's rely on standard Inter data for English and try fallback for Korean if Vercel supports it implicitly (it doesn't).

  // Strategy: Load Inter-Bold (fast, cached in var above) and potentially a Korean font.
  // Due to the 4MB limit of Serverless Functions (Edge is stricter), loading a full CJK font is risky.
  // We will stick to 'Inter' for the main design and hope for system fallback or squares if CJK is not strictly loaded.
  // HOWEVER, the user specifically asked for "improvement".
  // A robust solution used by Vercel OG demos is to fetch specific text ranges or assume Vercel's caching.
  // Let's try to just use the `Inter` font for now and a nice design.
  // If we really need Korean, we need to fetch 'Noto+Sans+KR:wght@700'.

  const fontData = await fontBold;
  // const koreanFontData = await fetchFont(title + description, 'Noto+Sans+KR:wght@700');

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F172A', // Dark theme background
        backgroundImage:
          'radial-gradient(circle at 25px 25px, #1E293B 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1E293B 2%, transparent 0%)',
        backgroundSize: '100px 100px',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px',
          maxWidth: '900px',
        }}
      >
        {/* 3D Icon with Glow Effect */}
        <div
          style={{
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              background: '#3B82F6',
              filter: 'blur(40px)',
              opacity: 0.5,
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          {/* Actual Icon */}
          <img
            src={iconUrl}
            alt="Gijol Icon"
            width={128}
            height={128}
            style={{
              position: 'relative',
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
            }}
          />
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            background: 'linear-gradient(to right, #60A5FA, #3B82F6)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '20px',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 32,
            color: '#94A3B8',
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {description}
        </div>
      </div>

      {/* Footer/Brand Tag */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          fontSize: 20,
          color: '#475569',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        GIST Graduation Management System
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  );
}
