import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../config';

/**
 * 자동저장 Hook (Y.js 백업용)
 * @param {string} roomId - 방 ID (페이지 ID와 동일)
 * @param {Array} components - 컴포넌트 배열
 * @param {number} canvasHeight - 캔버스 높이
 * @param {number} debounceMs - 디바운스 시간 (기본 2초)
 */
function useAutoSave(roomId, components, canvasHeight, debounceMs = 2000) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveCount, setSaveCount] = useState(0);

  const timeoutRef = useRef(null);
  const lastDataRef = useRef(null);
  const lastSaveTimeRef = useRef(0);

  // 서버에 저장하는 함수
  const saveToServer = useCallback(
    async (components) => {
      if (!roomId) return;

      // 마지막 저장 후 1초 이내면 저장하지 않음
      const now = Date.now();
      if (now - lastSaveTimeRef.current < 1000) {
        return;
      }

      try {
        setIsSaving(true);
        setSaveError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('인증 토큰이 없습니다.');
        }

        const response = await fetch(
          `${API_BASE_URL}/users/pages/room/${roomId}/content`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              components: components,
              canvasSettings: {
                canvasHeight: canvasHeight
              }
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`저장 실패: ${response.status}`);
        }

        const result = await response.json();
        setLastSaved(new Date());
        setSaveCount((prev) => prev + 1);
        lastSaveTimeRef.current = now;

        console.log('✅ 자동저장 완료:', result);
      } catch (error) {
        console.error('❌ 자동저장 실패:', error);
        setSaveError(error.message);
      } finally {
        setIsSaving(false);
      }
    },
    [roomId, canvasHeight]
  );

  // 디바운스된 자동저장 (컴포넌트 변경 시에만)
  const debouncedSave = useCallback(
    (components) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveToServer(components);
      }, debounceMs);
    },
    [saveToServer, debounceMs]
  );

  // 수동 저장 (즉시 실행)
  const saveNow = useCallback(() => {
    if (!roomId || !components) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    saveToServer(components);
  }, [roomId, components, saveToServer]);

  // 컴포넌트나 캔버스 높이가 변경될 때만 자동저장 (주기적 저장 제거)
  useEffect(() => {
    if (!roomId || !components) return;

    const currentData = {
      components,
      canvasHeight
    };
    const currentDataStr = JSON.stringify(currentData);
    
    // 데이터가 실제로 변경되었을 때만 저장
    if (lastDataRef.current !== currentDataStr) {
      lastDataRef.current = currentDataStr;
      debouncedSave(components);
    }
  }, [roomId, components, canvasHeight, debouncedSave]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    saveError,
    saveCount,
    saveNow,
  };
}

export default useAutoSave;
