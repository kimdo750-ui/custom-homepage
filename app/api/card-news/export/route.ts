import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

// 메모리 기반 카드뉴스 저장소
interface StoredCardNews {
  id: string;
  userId: number;
  title: string;
  images: Blob[];
  timestamp: number;
  expiresAt: number; // 1시간 후 삭제
}

const cardNewsStore = new Map<string, StoredCardNews>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const format = searchParams.get('format') || 'zip';

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId가 필요합니다' },
        { status: 400 }
      );
    }

    const stored = cardNewsStore.get(jobId);

    if (!stored) {
      return NextResponse.json(
        { status: 'processing', message: '카드뉴스 생성 중...' },
        { status: 202 }
      );
    }

    console.log(`📸 카드뉴스 조회: jobId=${jobId}, format=${format}`);

    if (format === 'zip') {
      // ZIP으로 모든 이미지 번들링
      const zip = new JSZip();
      stored.images.forEach((blob, idx) => {
        zip.file(`card-${String(idx + 1).padStart(2, '0')}.png`, blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      return new NextResponse(zipBlob, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${stored.title}.zip"`,
        },
      });
    }

    // preview: 첫 번째 이미지만 반환
    return new NextResponse(stored.images[0], {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="preview.png"`,
      },
    });
  } catch (error) {
    console.error('❌ 카드뉴스 다운로드 실패:', error);
    return NextResponse.json(
      { error: '카드뉴스 다운로드 실패' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, images, title } = body;

    if (!userId || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: '필수 파라미터 부족: userId, images 필요' },
        { status: 400 }
      );
    }

    const jobId = `card-${Date.now()}`;
    const expiresAt = Date.now() + 3600000; // 1시간 후 만료

    // 이미지 Blob으로 변환
    const imageBlobs = await Promise.all(
      images.map((imgData: string) => {
        // Base64 또는 data URL로 받은 이미지를 Blob으로 변환
        if (typeof imgData === 'string') {
          const dataUrl = imgData.startsWith('data:') ? imgData : `data:image/png;base64,${imgData}`;
          return fetch(dataUrl).then((r) => r.blob());
        }
        return Promise.resolve(imgData);
      })
    );

    cardNewsStore.set(jobId, {
      id: jobId,
      userId,
      title: title || `카드뉴스-${new Date().toLocaleString('ko-KR')}`,
      images: imageBlobs,
      timestamp: Date.now(),
      expiresAt,
    });

    console.log(`🎨 카드뉴스 저장: ${jobId} (${imageBlobs.length}장)`);

    // 만료된 항목 정리
    for (const [key, value] of cardNewsStore.entries()) {
      if (value.expiresAt < Date.now()) {
        cardNewsStore.delete(key);
      }
    }

    return NextResponse.json({
      status: 'success',
      jobId,
      message: '카드뉴스 생성 완료',
      downloadUrl: `/api/card-news/export?jobId=${jobId}&format=zip`,
      previewUrl: `/api/card-news/export?jobId=${jobId}&format=preview`,
      cardsCount: imageBlobs.length,
    });
  } catch (error) {
    console.error('❌ 카드뉴스 생성 실패:', error);
    return NextResponse.json(
      { error: '카드뉴스 생성 실패' },
      { status: 500 }
    );
  }
}
