import { useEffect, useState, useCallback } from 'react';

/**
 * 시나리오 1: 라이브 커서 및 선택 영역 공유
 * 
 * Figma와 같은 실시간 커서 및 선택 상태 공유 기능
 * - 다른 사용자의 마우스 커서 실시간 표시
 * - 컴포넌트 선택 상태 공유 및 시각적 하이라이트
 * - 사용자별 고유 색상과 이름표 표시
 */
export function useLiveCursors(awareness, canvasRef) {
  const [otherCursors, setOtherCursors] = useState(new Map());
  const [otherSelections, setOtherSelections] = useState(new Map());

  // 마우스 움직임을 Awareness에 브로드캐스트
  const updateCursorPosition = useCallback((x, y, zoom = 100, viewport = 'desktop', containerRef = null, isLibraryOpen = true) => {
    if (!awareness) return;

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
      // canvasRef는 실제 캔버스 프레임을 가리키므로 별도 오프셋 계산 불필요
      const relativeX = (x - canvasRect.left) / scale;
      const relativeY = (y - canvasRect.top) / scale;
      
      // Awareness Protocol을 통해 커서 위치 브로드캐스트 (실제 캔버스 좌표)
      awareness.setLocalStateField('cursor', {
        x: relativeX,
        y: relativeY,
        zoom: zoom,
        viewport: viewport,
        timestamp: Date.now()
      });
    }
  }, [awareness, canvasRef]);

  // 컴포넌트 선택 상태를 Awareness에 브로드캐스트
  const updateSelection = useCallback((selectedComponentIds) => {
    if (!awareness) return;

    // 선택된 컴포넌트 ID 배열을 브로드캐스트
    awareness.setLocalStateField('selection', {
      componentIds: selectedComponentIds,
      timestamp: Date.now()
    });
  }, [awareness]);

  // 다른 사용자들의 상태 변화 감지 및 처리
  useEffect(() => {
    if (!awareness) return;

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const cursors = new Map();
      const selections = new Map();

      // 모든 활성 사용자의 상태를 순회
      states.forEach((state, clientId) => {
        // 자신의 상태는 제외
        if (clientId === awareness.clientID) return;

        const { user, cursor, selection } = state;
        
        if (user && cursor) {
          // 커서 정보 저장
          cursors.set(clientId, {
            x: cursor.x,
            y: cursor.y,
            user: {
              id: user.id,
              name: user.name,
              color: user.color
            },
            timestamp: cursor.timestamp
          });
        }

        if (user && selection) {
          // 선택 정보 저장
          selections.set(clientId, {
            componentIds: selection.componentIds || [],
            user: {
              id: user.id,
              name: user.name,
              color: user.color
            },
            timestamp: selection.timestamp
          });
        }
      });

      setOtherCursors(cursors);
      setOtherSelections(selections);
    };

    // Awareness 변화 이벤트 리스너 등록
    awareness.on('change', handleAwarenessChange);

    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [awareness]);

  // 마우스 이벤트 핸들러는 NoCodeEditor에서 직접 호출하도록 변경
  // (줌과 뷰포트 정보에 접근하기 위해)

  return {
    otherCursors: Array.from(otherCursors.values()),
    otherSelections: Array.from(otherSelections.values()),
    updateSelection,
    updateCursorPosition
  };
} 