'use client';

import { useRef, useState } from 'react';

interface ImageDesignPanelProps {
  clothColor: string;
  onClothColorChange: (color: string) => void;
  onAddFrontImage?: (data: any) => void;
  onAddBackImage?: (data: any) => void;
}

export default function ImageDesignPanel({
  clothColor,
  onClothColorChange,
  onAddFrontImage,
  onAddBackImage,
}: ImageDesignPanelProps) {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [frontLoading, setFrontLoading] = useState(false);
  const [backLoading, setBackLoading] = useState(false);
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');

  const handleFileSelect = async (
    file: File,
    position: 'front' | 'back',
    callback?: (data: any) => void
  ) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택 가능합니다');
      return;
    }

    const isBack = position === 'back';
    if (isBack) {
      setBackLoading(true);
    } else {
      setFrontLoading(true);
    }

    try {
      // 미리보기 표시 (원본)
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isBack) {
          setBackPreview(e.target?.result as string);
        } else {
          setFrontPreview(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);

      // 이미지 저장
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      console.log('파일 업로드:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('업로드 응답:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || '파일 저장 실패');
      }

      const uploadResult = await uploadResponse.json();

      if (uploadResult.imageData && callback) {
        // Base64 이미지 데이터로 콜백
        callback({
          imageUrl: uploadResult.imageData,
          filename: uploadResult.filename,
          message: uploadResult.message,
        });

        console.log('Base64 변환 완료, 크기:', uploadResult.imageData.length);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '이미지 처리 중 오류 발생');
    } finally {
      if (isBack) {
        setBackLoading(false);
      } else {
        setFrontLoading(false);
      }
    }
  };

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, 'front', onAddFrontImage);
      if (frontInputRef.current) frontInputRef.current.value = '';
    }
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, 'back', onAddBackImage);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-orange-50 rounded-lg p-6" style={{ backgroundColor: '#F9F8F6' }}>
      <div className="space-y-6">
        {/* 옷 색상 */}
        <div>
          <h2 className="text-base font-bold mb-4" style={{ color: '#2C2A29' }}>옷 색상 선택</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: '흰색', value: 'white' },
            { name: '검정', value: 'black' },
            { name: '빨강', value: 'red' },
            { name: '노랑', value: 'yellow' },
            { name: '스카이', value: 'sky' },
          ].map((color) => (
            <button
              key={color.value}
              onClick={() => onClothColorChange(color.value)}
              className="p-3 rounded-lg font-semibold text-sm transition transform hover:scale-105"
              style={{
                backgroundColor: clothColor === color.value ? '#6E5F55' : 'white',
                color: clothColor === color.value ? 'white' : '#2C2A29',
                border: clothColor === color.value ? '2px solid #6E5F55' : '1px solid #D1C4B9'
              }}
            >
              {color.name}
            </button>
          ))}
        </div>
        </div>

        {/* 앞면 이미지 */}
        <div>
          <h2 className="text-base font-bold mb-4" style={{ color: '#2C2A29' }}>앞면 이미지</h2>
          <div className="space-y-3">
          <input
            ref={frontInputRef}
            type="file"
            accept="image/*"
            onChange={handleFrontFileChange}
            className="hidden"
          />

            <button
              onClick={() => frontInputRef.current?.click()}
              disabled={frontLoading}
              className="w-full p-3 rounded-lg font-semibold text-sm transition transform hover:scale-105 text-white"
              style={{
                backgroundColor: frontLoading ? '#e5e7eb' : '#6E5F55',
                color: frontLoading ? '#9ca3af' : 'white',
                cursor: frontLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {frontLoading ? '누끼 처리 중...' : '파일 선택'}
            </button>
          </div>
        </div>

        {/* 뒷면 이미지 */}
        <div>
          <h2 className="text-base font-bold mb-4" style={{ color: '#2C2A29' }}>뒷면 이미지</h2>
          <div className="space-y-3">
          <input
            ref={backInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackFileChange}
            className="hidden"
          />

            <button
              onClick={() => backInputRef.current?.click()}
              disabled={backLoading}
              className="w-full p-3 rounded-lg font-semibold text-sm transition transform hover:scale-105 text-white"
              style={{
                backgroundColor: backLoading ? '#e5e7eb' : '#6E5F55',
                color: backLoading ? '#9ca3af' : 'white',
                cursor: backLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {backLoading ? '누끼 처리 중...' : '파일 선택'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
