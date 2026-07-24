'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  users: number;
  marketingStages: {
    preparation: number;
    execution: number;
    optimization: number;
  };
  focusAreas: {
    instagram: number;
    blog: number;
    'artist-collaboration': number;
    design: number;
    other: number;
  };
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/telegram/analytics');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('분석 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sand to-paper flex items-center justify-center">
        <p className="text-ink-soft">데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand to-paper p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-clay mb-2">
            🤖 AI 마케팅 팀 성장 대시보드
          </h1>
          <p className="text-lg text-ink-faint">
            매일 진화하는 텔레그램 마케팅 AI의 성장을 시각화합니다
          </p>
        </div>

        {/* 주요 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* 총 대화 수 */}
          <div className="bg-white rounded-2xl border-2 border-clay/20 p-6 shadow-sm hover:shadow-lift transition-all">
            <div className="text-sm text-ink-soft mb-2">총 대화 수</div>
            <div className="text-4xl font-bold text-clay">
              {analytics?.totalConversations || 0}
            </div>
            <div className="text-xs text-ink-faint mt-2">사용자들과의 상담</div>
          </div>

          {/* 총 메시지 */}
          <div className="bg-white rounded-2xl border-2 border-clay/20 p-6 shadow-sm hover:shadow-lift transition-all">
            <div className="text-sm text-ink-soft mb-2">총 메시지</div>
            <div className="text-4xl font-bold text-clay">
              {analytics?.totalMessages || 0}
            </div>
            <div className="text-xs text-ink-faint mt-2">AI 학습 데이터 수</div>
          </div>

          {/* 활성 사용자 */}
          <div className="bg-white rounded-2xl border-2 border-clay/20 p-6 shadow-sm hover:shadow-lift transition-all">
            <div className="text-sm text-ink-soft mb-2">활성 사용자</div>
            <div className="text-4xl font-bold text-clay">
              {analytics?.users || 0}
            </div>
            <div className="text-xs text-ink-faint mt-2">텔레그램 사용자</div>
          </div>

          {/* AI 성숙도 */}
          <div className="bg-white rounded-2xl border-2 border-clay/20 p-6 shadow-sm hover:shadow-lift transition-all">
            <div className="text-sm text-ink-soft mb-2">AI 성숙도</div>
            <div className="text-4xl font-bold text-clay">
              {analytics && analytics.totalMessages > 0 ? '⭐⭐⭐⭐⭐' : '준비 중'}
            </div>
            <div className="text-xs text-ink-faint mt-2">학습 진행도</div>
          </div>
        </div>

        {/* 마케팅 단계별 분포 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 마케팅 단계 */}
          <div className="bg-white rounded-2xl border-2 border-clay/20 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-clay mb-6">
              📊 마케팅 단계별 분포
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-ink">준비 단계</span>
                  <span className="text-sm font-bold text-clay">
                    {analytics?.marketingStages.preparation || 0}
                  </span>
                </div>
                <div className="w-full bg-sand rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-clay h-full transition-all"
                    style={{
                      width: `${Math.min(
                        ((analytics?.marketingStages.preparation || 0) * 20) % 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-ink">실행 단계</span>
                  <span className="text-sm font-bold text-clay">
                    {analytics?.marketingStages.execution || 0}
                  </span>
                </div>
                <div className="w-full bg-sand rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-clay h-full transition-all"
                    style={{
                      width: `${Math.min(
                        ((analytics?.marketingStages.execution || 0) * 20) % 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-ink">최적화 단계</span>
                  <span className="text-sm font-bold text-clay">
                    {analytics?.marketingStages.optimization || 0}
                  </span>
                </div>
                <div className="w-full bg-sand rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-clay h-full transition-all"
                    style={{
                      width: `${Math.min(
                        ((analytics?.marketingStages.optimization || 0) * 20) % 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 관심 영역 */}
          <div className="bg-white rounded-2xl border-2 border-clay/20 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-clay mb-6">
              🎯 마케팅 관심 영역
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-sand rounded-lg">
                <span className="text-sm font-semibold">📱 Instagram</span>
                <span className="text-lg font-bold text-clay">
                  {analytics?.focusAreas.instagram || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sand rounded-lg">
                <span className="text-sm font-semibold">📝 블로그</span>
                <span className="text-lg font-bold text-clay">
                  {analytics?.focusAreas.blog || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sand rounded-lg">
                <span className="text-sm font-semibold">👥 작가협력</span>
                <span className="text-lg font-bold text-clay">
                  {analytics?.focusAreas['artist-collaboration'] || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sand rounded-lg">
                <span className="text-sm font-semibold">🎨 디자인</span>
                <span className="text-lg font-bold text-clay">
                  {analytics?.focusAreas.design || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI 성장 상태 */}
        <div className="bg-white rounded-2xl border-2 border-clay/20 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-clay mb-6">
            🧠 AI 성장 지표
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-clay/10 to-transparent rounded-xl border border-clay/20">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-sm font-semibold text-ink-soft mb-1">학습 데이터</div>
              <div className="text-2xl font-bold text-clay">
                {analytics?.totalMessages || 0} 메시지
              </div>
              <div className="text-xs text-ink-faint mt-2">
                누적된 대화로부터의 학습
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-clay/10 to-transparent rounded-xl border border-clay/20">
              <div className="text-4xl mb-2">🚀</div>
              <div className="text-sm font-semibold text-ink-soft mb-1">발전 속도</div>
              <div className="text-2xl font-bold text-clay">
                {analytics && analytics.totalMessages > 10 ? '빠름 ↑' : '초기 단계'}
              </div>
              <div className="text-xs text-ink-faint mt-2">
                매일 개선 중
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-clay/10 to-transparent rounded-xl border border-clay/20">
              <div className="text-4xl mb-2">✨</div>
              <div className="text-sm font-semibold text-ink-soft mb-1">응답 품질</div>
              <div className="text-2xl font-bold text-clay">
                고급
              </div>
              <div className="text-xs text-ink-faint mt-2">
                Anthropic Claude 3.5 Sonnet
              </div>
            </div>
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-12 text-center p-8 bg-sand rounded-2xl border-2 border-clay/20">
          <p className="text-ink-soft mb-4">
            💡 <strong>데이터는 텔레그램에서의 모든 대화로부터 자동으로 누적됩니다</strong>
          </p>
          <p className="text-sm text-ink-faint">
            @hanol_marketing_bot에서 질문하고 대답할 때마다 AI가 학습하고 성장합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
