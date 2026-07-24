import { MongoClient, Db, Collection } from 'mongodb';
import { ConversationLog, UserProfile, AnalyticsSnapshot, MarketingInsight } from './models';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'hanol_ai_marketing';

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    console.log('✅ 기존 MongoDB 연결 사용');
    return { client: cachedClient, db: cachedDb };
  }

  console.log('🔌 MongoDB 연결 중...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // 인덱스 생성
    await createIndexes(db);

    cachedClient = client;
    cachedDb = db;

    console.log('✅ MongoDB 연결 완료');
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    throw error;
  }
}

async function createIndexes(db: Db) {
  try {
    // ConversationLog 인덱스
    const conversationLogs = db.collection('conversation_logs');
    await conversationLogs.createIndex({ userId: 1, timestamp: -1 });
    await conversationLogs.createIndex({ timestamp: -1 });

    // UserProfile 인덱스
    const userProfiles = db.collection('user_profiles');
    await userProfiles.createIndex({ userId: 1 }, { unique: true });

    // AnalyticsSnapshot 인덱스
    const analyticsSnapshots = db.collection('analytics_snapshots');
    await analyticsSnapshots.createIndex({ timestamp: -1 });

    console.log('✅ 인덱스 생성 완료');
  } catch (error) {
    console.error('⚠️ 인덱스 생성 중 오류:', error);
  }
}

// 대화 로그 저장
export async function saveConversationLog(log: ConversationLog): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('conversation_logs');

    await collection.insertOne({
      ...log,
      timestamp: log.timestamp || new Date(),
    });

    console.log(`✅ 대화 로그 저장: userId=${log.userId}`);
  } catch (error) {
    console.error('❌ 대화 로그 저장 실패:', error);
    throw error;
  }
}

// 사용자 프로필 업데이트 또는 생성
export async function upsertUserProfile(profile: UserProfile): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('user_profiles');

    await collection.updateOne(
      { userId: profile.userId },
      { $set: profile },
      { upsert: true }
    );

    console.log(`✅ 사용자 프로필 업데이트: userId=${profile.userId}`);
  } catch (error) {
    console.error('❌ 사용자 프로필 업데이트 실패:', error);
    throw error;
  }
}

// 분석 데이터 조회
export async function getAnalyticsSummary(): Promise<Partial<AnalyticsSnapshot>> {
  try {
    const { db } = await connectToDatabase();

    // 최근 데이터 조회
    const conversationLogs = db.collection('conversation_logs');
    const userProfiles = db.collection('user_profiles');

    const totalMessages = await conversationLogs.countDocuments();
    const totalUsers = await userProfiles.countDocuments();
    const totalConversations = await userProfiles.countDocuments({});

    // 마케팅 단계별 집계
    const stageStats = await userProfiles.aggregate([
      {
        $group: {
          _id: '$currentStage',
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const marketingStages = {
      planning: 0,
      preparation: 0,
      execution: 0,
      optimization: 0,
    };

    stageStats.forEach((stat: any) => {
      if (stat._id in marketingStages) {
        (marketingStages as any)[stat._id] = stat.count;
      }
    });

    // 관심 영역 집계
    const focusAreaStats = await userProfiles.aggregate([
      { $unwind: '$focusAreas' },
      {
        $group: {
          _id: '$focusAreas',
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const focusAreas: Record<string, number> = {};
    focusAreaStats.forEach((stat: any) => {
      focusAreas[stat._id || 'other'] = stat.count;
    });

    return {
      timestamp: new Date(),
      totalUsers,
      totalMessages,
      totalConversations,
      marketingStages,
      focusAreas,
    };
  } catch (error) {
    console.error('❌ 분석 데이터 조회 실패:', error);
    throw error;
  }
}

// 사용자별 대화 히스토리 조회
export async function getUserConversationHistory(
  userId: number,
  limit: number = 50
): Promise<ConversationLog[]> {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('conversation_logs');

    const logs = await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray() as unknown as ConversationLog[];

    return logs;
  } catch (error) {
    console.error('❌ 대화 히스토리 조회 실패:', error);
    throw error;
  }
}

export { connectToDatabase };
