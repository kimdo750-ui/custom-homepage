import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

export const config = {
  maxDuration: 120,
};

export async function POST(request: NextRequest) {
  let inputPath = '';
  let outputPath = '';

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image_file') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다' },
        { status: 400 }
      );
    }

    console.log('배경 제거 시작:', {
      fileName: imageFile.name,
      fileType: imageFile.type,
      fileSize: imageFile.size,
    });

    // 파일을 임시 디렉토리에 저장
    const imageBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    inputPath = join(tmpdir(), `input_${Date.now()}.tmp`);
    outputPath = join(tmpdir(), `output_${Date.now()}.png`);

    writeFileSync(inputPath, buffer);
    console.log('임시 파일 저장:', inputPath);

    // Python 스크립트 실행
    console.log('Python 스크립트 실행 중...');
    const pythonScript = join(process.cwd(), 'scripts', 'remove_bg.py');

    try {
      const { stdout, stderr } = await execFileAsync('python', [
        pythonScript,
        inputPath,
        outputPath,
      ]);

      console.log('Python 실행 결과:', stdout);

      if (stderr) {
        console.warn('Python 경고:', stderr);
      }

      // 결과 이미지 읽기
      const resultBuffer = readFileSync(outputPath);
      console.log('결과 이미지 읽음, 크기:', resultBuffer.length);

      // base64로 인코딩
      const base64 = resultBuffer.toString('base64');
      const imageUrl = `data:image/png;base64,${base64}`;

      return NextResponse.json({ imageUrl });
    } catch (execError: any) {
      console.error('Python 실행 에러:', execError.message);
      throw new Error(`Python 실행 실패: ${execError.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : '배경 제거 중 오류 발생';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    // 임시 파일 정리
    try {
      if (inputPath) unlinkSync(inputPath);
      if (outputPath) unlinkSync(outputPath);
    } catch (e) {
      console.warn('임시 파일 정리 실패:', e);
    }
  }
}
