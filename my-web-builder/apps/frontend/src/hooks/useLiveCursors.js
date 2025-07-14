import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

/**
 * 성능 최적화된 라이브 커서 훅
 * 
 * 최적화 사항:
 * 1. 커서 업데이트 쓰로틀링 (16ms = 60fps)
 * 2. 불필요한 리렌더링 방지
 * 3. 메모리 누수 방지
 * 4. 배치 업데이트 최적화
 */
export function useLiveCursors(awareness, canvasRef) {
  const [otherCursors, setOtherCursors] = useState(new Map());
  const [otherSelections, setOtherSelections] = useState(new Map());
  
  // 쓰로틀링을 위한 ref들
  const lastCursorUpdateRef = useRef(0);
  const cursorThrottleMs = 16; // 60fps
  const lastSelectionUpdateRef = useRef(0);
  const selectionThrottleMs = 100; // 선택 업데이트는 더 느리게

  // 디바운스된 상태 업데이트
  const updateStateRef = useRef(null);

  // 마우스 움직임을 Awareness에 브로드캐스트 (쓰로틀링 적용)
  const updateCursorPosition = useCallback(
    (
      x,
      y,
      zoom = 100,
      viewport = 'desktop',
      containerRef = null,
      isLibraryOpen = true
    ) => {
      if (!awareness) return;

      const now = Date.now();
      
      // 쓰로틀링 체크
      if (now - lastCursorUpdateRef.current < cursorThrottleMs) {
        return;
      }
      lastCursorUpdateRef.current = now;

      // 커서 숨기기 (x, y가 null인 경우)
      if (x === null || y === null) {
        awareness.setLocalStateField('cursor', null);
        return;
      }

      // 실제 캔버스 프레임 기준 상대 좌표로 변환
      const canvasRect = canvasRef?.current?.getBoundingClientRect();

      if (canvasRect) {
        const scale = zoom / 100;

        // 브라우저 화면 좌표를 캔버스 프레임 내부 좌표로 직접 변환
        const relativeX = (x - canvasRect.left) / scale;
        const relativeY = (y - canvasRect.top) / scale;

        // Awareness Protocol을 통해 커서 위치 브로드캐스트
        awareness.setLocalStateField('cursor', {
          x: relativeX,
          y: relativeY,
          zoom: zoom,
          viewport: viewport,
          timestamp: now,
        });
      }
    },
    [awareness, canvasRef]
  );

  // 컴포넌트 선택 상태를 Awareness에 브로드캐스트 (쓰로틀링 적용)
  const updateSelection = useCallback(
    (selectedComponentIds, viewport = 'desktop') => {
      if (!awareness) return;

      const now = Date.now();
      
      // 선택 업데이트는 더 느리게 쓰로틀링
      if (now - lastSelectionUpdateRef.current < selectionThrottleMs) {
        return;
      }
      lastSelectionUpdateRef.current = now;

      // 선택된 컴포넌트 ID 배열과 뷰포트 정보를 브로드캐스트
      awareness.setLocalStateField('selection', {
        componentIds: selectedComponentIds,
        viewport: viewport,
        timestamp: now,
      });
    },
    [awareness]
  );

  // 디바운스된 상태 업데이트 함수
  const debouncedUpdateState = useCallback((cursors, selections) => {
    if (updateStateRef.current) {
      clearTimeout(updateStateRef.current);
    }
    
    updateStateRef.current = setTimeout(() => {
      setOtherCursors(cursors);
      setOtherSelections(selections);
      updateStateRef.current = null;
    }, 16); // 60fps
  }, []);

  // 다른 사용자들의 상태 변화 감지 및 처리 (최적화됨)
  useEffect(() => {
    if (!awareness) return;

    let isProcessing = false;

    const handleAwarenessChange = () => {
      // 중복 처리 방지
      if (isProcessing) return;
      isProcessing = true;

      try {
        const states = awareness.getStates();
        const cursors = new Map();
        const selections = new Map();
        const now = Date.now();

        // 모든 활성 사용자의 상태를 순회
        states.forEach((state, clientId) => {
          // 자신의 상태는 제외
          if (clientId === awareness.clientID) return;

          const { user, cursor, selection } = state;

          // 커서 정보 처리 (최근 5초 내 데이터만)
          if (user && cursor && (now - cursor.timestamp) < 5000) {
            cursors.set(clientId, {
              x: cursor.x,
              y: cursor.y,
              user: {
                id: user.id,
                name: user.name,
                color: user.color,
              },
              timestamp: cursor.timestamp,
            });
          }

          // 선택 정보 처리 (최근 10초 내 데이터만)
          if (user && selection && (now - selection.timestamp) < 10000) {
            selections.set(clientId, {
              componentIds: selection.componentIds || [],
              viewport: selection.viewport || 'desktop',
              user: {
                id: user.id,
                name: user.name,
                color: user.color,
              },
              timestamp: selection.timestamp,
            });
          }
        });

        // 디바운스된 상태 업데이트
        debouncedUpdateState(cursors, selections);
      } catch (error) {
        console.error('Awareness 상태 처리 오류:', error);
      } finally {
        isProcessing = false;
      }
    };

    // Awareness 변화 이벤트 리스너 등록
    awareness.on('change', handleAwarenessChange);

    return () => {
      awareness.off('change', handleAwarenessChange);
      if (updateStateRef.current) {
        clearTimeout(updateStateRef.current);
      }
    };
  }, [awareness, debouncedUpdateState]);

  // 메모이제이션된 반환값
  const memoizedCursors = useMemo(() => Array.from(otherCursors.values()), [otherCursors]);
  const memoizedSelections = useMemo(() => Array.from(otherSelections.values()), [otherSelections]);

  return {
    otherCursors: memoizedCursors,
    otherSelections: memoizedSelections,
    updateSelection,
    updateCursorPosition,
  };
}
