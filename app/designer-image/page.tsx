'use client';

import ImageDesigner from '../../components/ImageDesigner';
import { useRouter } from 'next/navigation';

export default function DesignerImagePage() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e8e8e8', padding: '12px 0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>우리이야기</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => router.push('/')}
              style={{ padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#e8e8e8'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#f0f0f0'}
            >
              ← 돌아가기
            </button>
          </div>
        </div>
      </header>
      <main style={{ minHeight: '100vh', background: '#ffffff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#1a1a1a' }}>
              🖼️ 이미지로 디자인
            </h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              고객 이미지를 업로드하면 자동으로 누끼 처리되어 앞/뒷면에 배치됩니다
            </p>
          </div>
          <ImageDesigner />
        </div>
      </main>
    </div>
  );
}
