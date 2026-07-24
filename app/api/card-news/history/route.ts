import { NextRequest, NextResponse } from 'next/server';
import { getGeneratedCardNews } from '@/lib/telegram/bot';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId가 필요합니다' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId, 10);
    const cardNewsHistory = getGeneratedCardNews(userIdNum);

    console.log(`📸 카드뉴스 히스토리 조회: userId=${userId}, 개수=${cardNewsHistory.length}`);

    return NextResponse.json({
      success: true,
      userId: userIdNum,
      cardNews: cardNewsHistory.map((item) => ({
        id: `${item.timestamp}`,
        title: item.title,
        cardsCount: item.cardsCount,
        jobId: item.link.split('jobId=')[1],
        timestamp: new Date(item.timestamp).toISOString(),
        preview: `/api/card-news/export?jobId=${item.link.split('jobId=')[1]}&format=preview`,
      })),
    });
  } catch (error) {
    console.error('❌ 카드뉴스 히스토리 조회 실패:', error);
    return NextResponse.json(
      { error: '카드뉴스 히스토리 조회 실패' },
      { status: 500 }
    );
  }
}
