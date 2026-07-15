'use client';

import { useRef, useEffect, useState } from 'react';

interface DesignElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  src: string;
}

interface KonvaCanvasProps {
  elements: DesignElement[];
  clothColor: string;
  clothImageUrl?: string;
  onUpdateElement?: (id: string, updates: Partial<DesignElement>) => void;
  onDeleteElement?: (id: string) => void;
}

interface SelectionBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function KonvaCanvas({
  elements,
  clothColor,
  clothImageUrl,
  onUpdateElement,
  onDeleteElement,
}: KonvaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [clothImg, setClothImg] = useState<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState<{
    id: string;
    startX: number;
    startY: number;
  } | null>(null);
  const [resizing, setResizing] = useState<{
    id: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const [rotating, setRotating] = useState<{
    id: string;
    startRotation: number;
    centerX: number;
    centerY: number;
    startAngle: number;
  } | null>(null);

  const CANVAS_WIDTH = 480;
  const [CANVAS_HEIGHT, setCANVAS_HEIGHT] = useState(1143);

  // 옷 이미지 로드
  useEffect(() => {
    if (clothImageUrl) {
      const img = new Image();
      img.src = clothImageUrl;
      img.onload = () => {
        setClothImg(img);
        // 이미지 aspect ratio에 맞춰 캔버스 높이 조정
        const ratio = img.naturalHeight / img.naturalWidth;
        setCANVAS_HEIGHT(Math.round(CANVAS_WIDTH * ratio));
      };
    }
  }, [clothImageUrl]);

  // 디자인 요소 이미지 로드
  useEffect(() => {
    elements.forEach((element) => {
      if (!images[element.id]) {
        const img = new Image();
        img.src = element.src;
        img.onload = () => {
          setImages((prev) => ({ ...prev, [element.id]: img }));
        };
      }
    });
  }, [elements, images]);

  // 캔버스 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // 배경색
    ctx.fillStyle = clothColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 옷 이미지 (aspect ratio 유지)
    if (clothImg) {
      ctx.drawImage(clothImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // 테두리
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 요소 그리기
    elements.forEach((element) => {
      if (images[element.id]) {
        ctx.save();
        ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.drawImage(images[element.id], -element.width / 2, -element.height / 2, element.width, element.height);
        ctx.restore();
      }

      // 선택된 요소 테두리
      if (element.id === selectedId) {
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);

        // 리사이즈 핸들 (우측 하단) - 더 크게
        const resizeHandleSize = 20;
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(
          element.x + element.width - resizeHandleSize,
          element.y + element.height - resizeHandleSize,
          resizeHandleSize,
          resizeHandleSize
        );

        // 핸들 배경 (더 큰 범위)
        ctx.fillStyle = 'rgba(0, 102, 255, 0.1)';
        ctx.fillRect(
          element.x + element.width - 35,
          element.y + element.height - 35,
          35,
          35
        );

        // 핸들 안의 아이콘
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↖', element.x + element.width - 10, element.y + element.height - 10);

        // 회전 핸들 (상단 중앙) - 더 크게
        const rotateHandleRadius = 35;
        const rotateHandleX = element.x + element.width / 2;
        const rotateHandleY = element.y - rotateHandleRadius;
        const handleRadius = 10;

        // 회전 핸들 배경 (더 큰 범위)
        ctx.fillStyle = 'rgba(0, 102, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(rotateHandleX, rotateHandleY, 20, 0, Math.PI * 2);
        ctx.fill();

        // 회전 핸들 선
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(element.x + element.width / 2, element.y);
        ctx.lineTo(rotateHandleX, rotateHandleY);
        ctx.stroke();

        // 회전 핸들 원
        ctx.fillStyle = '#0066ff';
        ctx.beginPath();
        ctx.arc(rotateHandleX, rotateHandleY, handleRadius, 0, Math.PI * 2);
        ctx.fill();

        // 회전 핸들 테두리
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rotateHandleX, rotateHandleY, handleRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [elements, selectedId, images, clothColor, clothImg]);

  // 마우스 이벤트
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 요소 선택 (뒤에서 앞으로)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      const resizeHandleSize = 35;
      const rotateHandleRadius = 35;
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;

      // 리사이즈 핸들 우선 확인 (우측 하단)
      if (
        x >= element.x + element.width - resizeHandleSize &&
        x <= element.x + element.width + 5 &&
        y >= element.y + element.height - resizeHandleSize &&
        y <= element.y + element.height + 5
      ) {
        setSelectedId(element.id);
        setResizing({
          id: element.id,
          startX: x,
          startY: y,
          startWidth: element.width,
          startHeight: element.height,
        });
        return;
      }

      // 회전 핸들 확인 (Shift 누르거나 상단 중앙)
      const rotateHandleX = element.x + element.width / 2;
      const rotateHandleY = element.y - rotateHandleRadius;
      const distToRotateHandle = Math.sqrt(
        Math.pow(x - rotateHandleX, 2) +
          Math.pow(y - rotateHandleY, 2)
      );

      if (distToRotateHandle <= 20 || e.shiftKey) {
        const startAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        setSelectedId(element.id);
        setRotating({
          id: element.id,
          startRotation: element.rotation,
          centerX,
          centerY,
          startAngle,
        });
        return;
      }

      // 요소 내부 확인
      if (
        x >= element.x &&
        x <= element.x + element.width &&
        y >= element.y &&
        y <= element.y + element.height
      ) {
        setSelectedId(element.id);

        // Shift + 드래그 = 회전
        if (e.shiftKey) {
          const startAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
          setRotating({
            id: element.id,
            startRotation: element.rotation,
            centerX,
            centerY,
            startAngle,
          });
          return;
        }

        // 드래그 시작
        setDragging({
          id: element.id,
          startX: x - element.x,
          startY: y - element.y,
        });
        return;
      }
    }

    setSelectedId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rotating) {
      const element = elements.find((el) => el.id === rotating.id);
      if (element && onUpdateElement) {
        const currentAngle = Math.atan2(y - rotating.centerY, x - rotating.centerX) * (180 / Math.PI);
        const deltaAngle = currentAngle - rotating.startAngle;
        const newRotation = rotating.startRotation + deltaAngle;

        onUpdateElement(rotating.id, {
          rotation: newRotation % 360,
        });
      }
      canvas.style.cursor = 'grab';
      return;
    }

    if (resizing) {
      const element = elements.find((el) => el.id === resizing.id);
      if (element && onUpdateElement) {
        const deltaX = x - resizing.startX;
        const deltaY = y - resizing.startY;
        const newWidth = Math.max(50, resizing.startWidth + deltaX);
        const newHeight = Math.max(50, resizing.startHeight + deltaY);

        onUpdateElement(resizing.id, {
          width: newWidth,
          height: newHeight,
        });
      }
      canvas.style.cursor = 'nwse-resize';
      return;
    }

    if (dragging) {
      const element = elements.find((el) => el.id === dragging.id);
      if (element && onUpdateElement) {
        onUpdateElement(dragging.id, {
          x: Math.max(0, x - dragging.startX),
          y: Math.max(0, y - dragging.startY),
        });
      }
      canvas.style.cursor = 'move';
      return;
    }

    // 커서 변경
    for (const element of elements) {
      const resizeHandleSize = 35;
      const rotateHandleRadius = 35;
      const rotateHandleX = element.x + element.width / 2;
      const rotateHandleY = element.y - rotateHandleRadius;
      const distToRotateHandle = Math.sqrt(
        Math.pow(x - rotateHandleX, 2) + Math.pow(y - rotateHandleY, 2)
      );

      if (distToRotateHandle <= 20) {
        canvas.style.cursor = 'grab';
        return;
      }

      if (
        x >= element.x + element.width - resizeHandleSize &&
        x <= element.x + element.width + 5 &&
        y >= element.y + element.height - resizeHandleSize &&
        y <= element.y + element.height + 5
      ) {
        canvas.style.cursor = 'nwse-resize';
        return;
      }
      if (
        x >= element.x &&
        x <= element.x + element.width &&
        y >= element.y &&
        y <= element.y + element.height
      ) {
        canvas.style.cursor = 'move';
        return;
      }
    }

    canvas.style.cursor = 'default';
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
    setRotating(null);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (selectedId && onDeleteElement) {
      onDeleteElement(selectedId);
      setSelectedId(null);
    }
  };

  const handleDelete = () => {
    if (selectedId && onDeleteElement) {
      onDeleteElement(selectedId);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="w-full border-2 border-gray-300 rounded overflow-hidden bg-gray-100"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={handleContextMenu}
          className="cursor-default"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, display: 'block', border: '2px solid #ddd' }}
        />
      </div>

      {/* 조작 안내 및 삭제 버튼 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-600 space-y-1 mb-3">
          <p>✓ 클릭: 선택</p>
          <p>✓ 드래그: 위치 이동</p>
          <p>✓ 우측하단 핸들: 크기 조절</p>
          <p>✓ 상단 원형 핸들: 회전 (Shift+드래그도 가능)</p>
        </div>

        {selectedId && (
          <button
            onClick={handleDelete}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition"
          >
            🗑️ 삭제 (우클릭도 가능)
          </button>
        )}
      </div>
    </div>
  );
}
