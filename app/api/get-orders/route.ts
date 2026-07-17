import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;

  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB 연결 설정이 필요합니다' },
        { status: 500 }
      );
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('custom_tshirt');
    const ordersCollection = db.collection('orders');

    // 모든 주문 조회 (최신순)
    const orders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log('주문 조회 완료:', orders.length);

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: orders,
    });

  } catch (error) {
    console.error('주문 조회 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '주문 조회 중 오류 발생';

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );

  } finally {
    if (client) {
      await client.close();
    }
  }
}
