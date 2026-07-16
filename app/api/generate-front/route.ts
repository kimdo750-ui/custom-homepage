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
    const bodyText = await request.text();
    console.log('Raw body text:', bodyText);

    let body: any = {};
    if (bodyText) {
      try {
        body = JSON.parse(bodyText);
        console.log('JSON parse success, body keys:', Object.keys(body));
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'bodyText length:', bodyText.length);
      }
    }
    console.log('Parsed body:', body);

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
    console.log('Zodiac name after replace:', zodiacName);
    const zodiacImagePath = join(process.cwd(), 'public', 'zodiac', `${zodiacName}.png`);
    console.log('Zodiac image path:', zodiacImagePath, 'exists:', existsSync(zodiacImagePath));

    if (!existsSync(zodiacImagePath)) {
      throw new Error(`띠그림 파일을 찾을 수 없습니다: ${zodiacName}.png`);
    }

    // 띠그림 배경 제거 (한글 경로 문제 해결)
    const pythonScript = join(process.cwd(), 'scripts', 'remove_bg.py');
    const zodiacTempInputPath = join(tmpdir(), `zodiac_input_${Date.now()}.png`);
    const zodiacTempOutputPath = join(tmpdir(), `zodiac_output_${Date.now()}.png`);
    tempFiles.push(zodiacTempInputPath, zodiacTempOutputPath);

    // 띠그림을 임시 영문 경로로 복사
    const zodiacBuffer = readFileSync(zodiacImagePath);
    writeFileSync(zodiacTempInputPath, zodiacBuffer);
    console.log('띠그림 임시 저장 완료');

    // 배경 제거
    try {
      await execFileAsync('python', [
        pythonScript,
        zodiacTempInputPath,
        zodiacTempOutputPath,
      ]);
      console.log('띠그림 배경 제거 완료');
    } catch (error) {
      console.error('띠그림 배경 제거 실패:', error);
      throw error;
    }

    // 배경 제거된 띠그림 로드
    const zodiacImageBuffer = readFileSync(zodiacTempOutputPath);
    const zodiacBase64 = zodiacImageBuffer.toString('base64');
    console.log('띠그림 로드 완료');

    // SVG 생성 (띠그림 포함, 흰색 배경, 글자는 검정색 고정)
    const svgContent = `<svg width="600" height="480" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="480" fill="white"/>
  <text x="300" y="50" font-family="Noto Sans KR, sans-serif" font-size="40" font-weight="700" text-anchor="middle" fill="#1a1a1a">${birthYear}년생</text>
  <image x="150" y="100" width="300" height="300" href="data:image/png;base64,${zodiacBase64}"/>
  <text x="300" y="450" font-family="Noto Sans KR, sans-serif" font-size="58" font-weight="700" text-anchor="middle" fill="#1a1a1a">${name}</text>
</svg>`;

    const svgPath = join(tmpdir(), `front_${Date.now()}.svg`);
    const pngPath = join(tmpdir(), `front_png_${Date.now()}.png`);
    const outputPath = join(tmpdir(), `front_bg_removed_${Date.now()}.png`);

    tempFiles.push(svgPath, pngPath, outputPath);

    writeFileSync(svgPath, svgContent);
    console.log('SVG 생성 완료');

    // SVG → PNG 변환
    await sharp(svgPath, { density: 150 })
      .png()
      .toFile(pngPath);

    console.log('PNG 변환 완료');

    // 배경 제거 (최종 이미지에서 텍스트 배경 처리)
    const { stdout } = await execFileAsync('python', [
      pythonScript,
      pngPath,
      outputPath,
    ]);

    console.log('배경 제거 완료:', stdout);

    // 결과 반환
    const resultBuffer = readFileSync(outputPath);
    const base64 = resultBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log('앞면 생성 완료');

    return NextResponse.json({
      imageUrl,
      type: 'front',
      name,
      birthYear,
      zodiac,
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
    tempFiles.forEach((file) => {
      try {
        if (existsSync(file)) unlinkSync(file);
      } catch (e) {
        console.warn('파일 정리 실패:', file);
      }
    });
  }
}
