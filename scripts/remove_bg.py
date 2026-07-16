#!/usr/bin/env python3
import sys
import cv2
import numpy as np
import json

def remove_background(input_path, output_path):
    """
    OpenCV를 사용하여 배경 제거
    흰색 배경을 투명하게 변환
    """
    try:
        # 이미지 읽기
        img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)

        if img is None:
            return {"error": "이미지를 읽을 수 없습니다"}

        # RGBA가 아니면 RGBA로 변환
        if len(img.shape) < 3 or img.shape[2] != 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

        height, width = img.shape[:2]

        # BGR 채널과 알파 채널 분리
        b, g, r, a = cv2.split(img)
        bgr = cv2.merge([b, g, r])

        # BGR을 HSV로 변환
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

        # 흰색 배경 감지 (정확한 범위)
        lower_white = np.array([0, 0, 180])
        upper_white = np.array([180, 30, 255])

        # 마스크 생성
        mask = cv2.inRange(hsv, lower_white, upper_white)
        mask_inv = cv2.bitwise_not(mask)

        # 모폴로지 연산으로 노이즈 제거
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask_inv = cv2.morphologyEx(mask_inv, cv2.MORPH_CLOSE, kernel, iterations=2)
        mask_inv = cv2.morphologyEx(mask_inv, cv2.MORPH_OPEN, kernel, iterations=1)

        # 하단 정리 (마지막 30픽셀만 추가 처리)
        # 하단의 그라데이션 처리
        bottom_region = mask_inv[height-30:height, :]
        bottom_blur = cv2.GaussianBlur(bottom_region, (7, 7), 2)
        mask_inv[height-30:height, :] = bottom_blur

        # 경계선 부드럽게 (가우시안 블러)
        mask_smooth = cv2.GaussianBlur(mask_inv, (5, 5), 1)

        # 알파 채널 업데이트
        alpha_new = mask_smooth

        # BGRA 이미지 생성
        result = cv2.merge([b, g, r, alpha_new])

        # PNG로 저장
        cv2.imwrite(output_path, result, [cv2.IMWRITE_PNG_COMPRESSION, 9])

        return {"success": True, "message": "배경 제거 완료"}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "인자가 부족합니다"}))
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    result = remove_background(input_path, output_path)
    print(json.dumps(result, ensure_ascii=False))
