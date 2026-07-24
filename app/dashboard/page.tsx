'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

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

const CHART_COLORS = ['#0066ff', '#7c3aed', '#059669'];

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
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 font-medium">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  const stageData = [
    { name: '준비', value: analytics?.marketingStages.preparation || 0 },
    { name: '실행', value: analytics?.marketingStages.execution || 0 },
    { name: '최적화', value: analytics?.marketingStages.optimization || 0 },
  ];

  const areaData = [
    { name: 'Instagram', value: analytics?.focusAreas.instagram || 0 },
    { name: '블로그', value: analytics?.focusAreas.blog || 0 },
    { name: '협력', value: analytics?.focusAreas['artist-collaboration'] || 0 },
    { name: '디자인', value: analytics?.focusAreas.design || 0 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-200/50 sticky top-0 z-10 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div>
            <h1 className="text-4xl font-semibold text-black tracking-tight">
              AI 마케팅 팀
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              텔레그램 대화가 AI를 진화시킵니다
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {/* 총 대화 */}
          <div className="group">
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-300">
              <p className="text-xs font-medium text-gray-600 mb-3">총 대화</p>
              <p className="text-3xl font-semibold text-black mb-2">
                {analytics?.totalConversations || 0}
              </p>
              <p className="text-xs text-gray-500">사용자와의 상담</p>
            </div>
          </div>

          {/* 총 메시지 */}
          <div className="group">
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-300">
              <p className="text-xs font-medium text-gray-600 mb-3">메시지</p>
              <p className="text-3xl font-semibold text-black mb-2">
                {analytics?.totalMessages || 0}
              </p>
              <p className="text-xs text-gray-500">학습 데이터</p>
            </div>
          </div>

          {/* 활성 사용자 */}
          <div className="group">
            <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-300">
              <p className="text-xs font-medium text-gray-600 mb-3">활성 사용자</p>
              <p className="text-3xl font-semibold text-black mb-2">
                {analytics?.users || 0}
              </p>
              <p className="text-xs text-gray-500">텔레그램</p>
            </div>
          </div>

          {/* AI 상태 */}
          <div className="group">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 hover:from-blue-100 hover:to-blue-100 transition-colors duration-300">
              <p className="text-xs font-medium text-gray-600 mb-3">AI 상태</p>
              <p className="text-3xl font-semibold text-blue-900 mb-2">
                {analytics && analytics.totalMessages > 0 ? '학습 중' : '준비'}
              </p>
              <p className="text-xs text-gray-600">실시간 진화</p>
            </div>
          </div>
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* 마케팅 단계 */}
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-black">마케팅 단계</h2>
              <p className="text-xs text-gray-500 mt-1">사용자 분포</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100/50 transition-colors duration-300">
              {stageData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stageData}>
                    <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        padding: '8px 12px',
                        fontSize: '12px',
                      }}
                      cursor={{ fill: '#0066ff10' }}
                    />
                    <Bar dataKey="value" fill="#0066ff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  데이터 대기 중
                </div>
              )}
            </div>
          </div>

          {/* 관심 영역 */}
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-black">관심 영역</h2>
              <p className="text-xs text-gray-500 mt-1">질문 분포</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100/50 transition-colors duration-300">
              {areaData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={areaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}`}
                      labelLine={false}
                    >
                      {areaData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#0066ff', '#7c3aed', '#059669', '#d97706'][index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        padding: '8px 12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  데이터 대기 중
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 카드뉴스 섹션 */}
        <div className="mb-16">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-black">📸 생성된 카드뉴스</h2>
            <p className="text-xs text-gray-500 mt-1">최근 생성된 마케팅 콘텐츠</p>
          </div>
          <CardNewsGallery />
        </div>

        {/* AI 성장 정보 */}
        <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100/50 transition-colors duration-300">
          <h2 className="text-lg font-semibold text-black mb-6">AI 성장</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">학습 데이터</p>
              <p className="text-4xl font-semibold text-black">
                {analytics?.totalMessages || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">누적 메시지</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">성장 속도</p>
              <p className="text-4xl font-semibold text-black">
                {analytics && analytics.totalMessages > 50 ? '↑ 빠름' : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-2">매 대화마다</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">모델</p>
              <p className="text-4xl font-semibold text-black">3.5</p>
              <p className="text-xs text-gray-500 mt-2">Claude Sonnet</p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="mt-16 text-center border-t border-gray-200/50 pt-8">
          <p className="text-sm text-gray-600">
            <strong>@hanol_marketing_bot</strong>에서 질문할 때마다 AI가 성장합니다
          </p>
          <p className="text-xs text-gray-400 mt-2">30초마다 실시간 업데이트</p>
        </div>
      </div>
    </div>
  );
}

// 카드뉴스 갤러리 컴포넌트
function CardNewsGallery() {
  const [cardNews, setCardNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardNews = async () => {
      try {
        // 고정 사용자 ID (실제로는 인증에서 가져와야 함)
        const userId = 439664573;
        const response = await fetch(`/api/card-news/history?userId=${userId}`);
        const data = await response.json();

        if (data.success && data.cardNews) {
          setCardNews(data.cardNews);
        }
      } catch (error) {
        console.error('카드뉴스 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCardNews();
    // 30초마다 갱신
    const interval = setInterval(fetchCardNews, 30000);
    return () => clearInterval(interval);
  }, []);

  const downloadCardNews = async (jobId: string) => {
    setDownloading(jobId);
    try {
      const response = await fetch(`/api/card-news/export?jobId=${jobId}&format=zip`);
      if (!response.ok) throw new Error('다운로드 실패');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'card-news.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ 다운로드 실패:', error);
      alert('다운로드에 실패했습니다');
    } finally {
      setDownloading(null);
    }
  };

  const deleteCardNews = async (timestamp: string) => {
    if (!confirm('이 카드뉴스를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(
        `/api/card-news/delete?userId=439664573&timestamp=${timestamp}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('삭제 실패');

      // 목록 새로고침
      setCardNews((prev) => prev.filter((item) => item.id !== timestamp));
      alert('삭제되었습니다');
    } catch (error) {
      console.error('❌ 삭제 실패:', error);
      alert('삭제에 실패했습니다');
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100/50 transition-colors duration-300">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">카드뉴스 로드 중...</p>
          </div>
        </div>
      ) : cardNews.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-sm text-gray-600">🎨 아직 생성된 카드뉴스가 없습니다</p>
            <p className="text-xs text-gray-500 mt-2">텔레그램 봇에서 질문하면 자동으로 생성됩니다</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardNews.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* 카드 미리보기 */}
              <div className="relative bg-gray-100 aspect-[9/11.25] overflow-hidden">
                {item.preview ? (
                  <img
                    src={item.preview}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-400 text-sm">미리보기 없음</p>
                  </div>
                )}
              </div>

              {/* 카드 정보 */}
              <div className="p-4">
                <p className="text-sm font-semibold text-black truncate">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.cardsCount}개 이미지</p>

                {/* 다운로드 버튼 */}
                <button
                  onClick={() => downloadCardNews(item.jobId)}
                  disabled={downloading === item.jobId}
                  className="w-full mt-4 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium text-sm rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading === item.jobId ? '다운로드 중...' : '📥 다운로드'}
                </button>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => deleteCardNews(item.id)}
                  className="w-full mt-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm rounded-lg transition-colors duration-200"
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}