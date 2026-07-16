import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// 프리셋 명언 매핑
const phraseImages: Record<string, string> = {
  '사랑은 모든것을 이긴다': '/phrases/love_001.png',
  '사랑이 없는곳에 사랑을 심어라': '/phrases/love_002.png',
  '사랑은 주는것이다': '/phrases/love_003.png',
  '성공은 준비와 기회의 만남이다': '/phrases/success_001.png',
  '우정은 영혼과 영혼의 만남이다': '/phrases/friendship_001.png',
  '하면 된다': '/phrases/challenge_001.png',
};

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];

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

    // 배경 제거
    const outputPath = join(tmpdir(), `phrase_${Date.now()}.png`);
    tempFiles.push(outputPath);

    const pythonScript = join(process.cwd(), 'scripts', 'remove_bg.py');

    console.log('배경 제거 중...');
    const { stdout } = await execFileAsync('python', [
      pythonScript,
      imageAbsPath,
      outputPath,
    ]);

    console.log('배경 제거 완료');

    // 결과 읽기
    const resultBuffer = readFileSync(outputPath);
    const base64 = resultBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      imageUrl,
      cached: false,
      text,
      type: 'preset',
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
  } finally {
    tempFiles.forEach((file) => {
      try {
        if (existsSync(file)) unlinkSync(file);
      } catch (e) {
        console.warn('파일 정리 실패:', file);
      }
    });
  }
}
