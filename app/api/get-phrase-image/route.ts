import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

// 파일명 매핑
const phraseFiles: Record<string, string> = {
  '사랑은 모든것을 이긴다': 'love_001.png',
  '사랑은 주는것이다': 'love_002.png',
  '사랑이 없는곳에 사랑을 심어라': 'love_003.png',
  '우정은 영혼과 영혼의 만남이다': 'friendship_001.png',
};

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    // 파일명 찾기
    let filename = phraseFiles[text];
    if (!filename) {
      return NextResponse.json(
        { error: '선택한 명언 이미지를 찾을 수 없습니다', text },
        { status: 404 }
      );
    }

    console.log('명언 이미지 로드:', { text, filename });

    // 파일 읽기
    const filepath = join(process.cwd(), 'public', 'phrases', filename);
    const imageBuffer = readFileSync(filepath);

    // Remove.bg API로 배경 제거
    if (REMOVEBG_API_KEY) {
      console.log('Remove.bg API로 배경 제거 시작:', filename);
      try {
        const bgFormData = new FormData();
        bgFormData.append('image_file', new Blob([imageBuffer], { type: 'image/png' }), filename);
        bgFormData.append('size', 'auto');
        bgFormData.append('type', 'product');

        const bgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': REMOVEBG_API_KEY,
          },
          body: bgFormData,
        });

        console.log('Remove.bg 응답 상태:', bgResponse.status);

        if (bgResponse.ok) {
          const bgRemovedBuffer = await bgResponse.arrayBuffer();
          const base64 = Buffer.from(bgRemovedBuffer).toString('base64');
          const imageUrl = `data:image/png;base64,${base64}`;

          console.log('명언 이미지 배경 제거 완료 ✅');

          return NextResponse.json({
            imageUrl,
            text,
            type: 'preset',
            bgRemoved: true,
          });
        } else {
          const errorText = await bgResponse.text();
          console.warn('Remove.bg API 오류:', bgResponse.status, errorText);
        }
      } catch (bgError) {
        console.warn('배경 제거 실패, 원본 사용:', bgError);
      }
    } else {
      console.warn('REMOVEBG_API_KEY가 설정되지 않았습니다');
    }

    // 배경 제거 실패 또는 API 키 없으면 원본 사용
    const base64 = imageBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log('명언 이미지 원본 사용 (배경 제거 미적용)');

    return NextResponse.json({
      imageUrl,
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
