import { NextRequest, NextResponse } from 'next/server';
import { getUserConversationHistory } from '@/lib/db/connection';
import { createCanvas } from 'canvas';

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

    // MongoDB에서 카드뉴스 기록 조회
    const logs = await getUserConversationHistory(userIdNum, 100);
    const cardNewsLogs = logs
      .filter((log) => {
        try {
          // focusArea가 'card-news' 또는 'card-news-generation'인 경우
          if (log.focusArea === 'card-news' || log.focusArea === 'card-news-generation') {
            const content = JSON.parse(log.content || '{}');
            // type이 'card-news-saved'이거나 단순 텍스트인 경우
            return content.type === 'card-news-saved' || typeof content === 'string' || content.includes?.('카드뉴스');
          }
          return false;
        } catch {
          return false;
        }
      })
      .map((log) => {
        try {
          const content = JSON.parse(log.content || '{}');
          // 카드뉴스 기본 정보 추출
          const timestamp = content.timestamp || Date.now();
          const title = content.title || log.content?.substring(0, 20) || '마케팅 카드뉴스';
          const cardsCount = content.cardsCount || 5;

          // 간단한 PNG 이미지 생성 (1x1 흰 픽셀로 시작)
          // canvas 사용 불가능 시 fallback
          let preview = '';
          try {
            const canvas = createCanvas(600, 750);
            const ctx = canvas.getContext('2d');

            // 배경
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 600, 750);

            // 테두리
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 2;
            ctx.roundRect(30, 30, 540, 690, 12);
            ctx.stroke();

            // 제목
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(title.substring(0, 15), 300, 100);

            // 설명
            ctx.fillStyle = '#666666';
            ctx.font = '16px Arial';
            ctx.fillText(`${cardsCount}개 카드로 구성`, 300, 150);

            // 미리보기 박스
            ctx.fillStyle = '#f0f0f0';
            ctx.roundRect(60, 200, 480, 400, 8);
            ctx.fill();

            // 미리보기 텍스트
            ctx.fillStyle = '#999999';
            ctx.font = '18px Arial';
            ctx.fillText('카드뉴스 미리보기', 300, 420);

            preview = canvas.toDataURL('image/png');
          } catch (e) {
            // canvas 실패 시 기본 이미지 사용
            preview = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
          }

          return {
            id: `${timestamp}`,
            title: title,
            cardsCount: cardsCount,
            jobId: content.link?.split('jobId=')[1] || `card-${timestamp}`,
            timestamp: new Date(timestamp).toISOString(),
            preview: preview,
          };
        } catch (e) {
          console.warn('카드뉴스 파싱 실패:', e);
          return null;
        }
      })
      .filter((item) => item !== null);

    console.log(`📸 카드뉴스 히스토리 조회: userId=${userId}, 개수=${cardNewsLogs.length}`);

    return NextResponse.json({
      success: true,
      userId: userIdNum,
      cardNews: cardNewsLogs,
    });
  } catch (error) {
    console.error('❌ 카드뉴스 히스토리 조회 실패:', error);
    return NextResponse.json(
      { error: '카드뉴스 히스토리 조회 실패' },
      { status: 500 }
    );
  }
}
