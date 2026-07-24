import { NextRequest, NextResponse } from 'next/server';

// 사용자별 생성된 카드뉴스 내보내기
// 사용자 ID와 카드뉴스 ID로 ZIP 또는 이미지 반환

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const format = searchParams.get('format') || 'zip'; // zip | images | preview

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }

    console.log(`📸 카드뉴스 내보내기: userId=${userId}, format=${format}`);

    // 현재는 생성 상태만 반환
    // 실제 구현: 생성된 이미지 ZIP 제공
    return NextResponse.json({
      status: 'generating',
      message: '카드뉴스가 준비 중입니다',
      userId,
      format,
      estimatedTime: '2-3분',
      downloadUrl: `/api/card-news/download?userId=${userId}`,
    });
  } catch (error) {
    console.error('❌ 카드뉴스 내보내기 실패:', error);
    return NextResponse.json(
      { error: '카드뉴스 내보내기 실패' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, cards, title } = body;

    if (!userId || !cards) {
      return NextResponse.json(
        { error: '필수 파라미터 부족' },
        { status: 400 }
      );
    }

    console.log(`🎨 카드뉴스 생성 요청: ${title} (${cards.length}장)`);

    // 카드뉴스 생성 시작 (백그라운드)
    // 실제 구현: html2canvas로 PNG 생성, JSZip으로 묶기

    return NextResponse.json({
      status: 'queued',
      message: '카드뉴스 생성이 시작되었습니다',
      jobId: `card-${Date.now()}`,
      estimatedTime: '2-3분',
    });
  } catch (error) {
    console.error('❌ 카드뉴스 생성 실패:', error);
    return NextResponse.json(
      { error: '카드뉴스 생성 실패' },
      { status: 500 }
    );
  }
}
