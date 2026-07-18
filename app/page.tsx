'use client';

import ClothDesigner from '../components/ClothDesigner';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [showDesigner, setShowDesigner] = useState<'none' | 'text' | 'image'>('none');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showDesigner === 'image') {
      router.push('/designer-image');
    }
  }, [showDesigner, router]);

  if (showDesigner !== 'none') {
    return (
      <div style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
        <header style={{ background: '#ffffff', borderBottom: '1px solid #e8e8e8', padding: '12px 0', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>우리이야기</h1>
            <button
              onClick={() => setShowDesigner('none')}
              style={{ padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#e8e8e8'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#f0f0f0'}
            >
              ← 돌아가기
            </button>
          </div>
        </header>
        <main style={{ minHeight: '100vh', background: '#ffffff' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            {showDesigner === 'text' && <ClothDesigner />}
            {showDesigner === 'image' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>이미지 디자이너로 이동합니다...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Noto Sans KR", sans-serif', minHeight: '100vh', background: '#ffffff', color: '#1a1a1a' }}>
      {/* 헤더 */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e8e8e8', padding: '12px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>우리이야기</h1>
          <button
            onClick={() => setShowDesigner('text')}
            style={{ padding: '12px 30px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#1D4ED8'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#2563EB'}
          >
            디자인 시작하기
          </button>
        </div>
      </header>

      {/* 배너 */}
      <section style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '18px' : '32px', marginBottom: '12px', color: '#1a1a1a', fontWeight: 700 }}>
            당신의 이야기를 옷에 담다
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>
            태어난 해의 띠, 별자리, 그리고 당신만의 문구로<br />
            세상에 하나뿐인 티셔츠를 만들어보세요
          </p>
          <button
            onClick={() => setShowDesigner('text')}
            style={{ display: 'inline-block', background: '#2563EB', color: 'white', padding: '14px 40px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#1D4ED8'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#2563EB'}
          >
            지금 만들어보기 →
          </button>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section style={{ padding: '60px 20px', background: '#f9f9f9' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '40px', color: '#1a1a1a' }}>
            3가지 특징
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[
              { emoji: '🎯', title: '쉬운 커스터마이징', desc: '이름, 출생년도, 문구를 입력하기만 하면 자동으로 디자인이 생성됩니다' },
              { emoji: '✨', title: '위치 조정 자유도', desc: '드래그해서 위치 이동, 크기 조정, 회전까지 완벽하게 당신의 스타일대로 배치하세요' },
              { emoji: '🎨', title: '다양한 선택지', desc: '6가지 옷 색상, 프리셋 명언, 별자리, 직접 입력으로 원하는 대로 조합하세요' },
            ].map((item, idx) => (
              <div key={idx} style={{ background: '#ffffff', padding: '30px', borderRadius: '4px', textAlign: 'center', border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{item.emoji}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 디자인 방식 선택 */}
      <section style={{ padding: '60px 20px', background: '#f9f9f9' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '40px', color: '#1a1a1a' }}>
            두 가지 방식으로 디자인하기
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {[
              {
                emoji: '✨',
                title: '문구로 디자인',
                desc: '이름, 출생년도, 명언을 입력하여 세상에 하나뿐인 티셔츠 제작',
                steps: ['옷 색상 선택', '이름과 출생년도 입력', '명언 또는 문구 선택', '위치 조정'],
                action: () => setShowDesigner('text'),
              },
              {
                emoji: '🖼️',
                title: '이미지로 디자인',
                desc: '고객이 제공한 이미지를 업로드하면 자동으로 누끼 처리되어 배치',
                steps: ['옷 색상 선택', '앞면 이미지 업로드', '뒷면 이미지 업로드', '크기/위치 조정'],
                action: () => router.push('/designer-image'),
              },
            ].map((option, idx) => (
              <div key={idx} style={{ background: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{option.emoji}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>{option.title}</h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', flex: 1, lineHeight: 1.6 }}>{option.desc}</p>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#999', marginBottom: '8px' }}>단계:</p>
                  <ol style={{ fontSize: '13px', color: '#666', lineHeight: 1.8, paddingLeft: '20px' }}>
                    {option.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
                <button
                  onClick={option.action}
                  style={{
                    display: 'block',
                    background: '#2563EB',
                    color: 'white',
                    padding: '14px 30px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '100%',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#1D4ED8'}
                  onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#2563EB'}
                >
                  {option.title} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 20px', background: '#2563EB' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>세상에 하나뿐인 티셔츠</h2>
          <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.9 }}>지금 바로 당신의 이야기를 디자인해보세요</p>
          <button
            onClick={() => setShowDesigner('text')}
            style={{ padding: '14px 40px', background: 'white', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.opacity = '0.9'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.opacity = '1'}
          >
            지금 시작하기 →
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer style={{ background: '#1a1a1a', color: 'white', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>우리이야기</h3>
          <p style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>당신의 이야기를 옷에 담다</p>
          <p style={{ fontSize: '12px', color: '#666' }}>© 2026 우리이야기. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
