import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

// 한글 폰트(Noto Sans KR)와 영문 폰트(Inter)를 가져오는 헬퍼 함수
async function fetchFont(text: string, font: string) {
  const API = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(API)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const res = await fetch(resource[1]);
    if (res.status === 200) {
      return await res.arrayBuffer();
    }
  }
  throw new Error('Failed to load font data');
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // 기본 문구 설정 (수정된 요구사항 반영)
  const title = searchParams.get('title') || 'Gijol';
  const description = searchParams.get('description') || 'GIST 졸업관리 플랫폼';

  // 1. 이미지 절대 경로 생성
  const { protocol, host } = new URL(req.url);
  const iconUrl = `${protocol}//${host}/images/gijol_3d_icon.png`;

  // 2. 폰트 데이터 로딩 (한글 지원을 위해 필수)
  // Inter는 영문/숫자용, Noto Sans KR은 한글용으로 합성하여 사용하거나
  // 간단하게 Noto Sans KR 하나만 써도 됩니다. 여기서는 Noto Sans KR Bold를 메인으로 씁니다.
  // 2. 폰트 데이터 로딩
  // 에이투지체 (AtoZ Font) 로컬 파일 로딩
  // Vercel Edge Runtime에서는 public 폴더 접근 시 절대 경로(URL)를 사용해야 함
  const fontDataRegular = await fetch(new URL(`${protocol}//${host}/fonts/에이투지체-4Regular.ttf`)).then((res) =>
    res.arrayBuffer(),
  );
  const fontDataBold = await fetch(new URL(`${protocol}//${host}/fonts/에이투지체-7Bold.ttf`)).then((res) =>
    res.arrayBuffer(),
  );

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0B0C0E', // 단색 배경으로 변경
        fontFamily: '"AtoZ", sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
        }}
      >
        {/* 아이콘 영역 (불필요한 배경/후광 제거) */}
        <div style={{ display: 'flex' }}>
          <img
            src={iconUrl}
            alt="Gijol Icon"
            width={180}
            height={180}
            style={{
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
            }}
          />
        </div>

        {/* 텍스트 영역 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          {/* 타이틀 단색 일단 유지하되 깔끔하게 */}
          <div
            style={{
              fontSize: 70, // 크기 축소 (j 잘림 방지)
              fontWeight: 700,
              background: 'linear-gradient(to bottom right, #ffffff 30%, #94a3b8 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '10px',
              letterSpacing: '-0.03em',
              lineHeight: 1.2, // 줄 간격 확보
            }}
          >
            {title}
          </div>

          {/* 설명 문구 */}
          <div
            style={{
              fontSize: 34,
              color: '#94A3B8',
              lineHeight: 1.5,
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            {description}
          </div>
        </div>
      </div>

      {/* 하단 브랜드 태그 */}
      <div
        style={{
          position: 'absolute',
          bottom: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: '#cbd5e1',
            fontWeight: 600,
            letterSpacing: '0.05em',
            padding: '10px 24px',
            border: '1px solid #334155', // 테두리 추가
            borderRadius: '9999px', // 둥근 테두리 유지
            backgroundColor: 'rgba(30, 41, 59, 0.5)', // 반투명 배경 유지
          }}
        >
          ✨ 졸업까지의 모든 여정을 한눈에 관리하세요
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'AtoZ',
          data: fontDataRegular,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'AtoZ',
          data: fontDataBold,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  );
}
