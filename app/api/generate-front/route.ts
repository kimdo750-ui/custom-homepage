import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createCanvas, loadImage, registerFont } from 'canvas';

const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

export const maxDuration = 60;

// 붓글씨 글꼴 등록 시도
try {
  // Windows 시스템 글꼴 경로 (붓글씨 글자체)
  const fontPaths = [
    'C:\\Windows\\Fonts\\gungsuh.ttf',     // 궁서
    'C:\\Windows\\Fonts\\gungsuhcje.ttf',  // 궁서체
    'C:\\Windows\\Fonts\\hmjingga.ttf',    // 함초롱 고딕
  ];

  for (const fontPath of fontPaths) {
    if (existsSync(fontPath)) {
      let fontName = 'Gungsuh';
      if (fontPath.includes('gungsuhcje')) fontName = 'Gungsuh Che';
      if (fontPath.includes('hmjingga')) fontName = 'HM Jingga';

      try {
        registerFont(fontPath, { family: fontName });
        console.log(`붓글씨 글꼴 등록 성공: ${fontName} - ${fontPath}`);
        break;
      } catch (e) {
        console.log(`글꼴 등록 실패: ${fontPath}`);
      }
    }
  }
} catch (e) {
  console.log('글꼴 등록 오류:', e);
}

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

    console.log('zodiac:', zodiac);
    console.log('zodiacName:', zodiacName);
    console.log('zodiacImagePath:', zodiacImagePath);
    console.log('File exists:', existsSync(zodiacImagePath));

    if (!existsSync(zodiacImagePath)) {
      throw new Error(`띠그림 파일을 찾을 수 없습니다: ${zodiacName}.png (경로: ${zodiacImagePath})`);
    }

    // Canvas 생성 (1200x960 - 2배 크기)
    console.log('Canvas 생성 시작...');
    const canvas = createCanvas(1200, 960);
    const ctx = canvas.getContext('2d');
    console.log('Canvas 생성 완료');

    // 배경을 흰색으로
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1200, 960);
    console.log('배경 그리기 완료');

    // 띠그림 로드 및 그리기 (2배) - Buffer로 읽어서 인코딩 문제 해결
    console.log('띠그림 로드 시작:', zodiacImagePath);
    console.log('파일 실제 존재 확인:', existsSync(zodiacImagePath));

    let zodiacImage;
    try {
      // 파일을 Buffer로 읽음 (한글 파일명 인코딩 문제 해결)
      const imageBuffer = readFileSync(zodiacImagePath);
      zodiacImage = await loadImage(imageBuffer);
      console.log('띠그림 로드 완료, 크기:', zodiacImage.width, 'x', zodiacImage.height);
    } catch (imageError) {
      console.error('이미지 로드 상세 오류:', imageError);
      throw new Error(`이미지 로드 실패 (${zodiacName}.png): ${imageError}`);
    }

    ctx.drawImage(zodiacImage, 240, 120, 720, 720);
    console.log('띠그림 그리기 완료');

    // 텍스트 설정 (검은색)
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';

    // 출생년도 그리기 (기본 시스템 글꼴)
    ctx.font = 'bold 120px serif';
    try {
      ctx.fillText(`${birthYear}`, 600, 110);
      console.log('출생년도 텍스트 렌더링 성공:', birthYear);
    } catch (e) {
      console.error('출생년도 렌더링 오류:', e);
    }

    // 이름 그리기 (기본 시스템 글꼴)
    ctx.font = 'bold 160px serif';
    try {
      ctx.fillText(name, 600, 950);
      console.log('이름 텍스트 렌더링 성공:', name);
    } catch (e) {
      console.error('이름 렌더링 오류:', e);
    }

    // PNG로 변환
    const pngBuffer = canvas.toBuffer('image/png');

    console.log('PNG 생성 완료');

    // Remove.bg API로 배경 제거
    if (REMOVEBG_API_KEY) {
      try {
        const formData = new FormData();
        formData.append('image_file', new Blob([pngBuffer]), 'front.png');
        formData.append('size', 'auto');
        formData.append('type', 'product');

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
          console.warn('Remove.bg API 실패');
        }
      } catch (bgError) {
        console.warn('배경 제거 중 오류:', bgError);
      }
    }

    // 배경 제거 실패 시 원본 반환
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
