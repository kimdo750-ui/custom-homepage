import { NextRequest, NextResponse } from 'next/server';

// 블로그 게시 API
// 현재: 모의 구현 (실제로는 각 블로그 플랫폼의 API를 호출)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, tags, apiKey } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title과 content가 필수입니다' },
        { status: 400 }
      );
    }

    console.log(`📝 블로그 게시: ${title}`);

    // 실제 구현: Naver, Tistory, Medium 등의 API 호출
    // 현재는 모의 응답

    return NextResponse.json({
      success: true,
      postId: `post-${Date.now()}`,
      url: `https://blog.example.com/posts/${Date.now()}`,
      platform: 'blog',
      message: '블로그에 게시되었습니다',
      title,
      tags: tags || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 블로그 게시 실패:', error);
    return NextResponse.json(
      { error: '블로그 게시 실패' },
      { status: 500 }
    );
  }
}
