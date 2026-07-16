import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

export const config = {
  maxDuration: 60,
};

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

  try {
    const body: any = await request.json();
    console.log('Received body:', body);

    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: '텍스트를 입력해주세요' },
        { status: 400 }
      );
    }

    console.log('뒷면 생성:', { text });

    // SVG 생성 (흰색 배경)
    const svgContent = `<svg width="600" height="480" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="480" fill="white"/>

  <circle cx="300" cy="80" r="40" fill="none" stroke="#e74c3c" stroke-width="2" opacity="0.4"/>
  <circle cx="300" cy="80" r="32" fill="none" stroke="#e74c3c" stroke-width="1" opacity="0.3"/>

  <text x="300" y="260" font-family="Noto Serif KR, serif" font-size="64" font-weight="700" text-anchor="middle" fill="#e74c3c" style="font-style: italic; letter-spacing: 3px;">${text.substring(0, 15)}</text>

  <line x1="100" y1="320" x2="500" y2="320" stroke="#e74c3c" stroke-width="2" opacity="0.4"/>
</svg>`;

    const svgPath = join(tmpdir(), `back_${Date.now()}.svg`);
    const pngPath = join(tmpdir(), `back_${Date.now()}.png`);
    const outputPath = join(tmpdir(), `back_bg_removed_${Date.now()}.png`);

    tempFiles.push(svgPath, pngPath, outputPath);

    writeFileSync(svgPath, svgContent);
    console.log('뒷면 SVG 생성 완료');

    // SVG → PNG 변환
    await sharp(svgPath, { density: 150 })
      .png()
      .toFile(pngPath);

    console.log('PNG 변환 완료');

    // 배경 제거 (흰색 배경만 제거)
    const pythonScript = join(process.cwd(), 'scripts', 'remove_bg.py');
    const { stdout } = await execFileAsync('python', [
      pythonScript,
      pngPath,
      outputPath,
    ]);

    console.log('배경 제거 완료:', stdout);

    // 결과 이미지 읽기
    const resultBuffer = readFileSync(outputPath);
    const base64 = resultBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log('뒷면 생성 완료');

    return NextResponse.json({
      imageUrl,
      type: 'back',
      text,
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: '뒷면 디자인 생성 실패: ' + errorMsg },
      { status: 500 }
    );
  } finally {
    // 임시 파일 정리
    tempFiles.forEach((file) => {
      try {
        if (existsSync(file)) unlinkSync(file);
      } catch (e) {
        console.warn('파일 정리 실패:', file);
      }
    });
  }
}
