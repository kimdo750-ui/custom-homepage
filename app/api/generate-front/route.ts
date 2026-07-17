import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createCanvas, loadImage } from 'canvas';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

export const config = {
  maxDuration: 60,
};

export async function POST(request: NextRequest) {
  let tempImagePath = '';

  try {
    const bodyText = await request.text();
    let body: any = {};
    if (bodyText) {
      try {
        body = JSON.parse(bodyText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }
    }

    const { name, birthYear, zodiac } = body;

    if (!name || !birthYear || !zodiac) {
      return NextResponse.json(
        { error: '필수 정보를 모두 입력해주세요' },
        { status: 400 }
      );
    }

    console.log('앞면 생성:', { name, birthYear, zodiac });

    // 띠그림 로드
    const zodiacName = zodiac?.replace(/띠$/, '') || '';
    const zodiacImagePath = join(process.cwd(), 'public', 'zodiac', `${zodiacName}.png`);

    if (!existsSync(zodiacImagePath)) {
      throw new Error(`띠그림 파일을 찾을 수 없습니다: ${zodiacName}.png`);
    }

    // Canvas 생성 (600x480)
    const canvas = createCanvas(600, 480);
    const ctx = canvas.getContext('2d');

    // 배경을 투명하게 (투명한 배경)
    ctx.clearRect(0, 0, 600, 480);

    // 띠그림 로드 및 그리기
    const zodiacImage = await loadImage(zodiacImagePath);
    ctx.drawImage(zodiacImage, 150, 100, 300, 300);

    // 텍스트 설정
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';

    // 출생년도 그리기
    ctx.font = 'bold 40px "Noto Sans KR", Arial';
    ctx.fillText(`${birthYear}년생`, 300, 50);

    // 이름 그리기
    ctx.font = 'bold 58px "Noto Sans KR", Arial';
    ctx.fillText(name, 300, 450);

    // PNG로 변환
    const pngBuffer = canvas.toBuffer('image/png');
    tempImagePath = join(tmpdir(), `front_${Date.now()}.png`);
    writeFileSync(tempImagePath, pngBuffer);

    console.log('PNG 생성 완료');

    // Remove.bg API로 배경 제거
    if (REMOVEBG_API_KEY) {
      try {
        const formData = new FormData();
        formData.append('image_file', new Blob([pngBuffer]), 'front.png');
        formData.append('size', 'auto');
        formData.append('type', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': REMOVEBG_API_KEY,
          },
          body: formData,
        });

        if (response.ok) {
          const bgRemovedBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(bgRemovedBuffer).toString('base64');
          const imageUrl = `data:image/png;base64,${base64}`;

          console.log('앞면 생성 완료 (배경 제거됨)');

          return NextResponse.json({
            imageUrl,
            type: 'front',
            name,
            birthYear,
            zodiac,
            bgRemoved: true,
          });
        } else {
          console.warn('Remove.bg API 실패, 원본 이미지 반환');
        }
      } catch (bgError) {
        console.warn('배경 제거 중 오류:', bgError);
      }
    }

    // 배경 제거 없이 반환
    const base64 = pngBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log('앞면 생성 완료');

    return NextResponse.json({
      imageUrl,
      type: 'front',
      name,
      birthYear,
      zodiac,
      bgRemoved: false,
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: '앞면 디자인 생성 실패: ' + errorMsg },
      { status: 500 }
    );
  } finally {
    // 임시 파일 정리
    try {
      if (tempImagePath && existsSync(tempImagePath)) unlinkSync(tempImagePath);
    } catch (e) {
      console.warn('파일 정리 실패:', tempImagePath);
    }
  }
}
