import { Anthropic } from '@anthropic-ai/sdk';
import { generateMarketingPrompt, DEFAULT_WELCOME_MESSAGE } from './prompts';
import {
  addMessage,
  getConversationHistory,
  getOrCreateUserContext,
  addContextNote,
} from './memory';
import { saveConversationLog, upsertUserProfile } from '@/lib/db/connection';
import { parseAIResponse } from '@/lib/card-news/generator';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function handleUserMessage(userId: number, userMessage: string): Promise<string> {
  try {
    console.log(`📱 사용자 메시지 처리 시작: ${userMessage}`);

    // 메모리에 저장
    addMessage(userId, 'user', userMessage);

    // DB에 사용자 메시지 저장 (비동기, 에러 무시)
    saveConversationLog({
      userId,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }).catch((err) => console.warn('⚠️ 사용자 메시지 DB 저장 실패 (무시됨):', err));

    // 대화 히스토리 가져오기
    const conversationHistory = getConversationHistory(userId, 8);

    // AI 응답 생성
    console.log(`🤖 AI 응답 생성 중...`);
    const assistantMessage = await generateAIResponse(userMessage, conversationHistory);
    console.log(`✅ AI 응답 생성 완료: ${assistantMessage.substring(0, 50)}...`);

    // 메모리에 저장
    addMessage(userId, 'assistant', assistantMessage);

    // DB에 AI 응답 저장 (비동기, 에러 무시)
    const userContext = getOrCreateUserContext(userId);
    saveConversationLog({
      userId,
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date(),
      marketingStage: userContext.context.marketingStage,
      focusArea: userContext.context.focusArea,
    }).catch((err) => console.warn('⚠️ AI 응답 DB 저장 실패 (무시됨):', err));

    // 사용자 프로필 업데이트 (비동기, 에러 무시)
    upsertUserProfile({
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      totalMessages: userContext.messages.length,
      currentStage: userContext.context.marketingStage,
      focusAreas: userContext.context.focusArea ? [userContext.context.focusArea] : [],
      tags: [],
    }).catch((err) => console.warn('⚠️ 사용자 프로필 업데이트 실패 (무시됨):', err));

    // 사용자 메시지 분석 (마케팅 단계 추적)
    analyzeUserIntent(userId, userMessage);

    // 🎨 카드뉴스 생성 (모든 AI 응답에 대해)
    generateCardNewsAsync(assistantMessage, userId).catch((err) => {
      console.warn('⚠️ 카드뉴스 생성 실패 (백그라운드):', err);
    });

    return assistantMessage;
  } catch (error) {
    console.error('❌ 메시지 처리 실패:', error);
    return '죄송해요, 지금 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.';
  }
}

