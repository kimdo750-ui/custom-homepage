'use client';

import { useState, useEffect } from 'react';
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
  Legend,
  ResponsiveContainer,
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

// 전문 색상 팔레트 (CVD-safe)
const COLORS = {
  primary: '#2563eb',    // 파랑
  secondary: '#7c3aed',  // 보라
  success: '#059669',    // 초록
  warning: '#d97706',    // 주황
  info: '#0891b2',       // 시안
  danger: '#dc2626',     // 빨강
};

const STAGE_COLORS = ['#2563eb', '#7c3aed', '#059669'];
const AREA_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706'];

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
    // 30초마다 새로고침
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full mb-4"></div>
          <p className="text-slate-600 font-medium">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 차트 데이터 변환
  const stageData = [
    { name: '준비 단계', value: analytics?.marketingStages.preparation || 0 },
    { name: '실행 단계', value: analytics?.marketingStages.execution || 0 },
    { name: '최적화 단계', value: analytics?.marketingStages.optimization || 0 },
  ];

  const areaData = [
    { name: 'Instagram', value: analytics?.focusAreas.instagram || 0 },
    { name: '블로그', value: analytics?.focusAreas.blog || 0 },
    { name: '작가협력', value: analytics?.focusAreas['artist-collaboration'] || 0 },
    { name: '디자인', value: analytics?.focusAreas.design || 0 },
    { name: '기타', value: analytics?.focusAreas.other || 0 },
  ];

  // Stat 카드 컴포넌트
  const StatCard = ({
    icon,
    label,
    value,
    subtitle,
    color,
  }: {
    icon: string;
    label: string;
    value: number | string;
    subtitle: string;
    color: string;
  }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
        </div>
        <div
          className="text-2xl p-3 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  const totalStageUsers = stageData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                🤖 AI 마케팅 팀 성장 대시보드
              </h1>
              <p className="text-slate-600 mt-1">
                텔레그램에서의 모든 대화가 AI를 진화시킵니다
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">실시간 업데이트</p>
              <p className="text-xs text-slate-400">30초마다 새로고침</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 주요 메트릭 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="💬"
            label="총 대화 수"
            value={analytics?.totalConversations || 0}
            subtitle="사용자들과의 상담"
            color={COLORS.primary}
          />
          <StatCard
            icon="📨"
            label="총 메시지"
            value={analytics?.totalMessages || 0}
            subtitle="AI 학습 데이터"
            color={COLORS.secondary}
          />
          <StatCard
            icon="👥"
            label="활성 사용자"
            value={analytics?.users || 0}
            subtitle="텔레그램 사용자"
            color={COLORS.info}
          />
          <StatCard
            icon="✨"
            label="AI 성숙도"
            value={analytics && analytics.totalMessages > 10 ? '높음' : '초기'}
            subtitle={
              analytics && analytics.totalMessages > 0 ? '학습 중' : '준비 중'
            }
            color={COLORS.success}
          />
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 마케팅 단계별 분포 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              📊 마케팅 단계별 분포
            </h2>
            {totalStageUsers > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                    formatter={(value) => [value, '사용자']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {stageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STAGE_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                데이터가 없습니다
              </div>
            )}
          </div>

          {/* 관심 영역 분포 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              🎯 마케팅 관심 영역
            </h2>
            {areaData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={areaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {areaData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={AREA_COLORS[index % AREA_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>

        {/* AI 성장 지표 */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            🧠 AI 성장 지표
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-xs font-semibold text-blue-600 mb-1">
                학습 데이터
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {analytics?.totalMessages || 0}
              </p>
              <p className="text-xs text-blue-600 mt-2">누적 메시지</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200">
              <div className="text-3xl mb-2">🚀</div>
              <p className="text-xs font-semibold text-purple-600 mb-1">
                성장 속도
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {analytics && analytics.totalMessages > 50 ? '빠름 ↑' : '초기'}
              </p>
              <p className="text-xs text-purple-600 mt-2">매 대화마다 개선</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-xs font-semibold text-green-600 mb-1">
                응답 품질
              </p>
              <p className="text-2xl font-bold text-green-900">
                프리미엄
              </p>
              <p className="text-xs text-green-600 mt-2">Claude 3.5 Sonnet</p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            💡 <strong>데이터는 실시간으로 누적됩니다</strong>
          </p>
          <p className="mt-1">
            @hanol_marketing_bot에서 질문할 때마다 AI가 학습하고 성장합니다
          </p>
        </div>
      </div>
    </div>
  );
}