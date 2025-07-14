import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useYjsCollaboration } from './useYjsCollaboration';
import { useLiveCursors } from './useLiveCursors';
import { API_BASE_URL } from '../config';

/**
 * 성능 최적화된 통합 협업 훅
 * 
 * 최적화 사항:
 * 1. 컴포넌트 업데이트 배치 처리
 * 2. 메모이제이션을 통한 불필요한 리렌더링 방지
 * 3. 중복 처리 방지
 * 4. 메모리 누수 방지
 * 5. 초기 데이터 로드 최적화
 * 6. 모든 사용자에게 즉시 동기화
 */
export function useCollaboration({
  roomId,
  userInfo,
  canvasRef,
  selectedComponentId,
  onComponentsUpdate,
  viewport = 'desktop',
}) {
  // 기본값 보장 - 모든 매개변수가 안전한 값을 가지도록 보장
  const safeUserInfo = userInfo || { id: 'anonymous', name: 'Anonymous', color: '#000000' };
  const safeRoomId = roomId || 'default-room';
  const safeCanvasRef = canvasRef || { current: null };
  const safeSelectedComponentId = selectedComponentId || null;
  const safeOnComponentsUpdate = onComponentsUpdate || (() => {});
  const safeViewport = viewport || 'desktop';
  
  // Y.js 기본 인프라 설정 (항상 호출)
  const { ydoc, provider, awareness, isConnected, connectionError } = useYjsCollaboration(
    safeRoomId,
    safeUserInfo
  );

  // 라이브 커서 관리 (항상 호출)
  const {
    otherCursors,
    otherSelections,
    updateSelection,
    updateCursorPosition,
  } = useLiveCursors(awareness, safeCanvasRef);

  // DB 복구 상태 추적
  const hasRestoredRef = useRef(false);
  const isProcessingRef = useRef(false);
  const batchUpdateRef = useRef(null);
  const initialLoadRef = useRef(false);
  const initialSyncRef = useRef(false);

  // 배치 업데이트 함수
  const batchUpdate = useCallback((components) => {
    if (batchUpdateRef.current) {
      clearTimeout(batchUpdateRef.current);
    }
    
    batchUpdateRef.current = setTimeout(() => {
      safeOnComponentsUpdate(components);
      batchUpdateRef.current = null;
    }, 8); // 120fps로 더 빠른 업데이트
  }, [safeOnComponentsUpdate]);

  // DB에서 복구하는 함수 (최적화됨)
  const restoreFromDatabase = useCallback(async (roomId, yArray) => {
    if (isProcessingRef.current) return false;
    isProcessingRef.current = true;

    try {
      console.log('🔄 DB에서 복구 시도...');
      const response = await fetch(
        `${API_BASE_URL}/users/pages/room/${roomId}/content`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('📊 DB 응답 데이터 구조:', {
          hasContent: !!data.content,
          contentType: typeof data.content,
          isArray: Array.isArray(data.content),
          hasComponents: !!(data.content && data.content.components),
          componentsLength: data.content?.components?.length || 0
        });

        // content 구조 처리 (템플릿과 페이지 구조 모두 지원)
        let components = [];
        if (data.content && typeof data.content === 'object' && !Array.isArray(data.content)) {
          // 새로운 구조: {components: [], canvasSettings: {}}
          components = data.content.components || [];
          console.log('📋 새로운 구조에서 컴포넌트 추출:', components.length, '개');
        } else if (Array.isArray(data.content)) {
          // 기존 구조: 컴포넌트 배열
          components = data.content;
          console.log('📋 기존 배열 구조에서 컴포넌트 추출:', components.length, '개');
        } else if (Array.isArray(data.components)) {
          // 대체 구조: data.components
          components = data.components;
          console.log('📋 대체 구조에서 컴포넌트 추출:', components.length, '개');
        }

        if (components.length > 0) {
          console.log('✅ DB에서 복구:', components.length, '개 컴포넌트');

          // 기존 ID를 유지하되, 없는 경우에만 새로 생성
          const componentsWithIds = components.map((component) => {
            if (!component.id) {
              const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${safeUserInfo.id}`;
              return { ...component, id: uniqueId };
            }
            return component;
          });

          if (yArray) {
            // Y.js 문서에 직접 삽입
            yArray.insert(0, componentsWithIds);
          } else {
            // 로컬 모드: 즉시 업데이트
            safeOnComponentsUpdate(componentsWithIds);
          }
          console.log('✅ DB에서 복구 완료:', componentsWithIds.length, '개 컴포넌트');
          return true;
        }
      }
    } catch (error) {
      console.error('DB 복구 실패:', error);
    } finally {
      isProcessingRef.current = false;
    }
    console.log('📝 새 문서 시작 (복구 실패 또는 데이터 없음)');
    return false;
  }, [safeUserInfo, safeOnComponentsUpdate]);

  // 컴포넌트 데이터 동기화를 위한 Y.Array 설정
  const componentsArrayRef = useRef(null);
  
  // 캔버스 설정 동기화를 위한 Y.Map 설정
  const canvasSettingsRef = useRef(null);

  // 초기 데이터를 Y.js로 동기화하는 함수
  const syncInitialDataToYjs = useCallback(async () => {
    if (!ydoc || !componentsArrayRef.current || initialSyncRef.current) return;
    
    console.log('🔄 초기 데이터를 Y.js로 동기화 시작...');
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/pages/room/${safeRoomId}/content`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 초기 동기화 데이터 구조:', {
          hasContent: !!data.content,
          contentType: typeof data.content,
          isArray: Array.isArray(data.content),
          hasComponents: !!(data.content && data.content.components),
          componentsLength: data.content?.components?.length || 0
        });
        
        let components = [];
        
        // content 구조 처리 (템플릿과 페이지 구조 모두 지원)
        if (data.content && typeof data.content === 'object' && !Array.isArray(data.content)) {
          // 새로운 구조: {components: [], canvasSettings: {}}
          components = data.content.components || [];
          console.log('📋 새로운 구조에서 컴포넌트 추출:', components.length, '개');
        } else if (Array.isArray(data.content)) {
          // 기존 구조: 컴포넌트 배열
          components = data.content;
          console.log('📋 기존 배열 구조에서 컴포넌트 추출:', components.length, '개');
        } else if (Array.isArray(data.components)) {
          // 대체 구조: data.components
          components = data.components;
          console.log('📋 대체 구조에서 컴포넌트 추출:', components.length, '개');
        }

        if (components.length > 0) {
          const yComponents = componentsArrayRef.current;
          
          // Y.js 트랜잭션으로 초기 데이터 동기화
          ydoc.transact(() => {
            yComponents.delete(0, yComponents.length);
            yComponents.insert(0, components);
          });
          
          initialSyncRef.current = true;
          console.log('✅ 초기 데이터 Y.js 동기화 완료:', components.length, '개 컴포넌트');
          
          // 모든 사용자에게 즉시 동기화 완료 알림
          setTimeout(() => {
            const componentsData = yComponents.toArray();
            safeOnComponentsUpdate(componentsData);
          }, 100);
        }
      }
    } catch (error) {
      console.error('초기 데이터 동기화 실패:', error);
    }
  }, [ydoc, safeRoomId, safeOnComponentsUpdate]);

  useEffect(() => {
    if (!ydoc) return;

    // Y.js에서 컴포넌트 데이터를 관리하는 Y.Array 생성
    const yComponents = ydoc.getArray('components');
    if (!yComponents) return;
    componentsArrayRef.current = yComponents;
    
    // Y.js에서 캔버스 설정을 관리하는 Y.Map 생성
    const yCanvasSettings = ydoc.getMap('canvasSettings');
    if (!yCanvasSettings) return;
    canvasSettingsRef.current = yCanvasSettings;

      // 컴포넌트 변화 감지 및 React 상태 업데이트 (최적화됨)
  const handleComponentsChange = () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const componentsData = yComponents.toArray();

      // 중복 ID 제거 (같은 ID를 가진 첫 번째 컴포넌트만 유지)
      const uniqueComponents = componentsData.filter((comp, index, arr) => {
        const firstIndex = arr.findIndex((c) => c.id === comp.id);
        return firstIndex === index;
      });

      if (uniqueComponents.length !== componentsData.length) {
        console.log('중복 컴포넌트 제거:', componentsData.length - uniqueComponents.length, '개');
        // 중복이 있으면 Y.js 배열을 정리
        ydoc.transact(() => {
          yComponents.delete(0, yComponents.length);
          yComponents.insert(0, uniqueComponents);
        });
      }

      // 초기 로드 시에는 즉시 업데이트, 이후에는 배치 업데이트
      if (!initialLoadRef.current) {
        console.log('🎨 Y.js 초기 데이터 로드:', uniqueComponents.length, '개 컴포넌트');
        safeOnComponentsUpdate(uniqueComponents);
        initialLoadRef.current = true;
      } else {
        batchUpdate(uniqueComponents);
      }
      
      // 템플릿 시작 시 모든 사용자에게 즉시 동기화
      if (isConnected && uniqueComponents.length > 0) {
        console.log('🔄 컴포넌트 변경을 모든 사용자에게 동기화:', uniqueComponents.length, '개');
      }
    } catch (error) {
      console.error('컴포넌트 데이터 업데이트 중 오류:', error);
    } finally {
      isProcessingRef.current = false;
    }
  };

    // 초기 데이터 로드 (즉시 실행)
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
  }, [ydoc, batchUpdate, safeOnComponentsUpdate]);

  // Y.js 연결 완료 후 초기 데이터 동기화
  useEffect(() => {
    if (isConnected && ydoc && !initialSyncRef.current) {
      console.log('🔗 Y.js 연결 완료, 초기 데이터 동기화 시작...');
      
      // 템플릿 시작 시에는 즉시 동기화, 일반 시작 시에는 잠시 대기
      const syncDelay = 100; // 템플릿 시작 시 더 빠른 동기화
      
      setTimeout(() => {
        syncInitialDataToYjs();
      }, syncDelay);
    }
  }, [isConnected, ydoc, syncInitialDataToYjs]);

  // Y.js 연결 상태 모니터링 및 강제 동기화
  useEffect(() => {
    if (isConnected && ydoc && componentsArrayRef.current) {
      const yComponents = componentsArrayRef.current;
      
      // 연결 완료 후 500ms 뒤에 강제 동기화 시도 (더 빠른 동기화)
      const forceSyncTimer = setTimeout(() => {
        if (yComponents.length > 0 && !initialSyncRef.current) {
          console.log('🔄 강제 동기화 시도...');
          const componentsData = yComponents.toArray();
          safeOnComponentsUpdate(componentsData);
          initialSyncRef.current = true;
        }
      }, 500);
      
      return () => clearTimeout(forceSyncTimer);
    }
  }, [isConnected, ydoc, safeOnComponentsUpdate]);

  // Y.js 연결 완료 후 복구 처리 (개선됨)
  useEffect(() => {
    if (!ydoc || hasRestoredRef.current) return;

    const yComponents = ydoc.getArray('components');
    if (!yComponents) return;

    // 연결 완료 후 Y.js 문서가 비어있으면 복구
    if (yComponents.length === 0) {
      console.log('🔗 Y.js 연결 완료, 복구 시작...');
      hasRestoredRef.current = true;
      restoreFromDatabase(roomId, yComponents);
    } else {
      console.log('🔗 Y.js 연결 완료, 기존 데이터 있음:', yComponents.length, '개 컴포넌트');
      hasRestoredRef.current = true;
      // 기존 데이터가 있으면 즉시 로드
      const componentsData = yComponents.toArray();
      safeOnComponentsUpdate(componentsData);
      
      // 템플릿 시작 시 모든 사용자에게 즉시 동기화
      if (isConnected) {
        setTimeout(() => {
          console.log('🔄 기존 데이터를 모든 사용자에게 동기화...');
          const currentData = yComponents.toArray();
          safeOnComponentsUpdate(currentData);
        }, 200);
      }
    }
  }, [ydoc, roomId, restoreFromDatabase, safeOnComponentsUpdate, isConnected]);

  // 연결 오류 시 로컬 모드 활성화
  useEffect(() => {
    if (connectionError) {
      console.log('🔴 협업 연결 오류로 인해 로컬 모드로 전환');
      // 로컬 상태에서 컴포넌트 데이터를 유지하기 위해 DB에서 복구 시도
      if (!hasRestoredRef.current) {
        hasRestoredRef.current = true;
        restoreFromDatabase(roomId, null);
      }
    }
  }, [connectionError, roomId, restoreFromDatabase]);

  // 컴포넌트 업데이트 함수들 (메모이제이션됨, 실시간 동기화 개선)
  const updateComponent = useCallback((componentId, updates) => {
    if (!componentsArrayRef.current) {
      console.warn('Y.js 컴포넌트 배열이 초기화되지 않음');
      return;
    }

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    const index = components.findIndex((comp) => comp.id === componentId);

    if (index !== -1) {
      const updatedComponent = { ...components[index], ...updates };
      
      // Y.js 트랜잭션으로 원자적 업데이트
      ydoc.transact(() => {
        yComponents.delete(index, 1);
        yComponents.insert(index, [updatedComponent]);
      });
      console.log('🔄 컴포넌트 업데이트 동기화:', componentId, updates);
    } else {
      console.warn('업데이트할 컴포넌트를 찾을 수 없음:', componentId);
    }
  }, [ydoc]);

  // 컴포넌트 업데이트 함수 (전체 컴포넌트 객체로 업데이트)
  const updateComponentObject = useCallback((updatedComponent) => {
    if (!componentsArrayRef.current) {
      console.warn('Y.js 컴포넌트 배열이 초기화되지 않음');
      return;
    }

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    const index = components.findIndex((comp) => comp.id === updatedComponent.id);

    if (index !== -1) {
      // Y.js 트랜잭션으로 원자적 업데이트
      ydoc.transact(() => {
        yComponents.delete(index, 1);
        yComponents.insert(index, [updatedComponent]);
      });
      console.log('🔄 컴포넌트 객체 업데이트 동기화:', updatedComponent.id);
    } else {
      console.warn('업데이트할 컴포넌트를 찾을 수 없음:', updatedComponent.id);
    }
  }, [ydoc]);

  const addComponent = useCallback((component) => {
    if (!componentsArrayRef.current) {
      console.warn('Y.js 컴포넌트 배열이 초기화되지 않음');
      return;
    }

    const yComponents = componentsArrayRef.current;
    
    // Y.js 트랜잭션으로 원자적 추가
    ydoc.transact(() => {
      yComponents.push([component]);
    });
    console.log('➕ 컴포넌트 추가 동기화:', component.id);
  }, [ydoc]);

  const removeComponent = useCallback((componentId) => {
    if (!componentsArrayRef.current) {
      console.warn('Y.js 컴포넌트 배열이 초기화되지 않음');
      return;
    }

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    const index = components.findIndex((comp) => comp.id === componentId);

    if (index !== -1) {
      // Y.js 트랜잭션으로 원자적 삭제
      ydoc.transact(() => {
        yComponents.delete(index, 1);
      });
      console.log('🗑️ 컴포넌트 삭제 동기화:', componentId);
    } else {
      console.warn('삭제할 컴포넌트를 찾을 수 없음:', componentId);
    }
  }, [ydoc]);

  const updateAllComponents = useCallback((newComponents) => {
    if (!componentsArrayRef.current) {
      console.warn('Y.js 컴포넌트 배열이 초기화되지 않음');
      return;
    }

    const yComponents = componentsArrayRef.current;
    
    // Y.js 트랜잭션으로 원자적 전체 업데이트
    ydoc.transact(() => {
      yComponents.delete(0, yComponents.length);
      yComponents.insert(0, newComponents);
    });
    console.log('🔄 전체 컴포넌트 업데이트 동기화:', newComponents.length, '개');
  }, [ydoc]);

  // 캔버스 설정 업데이트
  const updateCanvasSettings = useCallback((settings) => {
    if (!canvasSettingsRef.current) return;

    const yCanvasSettings = canvasSettingsRef.current;
    ydoc.transact(() => {
      Object.entries(settings).forEach(([key, value]) => {
        yCanvasSettings.set(key, value);
      });
    });
  }, [ydoc]);

  // 활성 사용자 목록 가져오기
  const getActiveUsers = useCallback(() => {
    if (!awareness) return [];

    const states = awareness.getStates();
    const users = [];

    states.forEach((state, clientId) => {
      if (clientId === awareness.clientID) return;
      if (state.user) {
        users.push(state.user);
      }
    });

    return users;
  }, [awareness]);

  // 히스토리 관리 (간단한 구현)
  const undo = useCallback(() => {
    if (ydoc) {
      ydoc.undo();
    }
  }, [ydoc]);

  const redo = useCallback(() => {
    if (ydoc) {
      ydoc.redo();
    }
  }, [ydoc]);

  const getHistory = useCallback(() => {
    return {
      canUndo: ydoc ? ydoc.canUndo() : false,
      canRedo: ydoc ? ydoc.canRedo() : false,
    };
  }, [ydoc]);

  const setHistory = useCallback(() => {
    // Y.js는 자동으로 히스토리를 관리하므로 별도 구현 불필요
  }, []);

  // 메모이제이션된 반환값
  const memoizedReturn = useMemo(() => ({
    otherCursors,
    otherSelections,
    updateCursorPosition,
    addComponent,
    updateComponent,
    updateComponentObject,
    removeComponent,
    updateAllComponents,
    getActiveUsers,
    undo,
    redo,
    getHistory,
    setHistory,
    isConnected,
    connectionError,
    ydoc,
    provider,
  }), [
    otherCursors,
    otherSelections,
    updateCursorPosition,
    addComponent,
    updateComponent,
    updateComponentObject,
    removeComponent,
    updateAllComponents,
    getActiveUsers,
    undo,
    redo,
    getHistory,
    setHistory,
    isConnected,
    connectionError,
    ydoc,
    provider,
  ]);

  // 정리 함수
  useEffect(() => {
    return () => {
      if (batchUpdateRef.current) {
        clearTimeout(batchUpdateRef.current);
      }
    };
  }, []);

  return memoizedReturn;
}