async function generateAIResponse(userMessage: string, conversationHistory: string): Promise<string> {
  try {
    const userContext = getOrCreateUserContext(0); // 기본 컨텍스트 (텔레그램에서는 userId 사용)
    const prompt = `${generateMarketingPrompt(userMessage, conversationHistory)}

[현재 사용자 단계]: ${userContext.context.marketingStage}
[관심 영역]: ${userContext.context.focusArea}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0];
    if (response.type === 'text') {
      return response.text;
    }
    return '죄송해요, 응답을 생성할 수 없습니다.';
  } catch (error) {
    console.error('❌ AI 응답 생성 실패:', error);
    // AI 실패 시 템플릿 기반 응답으로 폴백
    return getDefaultResponse(userMessage);
  }
}

function getDefaultResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('오늘') || lower.includes('해야')) {
    return `🎯 한올 러그 마케팅 로드맵

현재 단계: 제조 중 (MOQ 대기)

✅ 지금 할 것:
1️⃣ Instagram 계정 프로필 작성
   - Bio: "한국 전통의 미가 숨쉬는 러그"
   - 프로필 사진: 고급 러그 이미지

2️⃣ 블로그 포스트 계획
   - 주제 1: "러그 선택 완벽 가이드"
   - 주제 2: "거실 인테리어 트렌드"
   - 주제 3: "러그 관리법"

3️⃣ 작가 협력 계약서 준비
   - 낙관 + 인증서 템플릿
   - 수익 배분 계약 (5%)

📌 가장 중요한 것: 프로필 완성!`;
  }

  if (lower.includes('인스타') || lower.includes('instagram')) {
    return `📱 Instagram 전략

👥 타겟: 30-50대 여성 + MZ세대

📸 콘텐츠 3가지:
1️⃣ Before/After 공간 변화 (주 1회)
   - 일반적인 거실 → 한올 러그 적용
   - 따뜻한 분위기 강조

2️⃣ 작가 소개 (주 1회)
   - "아티스트 김OOO의 작품이 러그가 되다"
   - 작가 인터뷰, 낙관 영상

3️⃣ 전통문양 스토리 (주 1회)
   - "당초문의 의미는?"
   - 문양별 인테리어 팁

🎨 해시태그:
#한국러그 #전통문양 #프리미엄러그 #인테리어 #거실`;
  }

  if (lower.includes('블로그') || lower.includes('포스트')) {
    return `📝 블로그 콘텐츠 전략

🎯 목표: 검색 유입 + 신뢰도

✍️ 5개 포스트 계획:

1️⃣ "러그 선택 완벽 가이드"
   - 러그 종류, 소재, 가격대
   - 한국 전통 러그의 특징

2️⃣ "2025 거실 인테리어 트렌드"
   - 미니멀 + 따뜻한 톤
   - 한국 미니멀 감성

3️⃣ "프리미엄 러그의 가치"
   - 수작업의 우수성
   - 작가 콜라보의 의미

4️⃣ "러그 관리 & 세탁법"
   - 수작업 러그 특별 관리
   - 계절별 관리 팁

5️⃣ "한국 작가를 응원해야 하는 이유"
   - 로컬 아트 지원
   - 작가 스토리

📊 SEO 키워드: 한국 러그, 전통 문양, 프리미엄`;
  }

  if (lower.includes('작가') || lower.includes('협력')) {
    return `👥 작가 협력 마케팅 전략

현황: 100명+ 확보, 10명+ 협력 의사

🤝 Win-Win 구조:
✅ 작가들: 매 판매마다 5% 로열티
✅ 한올: 자동 홍보 + 신뢰도 ⬆

📢 작가의 자발적 홍보:
1️⃣ 작가 SNS에 "내 그림이 러그가 됐다!"
2️⃣ 작가의 팬 → 한올 고객으로 전환
3️⃣ 입소문 ↑↑↑

💼 초대 메시지 예시:
"당신의 작품을 한올 러그로 만나보세요!
- 낙관 + 인증서로 예술성 보장
- 매 판매마다 5% 수익
- SNS로 자유로운 홍보"`;
  }

  if (lower.includes('카드') || lower.includes('디자인')) {
    return `🎨 카드뉴스 & 디자인 전략

📌 카드뉴스 주제 (주 1회):
1️⃣ "한국 전통 문양의 의미"
2️⃣ "러그 선택 팁 5가지"
3️⃣ "프리미엄 러그 가치"
4️⃣ "작가 협력 이야기"
5️⃣ "계절별 러그 추천"

🎯 디자인 방향:
- 색상: 따뜻한 톤 (베이지, 갈색, burgundy)
- 타입: 심플하고 고급스러운 느낌
- 폰트: 한글 고딕 + 영문 serif
- 레이아웃: 텍스트 40% + 이미지 60%

💡 배포 채널:
- Instagram 피드 (1회/주)
- Instagram Stories (2-3회/주)
- Threads (일일)`;
  }

  // 기본 응답: 모든 질문에 대해 마케팅 조언 제공
  return `📌 한올 러그 마케팅 전략

"${userMessage}"에 대한 조언:

🎯 현재 상황:
- 타겟: 30-50대 여성 + MZ세대
- 포지셔닝: "한국 전통의 미가 숨쉬는 프리미엄 러그"
- 핵심: 작가 협력 + 스토리텔링

💡 추천:
1️⃣ Instagram에서 Before/After 콘텐츠로 시작
2️⃣ 작가 협력으로 입소문 유도 (5% 로열티)
3️⃣ 블로그 SEO로 검색 유입 확보
4️⃣ 전통 문양 스토리로 차별화

📞 더 구체적인 조언이 필요하면:
- "오늘 뭐 해야 할까?"
- "인스타그램 전략"
- "블로그 포스트"
- "작가 협력"

이렇게 물어봐주세요! 💪`;
}

// 🎨 카드뉴스 생성 필요 여부 판단
function shouldGenerateCardNews(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const cardNewsKeywords = [
    '카드뉴스',
    '카드',
    '뉴스',
    '콘텐츠',
    '만들어',
    '생성해',
    '생성하',
    '만들',
    '이미지',
  ];

  return cardNewsKeywords.some((keyword) => lowerMessage.includes(keyword));
}

