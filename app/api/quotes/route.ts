import { NextResponse } from 'next/server';

// 캐싱 (메모리)
let cachedQuotes: any = null;

interface Quote {
  text: string;
  source: string;
  chars?: string;
  featured?: boolean;
}

interface QuotesData {
  love: Quote[];
  friend: Quote[];
  success: Quote[];
  challenge: Quote[];
  happy: Quote[];
  memory: Quote[];
  [key: string]: Quote[];
}

async function fetchAndParseQuotes(): Promise<QuotesData> {
  try {
    const response = await fetch('https://kimdo750-ui.github.io/nyk/quotes.html');
    const html = await response.text();

    // <script> 태그에서 DATA 객체 추출
    const scriptMatch = html.match(/const\s+DATA\s*=\s*(\{[\s\S]*?\n\s*\})\s*;/);

    if (!scriptMatch) {
      console.error('DATA object not found in HTML');
      return getDefaultQuotes();
    }

    const dataStr = scriptMatch[1];

    // eval 대신 간단한 파싱 (안전성)
    // JSON.parse 시도
    try {
      // JavaScript 객체를 JSON으로 변환 (간단한 방식)
      const jsonStr = dataStr
        .replace(/'/g, '"')  // 싱글 쿼트를 더블 쿼트로
        .replace(/(\w+):/g, '"$1":')  // 키 quotes 처리
        .replace(/,\s*}/g, '}')  // trailing comma 제거
        .replace(/,\s*]/g, ']');  // trailing comma 제거

      const data = JSON.parse(jsonStr);
      return data;
    } catch (parseError) {
      console.warn('JSON parse failed, using regex extraction');
      // 정규식으로 배열 추출 (fallback)
      return extractQuotesWithRegex(dataStr);
    }
  } catch (error) {
    console.error('Failed to fetch quotes:', error);
    return getDefaultQuotes();
  }
}

function extractQuotesWithRegex(dataStr: string): QuotesData {
  const result: QuotesData = {
    love: [],
    friend: [],
    success: [],
    challenge: [],
    happy: [],
    memory: [],
  };

  // 간단한 추출 (각 카테고리별 배열 찾기)
  const categories = ['love', 'friend', 'success', 'challenge', 'happy', 'memory'];

  for (const cat of categories) {
    const pattern = new RegExp(`${cat}:\\s*\\[(.*?)\\](?=,|\\})`);
    const match = dataStr.match(pattern);

    if (match) {
      // 간단한 방식: text만 추출
      const textMatches = match[1].match(/text:"([^"]+)"/g);
      if (textMatches) {
        result[cat] = textMatches.map((t) => ({
          text: t.replace(/text:"/, '').replace(/"/, ''),
          source: '',
        }));
      }
    }
  }

  return result;
}

function getDefaultQuotes(): QuotesData {
  return {
    love: [
      { text: '사랑은 모든 것을 이긴다', source: '베르길리우스' },
    ],
    friend: [
      { text: '우정은 영혼의 나침반', source: '셰익스피어' },
    ],
    success: [
      { text: '성공은 노력의 결과', source: '명언' },
    ],
    challenge: [
      { text: '도전하지 않으면 성공도 없다', source: '명언' },
    ],
    happy: [
      { text: '행복은 마음가짐에서 온다', source: '명언' },
    ],
    memory: [
      { text: '추억은 인생의 보물', source: '명언' },
    ],
  };
}

export async function GET() {
  try {
    // 캐시 확인
    if (!cachedQuotes) {
      cachedQuotes = await fetchAndParseQuotes();
    }

    // 프리셋 명언 목록
    const presetQuotes = [
      '사랑은 모든 것을 이긴다',
      '성공은 준비와 기회의 만남이다',
      '우정은 영혼과 영혼의 만남이다',
      '하면 된다',
    ];

    // 카테고리별로 일부만 반환 (최대 8개)
    const simplified = Object.entries(cachedQuotes).reduce(
      (acc, [key, quotes]: [string, any]) => {
        acc[key] = (quotes || []).slice(0, 8).map((q: Quote) => ({
          text: q.text,
          source: q.source || '',
          isPreset: presetQuotes.includes(q.text),
        }));
        return acc;
      },
      {} as Record<string, { text: string; source: string; isPreset: boolean }[]>
    );

    return NextResponse.json({
      quotes: simplified,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Quotes API error:', error);
    return NextResponse.json(
      {
        error: '명언 데이터 로드 실패',
        quotes: getDefaultQuotes(),
      },
      { status: 500 }
    );
  }
}
