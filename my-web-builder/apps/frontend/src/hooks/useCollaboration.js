import { useEffect, useRef } from 'react';
import { useYjsCollaboration } from './useYjsCollaboration';
import { useLiveCursors } from './useLiveCursors';
import { API_BASE_URL } from '../config';

/**
 * 통합 협업 훅 - 모든 Y.js 협업 기능을 하나로 관리
 *
 * 이 훅은 3가지 핵심 협업 시나리오를 모두 제공합니다:
 * 1. 라이브 커서 및 선택 영역 공유
 * 2. 컴포넌트 단위 주석 및 토론
 * 3. 버전 히스토리 및 스냅샷 복원
 */
export function useCollaboration({
  roomId,
  userInfo,
  canvasRef,
  selectedComponentId,
  onComponentsUpdate,
  viewport = 'desktop',
}) {
  // Y.js 기본 인프라 설정
  const { ydoc, provider, awareness, isConnected, connectionError } = useYjsCollaboration(
    roomId,
    userInfo
  );

  // 라이브 커서 관리
  const {
    otherCursors,
    otherSelections,
    updateSelection,
    updateCursorPosition,
  } = useLiveCursors(awareness, canvasRef);

  // DB 복구 상태 추적
  const hasRestoredRef = useRef(false);

  // DB에서 복구하는 함수
  const restoreFromDatabase = async (roomId, yArray) => {
    try {
      console.log('🔄 DB에서 복구 시도...');
      const response = await fetch(
        `${API_BASE_URL}/users/pages/room/${roomId}/content`
      );
      if (response.ok) {
        const data = await response.json();

        // content 구조 처리
        let components = [];
        if (data.content && typeof data.content === 'object') {
          // 새로운 형식: { components: [], canvasSettings: {} }
          components = data.content.components || [];
        } else if (Array.isArray(data.content)) {
          // 이전 형식: content가 직접 배열인 경우
          components = data.content;
        } else if (Array.isArray(data.components)) {
          // 또 다른 형식: { components: [] }
          components = data.components;
        }

        if (components.length > 0) {
          console.log('✅ DB에서 복구:', components.length, '개 컴포넌트');

          // 기존 ID를 유지하되, 없는 경우에만 새로 생성
          const componentsWithIds = components.map((component) => {
            if (!component.id) {
              const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${(userInfo && userInfo.id) || 'anonymous'}`;
              return { ...component, id: uniqueId };
            }
            return component;
          });

          console.log(
            '복구할 컴포넌트 ID들:',
            componentsWithIds.map((c) => c.id)
          );

          if (yArray) {
            // Y.js 문서에 직접 삽입
            yArray.insert(0, componentsWithIds);
          } else {
            // 로컬 모드: 직접 상태 업데이트
            onComponentsUpdate && onComponentsUpdate(componentsWithIds);
          }
          return true;
        }
      }
    } catch (error) {
      console.error('DB 복구 실패:', error);
    }
    console.log('📝 새 문서 시작 (복구 실패 또는 데이터 없음)');
    return false;
  };

  // 컴포넌트 데이터 동기화를 위한 Y.Array 설정
  const componentsArrayRef = useRef(null);

  useEffect(() => {
    if (!ydoc) return;

    // Y.js에서 컴포넌트 데이터를 관리하는 Y.Array 생성
    const yComponents =
      ydoc && ydoc.getArray ? ydoc.getArray('components') : null;
    if (!yComponents) return;
    componentsArrayRef.current = yComponents;

    // 컴포넌트 변화 감지 및 React 상태 업데이트
    const handleComponentsChange = () => {
      try {
        const componentsData = yComponents.toArray();

        // 중복 ID 제거 (같은 ID를 가진 첫 번째 컴포넌트만 유지)
        const uniqueComponents = componentsData.filter((comp, index, arr) => {
          const firstIndex = arr.findIndex((c) => c.id === comp.id);
          return firstIndex === index;
        });

        if (uniqueComponents.length !== componentsData.length) {
          console.log(
            '중복 컴포넌트 제거:',
            componentsData.length - uniqueComponents.length,
            '개'
          );
          // 중복이 있으면 Y.js 배열을 정리
          ydoc &&
            ydoc.transact(() => {
              yComponents.delete(0, yComponents.length);
              yComponents.insert(0, uniqueComponents);
            });
        }

        onComponentsUpdate && onComponentsUpdate(uniqueComponents);
      } catch (error) {
        console.error('컴포넌트 데이터 업데이트 중 오류:', error);
      }
    };

    // 초기 데이터 로드
    handleComponentsChange();

    try {
      yComponents.observe(handleComponentsChange);
    } catch (error) {
      console.error('Y.js 컴포넌트 리스너 등록 실패:', error);
    }

    return () => {
      try {
        yComponents.unobserve(handleComponentsChange);
      } catch (error) {
        console.error('Y.js 컴포넌트 리스너 해제 실패:', error);
      }
    };
  }, [ydoc, onComponentsUpdate, isConnected, roomId]);

  // Y.js 연결 완료 후 복구 처리
  useEffect(() => {
    if (!ydoc || hasRestoredRef.current) return;

    const yComponents =
      ydoc && ydoc.getArray ? ydoc.getArray('components') : null;
    if (!yComponents) return;

    // 연결 완료 후 Y.js 문서가 비어있으면 복구
    if (yComponents.length === 0) {
      console.log('🔗 Y.js 연결 완료, 복구 시작...');
      hasRestoredRef.current = true;
      restoreFromDatabase(roomId, yComponents);
    } else {
      console.log(
        '🔗 Y.js 연결 완료, 기존 데이터 있음:',
        yComponents.length,
        '개 컴포넌트'
      );
      console.log(
        '기존 컴포넌트 ID들:',
        yComponents.toArray().map((c) => c.id)
      );
      hasRestoredRef.current = true;
    }
  }, [ydoc, roomId]);

  // 연결 오류 시 로컬 모드 활성화
  useEffect(() => {
    if (connectionError) {
      console.log('🔴 협업 연결 오류로 인해 로컬 모드로 전환');
      // 로컬 상태에서 컴포넌트 데이터를 유지하기 위해 DB에서 복구 시도
      if (!hasRestoredRef.current) {
        hasRestoredRef.current = true;
        // 로컬 상태로 복구 (Y.js 없이)
        restoreFromDatabase(roomId, null);
      }
    }
  }, [connectionError, roomId]);

  // 선택된 컴포넌트 변화를 Awareness에 반영
  useEffect(() => {
    if (selectedComponentId) {
      updateSelection([selectedComponentId], viewport);
    } else {
      updateSelection([], viewport);
    }
  }, [selectedComponentId, updateSelection, viewport]);

  // 컴포넌트 업데이트 함수 (Y.js 동기화 또는 로컬 모드)
  const updateComponent = (componentId, updates) => {
    // 연결 오류 시 로컬 모드로 작동
    if (connectionError || !componentsArrayRef.current) {
      console.log('🔴 로컬 모드로 컴포넌트 업데이트:', componentId);
      // 로컬 모드에서는 단순히 콜백만 호출하고 상위 컴포넌트에서 처리
      return;
    }

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();

    const componentIndex = components.findIndex((c) => c.id === componentId);

    if (componentIndex !== -1) {
      const existingComponent = components[componentIndex];

      // 업데이트할 속성만 병합
      const updatedComponent = {
        ...existingComponent,
        ...updates,
        // ID는 변경하지 않음 (고유성 유지)
        id: existingComponent.id,
      };

      try {
        // 트랜잭션으로 안전하게 업데이트
        ydoc &&
          ydoc.transact(() => {
            yComponents.delete(componentIndex, 1);
            yComponents.insert(componentIndex, [updatedComponent]);
          });
      } catch (error) {
        console.error('Y.js 업데이트 실패:', error);
      }
    } else {
      // 컴포넌트가 Y.js에 없으면 추가 시도
      const componentToAdd = { ...updates, id: componentId };
      addComponent(componentToAdd);
    }
  };

  // 컴포넌트 추가 함수
  const addComponent = (component) => {
    if (!componentsArrayRef.current) {
      console.warn('Y.js 배열이 아직 준비되지 않아 컴포넌트를 추가할 수 없습니다.');
      return;
    }

    // 이미 ID가 있으면 유지, 없으면 새로 생성
    const componentWithId = component.id
      ? component
      : {
          ...component,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${(userInfo && userInfo.id) || 'anonymous'}`,
        };

    componentsArrayRef.current.push([componentWithId]);
  };

  // 컴포넌트 삭제 함수
  const removeComponent = (componentId) => {
    if (!componentsArrayRef.current) return;

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    const componentIndex = components.findIndex((c) => c.id === componentId);

    if (componentIndex !== -1) {
      yComponents.delete(componentIndex, 1);
    }
  };

  // 전체 컴포넌트 배열 업데이트 (대량 변경 시 사용)
  const updateAllComponents = (newComponents) => {
    if (!componentsArrayRef.current) return;

    const yComponents = componentsArrayRef.current;

    // 각 컴포넌트에 고유한 ID가 있는지 확인하고, 없으면 생성
    const componentsWithUniqueIds = newComponents.map((component) => {
      if (!component.id) {
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${(userInfo && userInfo.id) || 'anonymous'}`;
        return { ...component, id: uniqueId };
      }
      return component;
    });

    // 트랜잭션으로 묶어서 한 번에 업데이트
    ydoc &&
      ydoc.transact(() => {
        yComponents.delete(0, yComponents.length);
        yComponents.insert(0, componentsWithUniqueIds);
      });
  };

  // 현재 활성 사용자 목록 가져오기
  const getActiveUsers = () => {
    if (!awareness) return [];

    const states = awareness.getStates();
    const users = [];

    states.forEach((state, clientId) => {
      if (state.user && clientId !== awareness.clientID) {
        users.push({
          id: state.user.id,
          name: state.user.name,
          color: state.user.color,
          clientId,
          isActive: true,
        });
      }
    });

    return users;
  };

  return {
    // 연결 상태
    isConnected,
    connectionError,

    // 라이브 커서 및 선택
    otherCursors,
    otherSelections,
    updateCursorPosition,
    updateSelection,

    // 컴포넌트 동기화
    updateComponent,
    addComponent,
    removeComponent,
    updateAllComponents,

    // 사용자 관리
    getActiveUsers,

    // Y.js 원시 접근 (고급 사용자용)
    ydoc,
    provider,
    awareness,
  };
}
