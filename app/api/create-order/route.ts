import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null;

  try {
    // MongoDB URI 확인
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB 연결 설정이 필요합니다' },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      customerName,
      customerEmail,
      clothColor,
      frontImageUrl,
      backImageUrl,
      designImageUrl,
      notes,
    } = body;

    // 필수 필드 확인
    if (!customerName || !customerEmail || !clothColor) {
      return NextResponse.json(
        { error: '필수 정보가 없습니다' },
        { status: 400 }
      );
    }

    console.log('주문 저장:', {
      customerName,
      customerEmail,
      clothColor,
    });

    // MongoDB 연결
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('custom_tshirt');
    const ordersCollection = db.collection('orders');

    // 주문 데이터 생성
    const order = {
      customerName,
      customerEmail,
      clothColor,
      frontImageUrl: frontImageUrl || null,
      backImageUrl: backImageUrl || null,
      designImageUrl: designImageUrl || null,
      notes: notes || '',
      orderDate: new Date(),
      status: 'pending',
      createdAt: new Date(),
    };

    // 주문 저장
    const result = await ordersCollection.insertOne(order);

    console.log('주문 저장 완료:', result.insertedId);

    return NextResponse.json(
      {
        success: true,
        orderId: result.insertedId,
        message: '주문이 저장되었습니다',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('주문 저장 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '주문 저장 중 오류 발생';

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );

  } finally {
    // MongoDB 연결 종료
    if (client) {
      await client.close();
    }
  }
}
