import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

// 프리셋 명언 매핑
const phraseImages: Record<string, string> = {
  '사랑은 모든것을 이긴다': '/phrases/love_001.png',
  '사랑이 없는곳에 사랑을 심어라': '/phrases/love_002.png',
  '사랑은 주는것이다': '/phrases/love_003.png',
  '우정은 영혼과 영혼의 만남이다': '/phrases/friendship_001.png',
};

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    // 공백 제거 후 확인
    const normalizedText = text.replace(/\s+/g, '');
    let filePath = phraseImages[text];

    if (!filePath) {
      const matchedKey = Object.keys(phraseImages).find(
        key => key.replace(/\s+/g, '') === normalizedText
      );
      if (matchedKey) {
        filePath = phraseImages[matchedKey];
      }
    }

    if (!filePath) {
      return NextResponse.json(
        { error: '프리셋 이미지를 찾을 수 없습니다', text },
        { status: 404 }
      );
    }

    console.log('명언 이미지 처리:', text, filePath);

    const imageAbsPath = join(process.cwd(), 'public', filePath.replace(/^\//, ''));

    if (!existsSync(imageAbsPath)) {
      return NextResponse.json(
        { error: '이미지 파일을 찾을 수 없습니다', filePath },
        { status: 404 }
      );
    }

    const resultBuffer = readFileSync(imageAbsPath);

    // Remove.bg API로 배경 제거 (타임아웃 설정)
    if (REMOVEBG_API_KEY) {
      try {
        const formData = new FormData();
        formData.append('image_file', new Blob([resultBuffer]), 'phrase.png');
        formData.append('size', 'auto');
        formData.append('type', 'auto');
        formData.append('format', 'auto');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': REMOVEBG_API_KEY,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const bgRemovedBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(bgRemovedBuffer).toString('base64');
          const imageUrl = `data:image/png;base64,${base64}`;

          console.log('명언 이미지 배경 제거 완료');

          return NextResponse.json({
            imageUrl,
            cached: false,
            text,
            type: 'preset',
            bgRemoved: true,
          });
        } else {
          console.warn('Remove.bg API 실패 (상태:', response.status, '), 원본 반환');
        }
      } catch (bgError) {
        console.warn('배경 제거 중 오류:', bgError);
      }
    }

    // 배경 제거 실패 시 원본 반환
    const base64 = resultBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      imageUrl,
      cached: false,
      text,
      type: 'preset',
      bgRemoved: false,
    });

  } catch (error) {
    console.error('에러:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: '이미지 처리 실패',
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}
