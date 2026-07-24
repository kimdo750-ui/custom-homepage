import { NextRequest, NextResponse } from 'next/server';
import { getUserConversationHistory } from '@/lib/db/connection';
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'hanol_ai_marketing';

async function getDatabase(): Promise<Db> {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db(DB_NAME);
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timestamp = searchParams.get('timestamp');

    if (!userId || !timestamp) {
      return NextResponse.json(
        { error: 'userId와 timestamp가 필요합니다' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId, 10);
    const timestampNum = parseInt(timestamp, 10);

    console.log(`🗑️  카드뉴스 삭제: userId=${userId}, timestamp=${timestamp}`);

    // MongoDB에서 해당 카드뉴스 기록 삭제
    const db = await getDatabase();
    const collection = db.collection('conversation_logs');

    const result = await collection.deleteOne({
      userId: userIdNum,
      timestamp: new Date(timestampNum),
      focusArea: { $in: ['card-news', 'card-news-generation'] },
    });

    if (result.deletedCount === 0) {
      // 정확한 매칭이 없으면 content에서 timestamp 포함하는 항목 삭제
      const logsToDelete = await collection
        .find({
          userId: userIdNum,
          focusArea: { $in: ['card-news', 'card-news-generation'] },
        })
        .toArray();

      for (const log of logsToDelete) {
        try {
          const content = JSON.parse(log.content || '{}');
          if (content.timestamp === timestampNum) {
            await collection.deleteOne({ _id: log._id });
            break;
          }
        } catch {
          // 파싱 실패 무시
        }
      }
    }

    console.log(`✅ 카드뉴스 삭제 완료`);

    return NextResponse.json({
      success: true,
      message: '카드뉴스가 삭제되었습니다',
    });
  } catch (error) {
    console.error('❌ 카드뉴스 삭제 실패:', error);
    return NextResponse.json(
      { error: '카드뉴스 삭제 실패' },
      { status: 500 }
    );
  }
}
