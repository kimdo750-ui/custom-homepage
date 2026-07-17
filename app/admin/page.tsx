'use client';

import { useState, useEffect } from 'react';

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  clothColor: string;
  frontImageUrl: string;
  backImageUrl: string;
  designImageUrl: string;
  notes: string;
  orderDate: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-orders');
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setError('');
      } else {
        setError(data.error || '주문 조회 실패');
      }
    } catch (err) {
      setError('주문 조회 중 오류 발생');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = orders.find(o => o._id === selectedOrderId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const downloadImage = (imageUrl: string, name: string) => {
    if (!imageUrl) {
      alert('다운로드할 이미지가 없습니다');
      return;
    }

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${name}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getImageArray = (imageUrl: string) => {
    if (!imageUrl) return [];
    // Base64는 그대로, URL 경로들은 쉼표로 구분
    if (imageUrl.startsWith('data:')) {
      return [imageUrl];
    }
    return imageUrl.split(',').filter(url => url.trim());
  };

  return (
    <div style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e8e8e8', padding: '12px 0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>📋 주문 관리</h1>
          <button
            onClick={fetchOrders}
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
          >
            🔄 새로고침
          </button>
        </div>
      </header>

      <main style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
          {error && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* 주문 목록 */}
              <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#1a1a1a' }}>
                  주문 목록 ({orders.length}개)
                </h2>

                {orders.length === 0 ? (
                  <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>주문이 없습니다</p>
                ) : (
                  <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        onClick={() => setSelectedOrderId(order._id)}
                        style={{
                          padding: '12px',
                          marginBottom: '8px',
                          background: selectedOrderId === order._id ? '#e3f2fd' : '#f9f9f9',
                          border: selectedOrderId === order._id ? '2px solid #007bff' : '1px solid #e0e0e0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                          if (selectedOrderId !== order._id) {
                            (e.currentTarget as HTMLElement).style.background = '#f0f0f0';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (selectedOrderId !== order._id) {
                            (e.currentTarget as HTMLElement).style.background = '#f9f9f9';
                          }
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{order.customerName}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          {order.customerEmail}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                          {formatDate(order.createdAt)}
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '4px' }}>
                          <span style={{ background: '#e0f2f1', color: '#00695c', padding: '2px 8px', borderRadius: '3px' }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 주문 상세정보 */}
              <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {selectedOrder ? (
                  <>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#1a1a1a' }}>
                      주문 상세정보
                    </h2>

                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>고객 정보</h3>
                      <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.8' }}>
                        <div><strong>이름:</strong> {selectedOrder.customerName}</div>
                        <div><strong>이메일:</strong> {selectedOrder.customerEmail}</div>
                        <div><strong>옷 색상:</strong> {selectedOrder.clothColor}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>주문 정보</h3>
                      <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.8' }}>
                        <div><strong>주문번호:</strong> {selectedOrder._id}</div>
                        <div><strong>상태:</strong> {selectedOrder.status}</div>
                        <div><strong>주문일시:</strong> {formatDate(selectedOrder.createdAt)}</div>
                        <div><strong>비고:</strong> {selectedOrder.notes}</div>
                      </div>
                    </div>

                    {/* 앞면 이미지 */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>👤 앞면 이미지</h3>
                        {selectedOrder.frontImageUrl && (
                          <button
                            onClick={() => downloadImage(selectedOrder.frontImageUrl, `앞면_${selectedOrder.customerName}`)}
                            style={{ padding: '4px 8px', fontSize: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            📥 다운로드
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {getImageArray(selectedOrder.frontImageUrl).map((img, idx) => (
                          <div key={idx} style={{ width: '120px', height: '120px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                            {img.startsWith('data:') || img.startsWith('http') ? (
                              <img
                                src={img}
                                alt={`front-${idx}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999' }}>
                                이미지 로드 불가
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 뒷면 이미지 */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>⭐ 뒷면 이미지</h3>
                        {selectedOrder.backImageUrl && (
                          <button
                            onClick={() => downloadImage(selectedOrder.backImageUrl, `뒷면_${selectedOrder.customerName}`)}
                            style={{ padding: '4px 8px', fontSize: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            📥 다운로드
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {getImageArray(selectedOrder.backImageUrl).map((img, idx) => (
                          <div key={idx} style={{ width: '120px', height: '120px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                            {img.startsWith('data:') || img.startsWith('http') ? (
                              <img
                                src={img}
                                alt={`back-${idx}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999' }}>
                                이미지 로드 불가
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    주문을 선택해주세요
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
