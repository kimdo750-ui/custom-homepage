'use client';

import ClothDesigner from '../components/ClothDesigner';
import { useState } from 'react';

export default function Home() {
  const [showDesigner, setShowDesigner] = useState(false);

  if (showDesigner) {
    return (
      <div style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
        <header style={{ background: '#ffffff', borderBottom: '1px solid #e8e8e8', padding: '12px 0', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>우리이야기</h1>
            <button
              onClick={() => setShowDesigner(false)}
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
            <ClothDesigner />
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
            onClick={() => setShowDesigner(true)}
            style={{ padding: '12px 30px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.opacity = '0.9'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.opacity = '1'}
          >
            디자인 시작하기
          </button>
        </div>
      </header>

      {/* 배너 */}
      <section style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '12px', color: '#1a1a1a', fontWeight: 700 }}>
            당신의 이야기를 옷에 담다
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>
            태어난 해의 띠, 별자리, 그리고 당신만의 문구로<br />
            세상에 하나뿐인 티셔츠를 만들어보세요
          </p>
          <button
            onClick={() => setShowDesigner(true)}
            style={{ display: 'inline-block', background: '#e74c3c', color: 'white', padding: '14px 40px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.opacity = '0.9'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.opacity = '1'}
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

      {/* 프로세스 */}
      <section style={{ padding: '60px 20px', background: '#ffffff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '40px', color: '#1a1a1a' }}>
            4단계로 완성하기
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {[
              { step: 1, title: '옷 색상 선택', desc: '6가지 색상 중 선택' },
              { step: 2, title: '앞면 디자인', desc: '이름과 출생년도 입력' },
              { step: 3, title: '뒷면 디자인', desc: '명언 또는 문구 선택/입력' },
              { step: 4, title: '위치 조정', desc: '드래그해서 배치 완성' },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#e74c3c',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '24px',
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#1a1a1a' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#666' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 20px', background: '#e74c3c' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>세상에 하나뿐인 티셔츠</h2>
          <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.9 }}>지금 바로 당신의 이야기를 디자인해보세요</p>
          <button
            onClick={() => setShowDesigner(true)}
            style={{ padding: '14px 40px', background: 'white', color: '#e74c3c', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}
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