function analyzeUserIntent(userId: number, message: string) {
  const context = getOrCreateUserContext(userId);
  const lowerMessage = message.toLowerCase();

  // 사용자의 현재 마케팅 단계 파악
  if (
    lowerMessage.includes('제조') ||
    lowerMessage.includes('준비') ||
    lowerMessage.includes('계획')
  ) {
    context.context.marketingStage = 'preparation';
    addContextNote(userId, `준비 단계 관심 감지: ${new Date().toLocaleString('ko-KR')}`);
  } else if (
    lowerMessage.includes('시작') ||
    lowerMessage.includes('운영') ||
    lowerMessage.includes('올리')
  ) {
    context.context.marketingStage = 'execution';
    addContextNote(userId, `실행 단계 진입: ${new Date().toLocaleString('ko-KR')}`);
  } else if (
    lowerMessage.includes('분석') ||
    lowerMessage.includes('조회') ||
    lowerMessage.includes('팔로워')
  ) {
    context.context.marketingStage = 'optimization';
    addContextNote(userId, `최적화 단계 시작: ${new Date().toLocaleString('ko-KR')}`);
  }

  // 관심 영역 파악
  if (lowerMessage.includes('인스타')) {
    context.context.focusArea = 'instagram';
  } else if (lowerMessage.includes('블로그') || lowerMessage.includes('seo')) {
    context.context.focusArea = 'blog';
  } else if (lowerMessage.includes('작가') || lowerMessage.includes('협력')) {
    context.context.focusArea = 'artist-collaboration';
  } else if (lowerMessage.includes('카드') || lowerMessage.includes('디자인')) {
    context.context.focusArea = 'design';
  }
}

export async function getWelcomeMessage(): Promise<string> {
  return DEFAULT_WELCOME_MESSAGE;
}

export async function isValidBotToken(): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    return token ? token.length > 0 : false;
  } catch {
    return false;
  }
}

// 🎨 카드뉴스 자동 생성 (백그라운드)
async function generateCardNewsAsync(aiResponse: string, userId: number): Promise<void> {
  try {
    console.log(`🎨 카드뉴스 생성 시작: userId=${userId}`);

    // AI 응답에서 카드뉴스 구조 파싱
    const deck = parseAIResponse(aiResponse);

    if (!deck.cards || deck.cards.length === 0) {
      console.warn('⚠️ 카드뉴스 생성 실패: 카드가 없음');
      return;
    }

    // 사용자 컨텍스트에 카드뉴스 저장
    const userContext = getOrCreateUserContext(userId);
    addContextNote(
      userId,
      `📸 카드뉴스 생성 완료: ${deck.cards.length}장 덱 생성`
    );

    // 🚀 카드뉴스를 저장소에 저장 (대시보드에서 조회 가능하게)
    const jobId = `card-${Date.now()}`;
    const title = deck.title || `마케팅 카드뉴스 - ${new Date().toLocaleString('ko-KR')}`;
    saveGeneratedCardNews(
      userId,
      title,
      deck.cards.length,
      `/api/card-news/export?jobId=${jobId}&format=zip`
    );

    console.log(`✅ 카드뉴스 생성 완료: ${deck.cards.length}장 (저장됨)`);

    // 선택적: 카드뉴스 통계 저장
    await saveConversationLog({
      userId,
      role: 'system',
      content: `카드뉴스 생성: ${deck.cards.length}장 덱 (jobId: ${jobId})`,
      timestamp: new Date(),
      focusArea: 'card-news-generation',
    }).catch((err) => console.warn('⚠️ 카드뉴스 로그 저장 실패:', err));
  } catch (error) {
    console.error('❌ 카드뉴스 생성 중 오류:', error);
  }
}

// 사용자별 생성된 카드뉴스 저장소 (메모리 캐시 + DB 연동)
const cardNewsCache = new Map<
  number,
  {
    timestamp: number;
    title: string;
    cardsCount: number;
    link: string;
  }[]
>();

export function saveGeneratedCardNews(
  userId: number,
  title: string,
  cardsCount: number,
  link: string
): void {
  if (!cardNewsCache.has(userId)) {
    cardNewsCache.set(userId, []);
  }

  const cardNews = {
    timestamp: Date.now(),
    title,
    cardsCount,
    link,
  };

  cardNewsCache.get(userId)!.push(cardNews);

  // 최대 10개만 유지
  const history = cardNewsCache.get(userId)!;
  if (history.length > 10) {
    history.shift();
  }

  console.log(`💾 카드뉴스 저장: ${title} (${cardsCount}장)`);

  // DB에도 저장 (동기 처리)
  saveConversationLog({
    userId,
    role: 'system',
    content: JSON.stringify({
      type: 'card-news-saved',
      title,
      cardsCount,
      link,
      timestamp: cardNews.timestamp,
    }),
    timestamp: new Date(),
    focusArea: 'card-news',
  }).then(() => {
    console.log(`✅ 카드뉴스 DB 저장 완료: ${title}`);
  }).catch((err) => {
    console.warn('⚠️ 카드뉴스 DB 저장 실패:', err);
  });
}

export function getGeneratedCardNews(userId: number): any[] {
  // 메모리 캐시에서 먼저 조회
  const cached = cardNewsCache.get(userId);
  if (cached && cached.length > 0) {
    return cached;
  }

  // 캐시가 없으면 빈 배열 반환 (실제로는 DB에서 조회해야 함)
  return [];
}
