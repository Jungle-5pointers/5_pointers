import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams, useLocation } from 'react-router-dom';

// 모듈화된 컴포넌트들
import ComponentLibrary from './NoCodeEditor/ComponentLibrary';
import CanvasArea from './NoCodeEditor/CanvasArea';
import Inspector from './NoCodeEditor/Inspector';
import PreviewModal from './NoCodeEditor/PreviewModal';
import EditorHeader from './NoCodeEditor/components/EditorHeader';
import TemplateModal from './NoCodeEditor/components/TemplateModal';
import InviteModal from './NoCodeEditor/components/InviteModal';
import CanvasComponent from './NoCodeEditor/components/CanvasComponent';
import UserCursor from './NoCodeEditor/components/UserCursor';

// 유틸리티 함수들
import {
  GRID_SIZE,
  clamp,
  randomNickname,
  randomColor,
  getComponentDimensions,
  resolveCollision,
  calculateSnapLines,
  getFinalStyles,
  migrateToResponsive,
  arrangeComponentsVertically,
  getCanvasSize,
} from './NoCodeEditor/utils/editorUtils';
import {
  toggleOverlapDebug,
  checkAllOverlaps,
  generateOverlapReport,
  checkTabletOverlaps,
} from './NoCodeEditor/utils/overlapDebugger';
import { API_BASE_URL } from '../config';

// 컴포넌트 정의
import { ComponentDefinitions } from './components/definitions';

// 협업 기능 imports
import { useCollaboration } from '../hooks/useCollaboration';
import { getUserColor } from '../utils/userColors';
import useAutoSave from '../hooks/useAutoSave';


function NoCodeEditor() {
  const { roomId } = useParams();
  const location = useLocation();

  // 기본 상태
  const [components, setComponents] = useState([]);

  // 자동저장 기능
  const autoSave = useAutoSave(roomId, components); // roomId가 실제로는 pageId역할
  const [selectedId, setSelectedId] = useState(null);
  const [snapLines, setSnapLines] = useState({ vertical: [], horizontal: [] });
  const [zoom, setZoom] = useState(100);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewport, setViewport] = useState('desktop');

  // 템플릿 저장 모달 상태
  const [isTemplateSaveOpen, setIsTemplateSaveOpen] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: '',
    category: 'wedding',
    tags: '',
  });

  // 초대 모달 상태
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true); // 컴포넌트 라이브러리 토글 상태
  const [canvasHeight, setCanvasHeight] = useState(
    viewport === 'mobile' ? 667 : 1080
  ); // 캔버스 높이 관리

  // JWT Base64URL 디코딩 함수 (한글 지원)
  const decodeJWTPayload = (token) => {
    try {
      // Base64URL을 Base64로 변환
      let base64 = token.split('.')[1];
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

      // 패딩 추가
      while (base64.length % 4) {
        base64 += '=';
      }

      // UTF-8로 안전하게 디코딩
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const utf8String = new TextDecoder('utf-8').decode(bytes);
      const payload = JSON.parse(utf8String);

      console.log('JWT 디코딩 성공:', payload);
      return payload;
    } catch (error) {
      console.error('JWT 디코딩 실패:', error);
      return null;
    }
  };

  // App.jsx에서 로그인 체크를 처리하므로 여기서는 제거

  // 사용자 정보 및 권한 관리
  const [userInfo] = useState(() => {
    // 로그인된 사용자만 접근 가능하므로 토큰이 반드시 존재함
    const token = localStorage.getItem('token');
    console.log('현재 토큰:', token ? '존재함' : '없음');

    const payload = decodeJWTPayload(token);
    console.log('JWT 페이로드:', payload);

    if (!payload) {
      console.error('토큰이 유효하지 않습니다.');
      return null;
    }

    // 모든 가능한 필드명을 확인
    console.log('JWT 페이로드의 모든 키:', Object.keys(payload));
    console.log('JWT 페이로드의 모든 값:', payload);

    const userId =
      payload.userId ||
      payload.id ||
      payload.sub ||
      Math.random().toString(36).slice(2, 10);
    const nickname =
      payload.nickname ||
      payload.name ||
      payload.email?.split('@')[0] ||
      '사용자';
    const isAdminUser = payload.role === 'ADMIN';

    console.log('최종 사용자 정보:', {
      userId,
      nickname,
      role: payload.role,
      payloadKeys: Object.keys(payload),
      rawPayload: payload,
    });

    // 관리자 권한 설정
    setIsAdmin(isAdminUser);

    return {
      id: userId,
      name: nickname,
      color: getUserColor(userId),
    };
  });

  // ref
  const canvasRef = useRef();
  const containerRef = useRef();

  // 협업 기능 통합
  const collaboration = useCollaboration({
    roomId,
    userInfo,
    canvasRef,
    selectedComponentId: selectedId,
    onComponentsUpdate: setComponents,
    viewport,
  });

  // 협업 상태 구조분해할당
  const {
    isConnected,
    otherCursors: otherCursorsMap,
    otherSelections: otherSelectionsMap,
    updateComponent,
    addComponent,
    removeComponent,
    updateCursorPosition,
    getActiveUsers,
    ydoc,
    provider,
  } = collaboration;

  // Map을 배열로 변환
  const otherCursors = Array.isArray(otherCursorsMap)
    ? otherCursorsMap
    : otherCursorsMap instanceof Map
      ? Array.from(otherCursorsMap.values())
      : [];
  const otherSelections = Array.isArray(otherSelectionsMap)
    ? otherSelectionsMap
    : otherSelectionsMap instanceof Map
      ? Array.from(otherSelectionsMap.values())
      : [];

  // 겹침 디버깅 도구 전역 등록
  useEffect(() => {
    // 브라우저 콘솔에서 사용할 수 있는 전역 함수 등록
    window.debugOverlaps = () => toggleOverlapDebug();
    window.checkOverlaps = () => {
      const overlaps = checkAllOverlaps(
        components,
        viewport,
        getComponentDimensions
      );
      const report = generateOverlapReport(overlaps, viewport);
      console.log(report);
      return overlaps;
    };

    window.checkTabletOverlaps = () => {
      return checkTabletOverlaps(components, getComponentDimensions);
    };

    console.log(`
🔧 겹침 디버깅 도구가 준비되었습니다!
사용법:
  debugOverlaps()        - 디버깅 모드 켜기/끄기
  checkOverlaps()        - 현재 캔버스의 모든 겹침 체크
  checkTabletOverlaps()  - 태블릿/모바일 겹침 비교 분석
    `);

    return () => {
      // cleanup
      delete window.debugOverlaps;
      delete window.checkOverlaps;
      delete window.checkTabletOverlaps;
    };
  }, [components, viewport]);

  // 연결 상태 및 협업 디버깅
  useEffect(() => {
    // console.log('========================');

    if (isConnected) {
      // console.log('✅ 협업 서버에 연결되었습니다.');
    } else {
      // console.log('❌ 협업 서버 연결이 끊어졌습니다.');
    }
  }, [isConnected, roomId, userInfo, otherCursors, otherSelections]);

  // 페이지 데이터 로딩 (빠른 렌더링)
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const loadPageData = async () => {
      if (!roomId || pageLoaded) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/pages/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token || ''}`,
          },
        });

        if (response.ok) {
          const pageData = await response.json();
          console.log('📦 페이지 데이터 로딩:', pageData);

          if (pageData.content && Array.isArray(pageData.content)) {
            console.log(
              '📦 원본 컴포넌트들:',
              pageData.content.map((c) => ({
                id: c.id,
                x: c.x,
                y: c.y,
                responsive: c.responsive
                  ? '이미 responsive'
                  : '마이그레이션 필요',
              }))
            );

            // 컴포넌트들을 responsive 구조로 마이그레이션
            const migratedComponents = pageData.content.map((comp) =>
              migrateToResponsive(comp)
            );

            console.log(
              '🔄 마이그레이션된 컴포넌트들:',
              migratedComponents.map((c) => ({
                id: c.id,
                desktop: c.responsive?.desktop,
              }))
            );

            // YJS가 준비되면 추가, 아니면 직접 상태 설정
            if (collaboration.ydoc) {
              console.log(
                'Y.js가 준비됨, DB 데이터를 Y.js에 추가 (responsive 마이그레이션 완료)'
              );
              migratedComponents.forEach((comp) => {
                addComponent(comp);
              });
            } else {
              console.log(
                'Y.js가 준비되지 않음, React 상태에 직접 설정 (responsive 마이그레이션 완료)'
              );
              setComponents(migratedComponents);
            }
          }
          setPageLoaded(true);
        }
      } catch (error) {
        console.error('페이지 데이터 로딩 실패:', error);
      }
    };

    loadPageData();
  }, [roomId, pageLoaded]);

  // YJS가 나중에 초기화되면 데이터 동기화
  useEffect(() => {
    if (
      collaboration.ydoc &&
      components.length > 0 &&
      !collaboration.ydoc.getArray('components').length
    ) {
      console.log(
        'Y.js가 나중에 초기화됨, React 상태의 컴포넌트들을 Y.js에 동기화'
      );
      components.forEach((comp) => {
        addComponent(comp);
      });
    }
  }, [collaboration.ydoc, components, addComponent]);

  // viewport 변경 시 캔버스 높이 초기화
  useEffect(() => {
    const baseHeight = viewport === 'mobile' ? 667 : 1080;
    setCanvasHeight(baseHeight);
  }, [viewport]);

  // 기존 더미 컴포넌트 제거 (초기화 시)
  useEffect(() => {
    const extenderComponents = components.filter((comp) =>
      comp.id.startsWith('canvas-extender-')
    );
    if (extenderComponents.length > 0) {
      console.log(
        `기존 더미 컴포넌트 ${extenderComponents.length}개를 제거합니다.`
      );
      extenderComponents.forEach((comp) => removeComponent(comp.id));
    }
  }, []); // 초기 로딩 시에만 실행

  // 컴포넌트 선택 시 해당 컴포넌트가 보이도록 스크롤 이동
  useEffect(() => {
    if (!selectedId || !canvasRef.current || !containerRef.current) return;
    const comp = components.find((c) => c.id === selectedId);
    if (!comp) return;
    const compRect = {
      left: comp.x,
      top: comp.y,
      right: comp.x + (comp.width || 120),
      bottom: comp.y + (comp.height || 40),
    };
    const container = containerRef.current;
    // 스크롤 이동 (컴포넌트가 중앙에 오도록)
    container.scrollTo({
      left: Math.max(
        0,
        compRect.left -
          container.clientWidth / 2 +
          (comp.width || getComponentDimensions(comp.type).defaultWidth) / 2
      ),
      top: Math.max(
        0,
        compRect.top -
          container.clientHeight / 2 +
          (comp.height || getComponentDimensions(comp.type).defaultHeight) / 2
      ),
      behavior: 'smooth',
    });
  }, [selectedId, components]);

  // 캔버스에서 드래그 앤 드롭으로 컴포넌트 추가
  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType');
    if (type) {
      const compDef = ComponentDefinitions.find((def) => def.type === type);
      if (compDef) {
        const effectiveGridSize = GRID_SIZE;
        const dimensions = getComponentDimensions(type);
        const width = dimensions.defaultWidth;
        const height = dimensions.defaultHeight;

        const snappedX =
          Math.round(e.nativeEvent.offsetX / effectiveGridSize) *
          effectiveGridSize;
        const snappedY =
          Math.round(e.nativeEvent.offsetY / effectiveGridSize) *
          effectiveGridSize;

        const maxX =
          viewport === 'mobile'
            ? Math.max(0, 375 - width)
            : Math.max(0, 1920 - width);
        const maxY = Math.max(0, canvasHeight - height); // 확장된 캔버스 높이 사용

        let clampedX = clamp(snappedX, 0, maxX);
        let clampedY = clamp(snappedY, 0, maxY);

        // 유니크한 ID 생성 - 더 안전한 방식
        const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${userInfo.id}-${Math.random().toString(36).slice(2, 8)}`;

        // 충돌 방지를 위한 임시 컴포넌트 생성
        const tempComponent = {
          id: uniqueId,
          type,
          x: clampedX,
          y: clampedY,
          width,
          height,
        };

        const collisionResult = resolveCollision(
          tempComponent,
          components,
          getComponentDimensions
        );
        clampedX = collisionResult.x;
        clampedY = collisionResult.y;

        clampedX = clamp(clampedX, 0, maxX);
        clampedY = clamp(clampedY, 0, maxY);

        // responsive 구조로 새 컴포넌트 생성
        const newComponent = {
          id: uniqueId,
          type,
          responsive: {
            desktop: {
              x: clampedX,
              y: clampedY,
              width,
              height,
              props: { ...(compDef?.defaultProps || {}) },
            },
          },
          // 호환성을 위한 기존 필드
          x: clampedX,
          y: clampedY,
          width,
          height,
          props: { ...(compDef?.defaultProps || {}) },
          createdBy: userInfo.id, // 생성자 정보 추가
          createdAt: Date.now(), // 생성 시간 추가
        };

        console.log(
          '🆕 새 컴포넌트 responsive 구조로 생성:',
          uniqueId,
          type,
          newComponent.responsive.desktop
        );

        // 협업 기능으로 컴포넌트 추가
        addComponent(newComponent);

        // Y.js에 추가된 후 상태 확인
        setTimeout(() => {
          console.log('컴포넌트 추가 후 Y.js 상태 확인');
          const yComponents = collaboration.ydoc?.getArray('components');
          if (yComponents) {
            const yjsComponents = yComponents.toArray();
            console.log(
              'Y.js 컴포넌트들:',
              yjsComponents.map((c) => ({ id: c.id, type: c.type }))
            );
          }
        }, 100);

        // 추가된 컴포넌트 자동 선택
        setTimeout(() => {
          setSelectedId(uniqueId);
        }, 100);
      }
    }
  };

  // 컴포넌트 선택
  const handleSelect = (id) => {
    setSelectedId(id);
  };

  // 속성 변경 (스냅라인 포함)
  const handleUpdate = (comp) => {
    console.log('컴포넌트 업데이트 요청:', comp.id, '타입:', comp.type);
    console.log('업데이트할 컴포넌트 전체:', comp);

    // 기존 컴포넌트 찾기
    const existingComp = components.find((c) => c.id === comp.id);
    if (!existingComp) {
      console.warn('업데이트할 컴포넌트를 찾을 수 없음:', comp.id);
      console.log(
        '현재 컴포넌트들:',
        components.map((c) => ({ id: c.id, type: c.type }))
      );
      return;
    }

    console.log('기존 컴포넌트:', existingComp);

    // 변경된 속성만 추출
    const updates = {};
    Object.keys(comp).forEach((key) => {
      if (JSON.stringify(existingComp[key]) !== JSON.stringify(comp[key])) {
        updates[key] = comp[key];
        console.log(`속성 변경 감지: ${key}`, {
          기존: existingComp[key],
          새로운: comp[key],
        });
      }
    });

    console.log('변경된 속성:', updates);

    // 협업 기능으로 컴포넌트 업데이트 (변경된 속성만)
    if (Object.keys(updates).length > 0) {
      console.log('Y.js 업데이트 호출:', comp.id, updates);
      updateComponent(comp.id, updates);
    } else {
      console.log('변경된 속성이 없음');
    }

    // 현재 컴포넌트 상태 확인
    setTimeout(() => {
      const updatedComp = components.find((c) => c.id === comp.id);
      if (updatedComp) {
        console.log(
          '컴포넌트 업데이트 후 상태:',
          updatedComp.id,
          '위치:',
          updatedComp.x,
          updatedComp.y
        );
      } else {
        console.warn('컴포넌트 업데이트 후 찾을 수 없음:', comp.id);
      }
    }, 100);
  };

  // 컴포넌트 삭제
  const handleDelete = (id) => {
    // 협업 기능으로 컴포넌트 삭제
    removeComponent(id);
    if (selectedId === id) setSelectedId(null);
  };

  // Delete 키로 삭제
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Delete' && selectedId) {
        handleDelete(selectedId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId, components]);

  // 속성 인스펙터
  const selectedComp = components.find((c) => c.id === selectedId);

  // 활성 사용자 정보 (디버깅용)
  const activeUsers = getActiveUsers();

  // 브라우저 전체 확대/축소(Ctrl+스크롤, Ctrl+키, 트랙패드 pinch) 완벽 차단
  useEffect(() => {
    const preventWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', preventWheelZoom, { passive: false });
    document.addEventListener('wheel', preventWheelZoom, { passive: false });
    document.body.addEventListener('wheel', preventWheelZoom, {
      passive: false,
    });

    const preventKeyZoom = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '+' || e.key === '-' || e.key === '=')
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', preventKeyZoom);
    document.addEventListener('keydown', preventKeyZoom);
    document.body.addEventListener('keydown', preventKeyZoom);

    const preventGesture = (e) => {
      e.preventDefault();
    };
    window.addEventListener('gesturestart', preventGesture);
    window.addEventListener('gesturechange', preventGesture);
    window.addEventListener('gestureend', preventGesture);

    return () => {
      window.removeEventListener('wheel', preventWheelZoom, { passive: false });
      document.removeEventListener('wheel', preventWheelZoom, {
        passive: false,
      });
      document.body.removeEventListener('wheel', preventWheelZoom, {
        passive: false,
      });

      window.removeEventListener('keydown', preventKeyZoom);
      document.removeEventListener('keydown', preventKeyZoom);
      document.body.removeEventListener('keydown', preventKeyZoom);

      window.removeEventListener('gesturestart', preventGesture);
      window.removeEventListener('gesturechange', preventGesture);
      window.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  // 줌 상태 변경 핸들러
  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  // 뷰포트 전환 핸들러
  const handleViewportChange = useCallback(
    (newViewport) => {
      console.log(`🔄 뷰포트 변경: ${viewport} → ${newViewport}`);

      // 뷰포트 변경 시 현재 컴포넌트들의 responsive 구조 확인
      if (components.length > 0) {
        console.log('📊 뷰포트 변경 시 컴포넌트 상태 확인:');
        components.forEach((comp) => {
          console.log(`  ${comp.id}:`, {
            responsive: comp.responsive,
            currentViewportStyles: getFinalStyles(comp, viewport),
            newViewportStyles: getFinalStyles(comp, newViewport),
          });
        });
      }

      setViewport(newViewport);
      // 뷰포트 변경 시 선택된 컴포넌트 해제 (UX 향상)
      setSelectedId(null);
      // 뷰포트 변경 시 스냅라인 초기화
      setSnapLines({ vertical: [], horizontal: [] });
      console.log('🧹 뷰포트 변경으로 인한 스냅라인 초기화');
    },
    [viewport, components]
  );

  // 🔥 콘솔 디버깅 도구 (수동 실행 가능)
  useEffect(() => {
    window.testArrange = () => {
      console.log('🧪 수동 정렬 테스트 시작...');
      if (components.length > 0) {
        const newPositions = arrangeComponentsVertically(components, viewport);
        console.log('📋 정렬 결과:', newPositions);

        // 실제 업데이트 적용
        for (const positionUpdate of newPositions) {
          const { id, updates } = positionUpdate;
          const component = components.find((comp) => comp.id === id);

          if (!component) continue;

          const newResponsive = {
            ...component.responsive,
            [viewport]: {
              ...(component.responsive?.[viewport] || {}),
              ...updates,
            },
          };

          updateComponent(component.id, { responsive: newResponsive });
        }

        console.log('✅ 수동 정렬 완료!');
      } else {
        console.log('❌ 컴포넌트가 없습니다.');
      }
    };

    console.log('🛠️ 콘솔에서 window.testArrange() 실행 가능');
  }, [components, viewport, updateComponent]);

  // 템플릿으로 저장
  const handleSaveAsTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/templates/from-components`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            components: components, // 현재 에디터 상태
            name: templateData.name,
            category: templateData.category,
            tags: templateData.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag),
          }),
        }
      );

      if (response.ok) {
        alert('템플릿으로 저장되었습니다!');
        setIsTemplateSaveOpen(false);
        setTemplateData({ name: '', category: 'wedding', tags: '' });
      } else {
        alert('템플릿 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('템플릿 저장 실패:', error);
      alert('템플릿 저장에 실패했습니다.');
    }
  };

  // 🔥 간단한 뷰포트 변경 감지 및 자동 정렬 (추가) - ref를 사용해서 무한 루프 방지
  const prevViewportRef = useRef(viewport);

  useEffect(() => {
    console.log(`🎯🎯🎯 뷰포트 변경 감지: ${viewport} 🎯🎯🎯`);
    console.log(`📊 현재 컴포넌트 수: ${components.length}`);

    // 뷰포트가 실제로 변경되었을 때만 실행 (무한 루프 방지)
    const prevViewport = prevViewportRef.current;
    if (prevViewport === viewport) {
      console.log(`📋 동일한 뷰포트 - 실행 건너뜀`);
      return;
    }

    prevViewportRef.current = viewport;

    // 모바일 또는 태블릿 뷰로 전환될 때만 실행
    if (viewport === 'mobile' || viewport === 'tablet') {
      console.log(`🚀 [${viewport}] 뷰로 전환되어 자동 정렬을 실행합니다.`);

      // 컴포넌트가 없으면 실행하지 않음
      if (!components || components.length === 0) {
        console.log(`❌ 컴포넌트가 없어서 자동 정렬을 건너뜁니다.`);
        return;
      }

      // 타이머로 약간 지연 후 실행 (상태 안정화 대기)
      const timer = setTimeout(() => {
        console.log(`⏰ 타이머 실행: ${viewport} 자동 정렬 시작`);

        // 1. 새로운 정렬 로직 호출
        const newPositions = arrangeComponentsVertically(components, viewport);

        if (newPositions.length > 0) {
          console.log(
            `📱 ${newPositions.length}개 컴포넌트를 세로로 정렬합니다.`
          );

          // 2. 상태 업데이트
          for (const positionUpdate of newPositions) {
            const { id, updates } = positionUpdate;
            const component = components.find((comp) => comp.id === id);

            if (!component) continue;

            console.log(
              `🔄 ${component.id} 업데이트 적용: (${updates.x}, ${updates.y})`
            );

            // 현재 뷰포트의 responsive 객체에만 업데이트 적용
            const newResponsive = {
              ...component.responsive,
              [viewport]: {
                ...(component.responsive?.[viewport] || {}),
                ...updates,
              },
            };

            // Y.js 업데이트
            updateComponent(component.id, { responsive: newResponsive });
          }

          console.log(`✅✅✅ [${viewport}] 자동 정렬 완료! ✅✅✅`);
        } else {
          console.log(`✅ [${viewport}]에서 정렬할 컴포넌트 없음`);
        }
      }, 100); // 100ms 지연

      return () => clearTimeout(timer);
    } else {
      console.log(`📋 [${viewport}]는 자동 정렬 대상이 아님 (데스크탑)`);
    }
  }, [viewport, components.length]);

  // 새 섹션 추가 핸들러
  const handleAddSection = useCallback(
    (sectionY) => {
      // 현재 캔버스 높이에 새 섹션 높이를 추가 (더미 컴포넌트 없이)
      const newCanvasHeight = Math.max(canvasHeight, sectionY + 400); // 400px 추가 공간
      console.log('섹션 추가:', {
        currentHeight: canvasHeight,
        sectionY,
        newCanvasHeight,
      });
      setCanvasHeight(newCanvasHeight);

      // 새로 추가된 섹션으로 스크롤
      setTimeout(() => {
        if (containerRef.current) {
          const targetScrollTop = sectionY * (zoom / 100) - 200;
          containerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth',
          });
        }
      }, 100);
    },
    [viewport, zoom, canvasHeight]
  );

  // App.jsx에서 로그인 체크를 처리하므로 여기서는 제거

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        color: '#222',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 에디터 헤더 */}
      <EditorHeader
        components={components}
        selectedComp={selectedComp}
        isLibraryOpen={isLibraryOpen}
        viewport={viewport}
        onViewportChange={handleViewportChange}
        onPreviewOpen={() => setIsPreviewOpen(true)}
        onTemplateSaveOpen={() => setIsTemplateSaveOpen(true)}
        onInviteOpen={() => setIsInviteOpen(true)}
        roomId={roomId}
        isAdmin={isAdmin}
      />

      {/* 하단: 라이브러리, 캔버스, 인스펙터 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          height: 'calc(100vh - 64px)', // 헤더 높이만큼 제외 (h-16 = 64px)
          overflow: 'hidden',
        }}
      >
        {/* 좌측: 컴포넌트 라이브러리 (토글 가능) */}
        <ComponentLibrary
          onDragStart={(e, type) => {
            e.dataTransfer.setData('componentType', type);
            e.dataTransfer.effectAllowed = 'copy';
          }}
          components={components}
          roomId={roomId}
          isOpen={isLibraryOpen}
          onToggle={() => setIsLibraryOpen(!isLibraryOpen)}
        />

        {/* 중앙: 캔버스 */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%', // 부모 컨테이너 높이에 맞춤
            display: 'flex',
            position: 'relative',
            overflow: 'hidden', // 내부 컴포넌트에서 스크롤 처리
          }}
        >
          <CanvasArea
            containerRef={containerRef}
            canvasRef={canvasRef}
            components={components}
            selectedId={selectedId}
            users={{}} // 기존 users 대신 빈 객체
            nickname={userInfo.name}
            snapLines={snapLines}
            setSnapLines={setSnapLines}
            onDrop={(e) => {
              handleDrop(e);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => handleSelect(null)}
            onMouseMove={() => {}} // 커서 추적은 협업 훅에서 처리
            onMouseUp={() => {}}
            onSelect={handleSelect}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAddSection={handleAddSection} // 새 섹션 추가 핸들러
            CanvasComponent={CanvasComponent}
            UserCursor={UserCursor}
            zoom={zoom}
            onZoomChange={handleZoomChange}
            viewport={viewport}
            canvasHeight={canvasHeight} // 캔버스 높이 전달
            isInspectorOpen={!!selectedComp}
            isLibraryOpen={isLibraryOpen} // 라이브러리 상태 전달
            updateCursorPosition={updateCursorPosition} // 협업 커서 위치 업데이트
            // 협업 기능 props 추가
            otherCursors={otherCursors}
            otherSelections={otherSelections}
            getComponentDimensions={getComponentDimensions} // 컴포넌트 크기 함수
          />
        </div>

        {/* 우측: 속성 인스펙터 */}
        {selectedComp && (
          <Inspector
            selectedComp={selectedComp}
            onUpdate={handleUpdate}
            color={userInfo.color}
            nickname={userInfo.name}
            roomId={roomId}
            viewport={viewport} 
          />
        )}
      </div>

      {/* 미리보기 모달 */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pageContent={components}
      />

      {/* 템플릿 저장 모달 */}
      <TemplateModal
        isOpen={isTemplateSaveOpen}
        onClose={() => {
          setIsTemplateSaveOpen(false);
          setTemplateData({ name: '', category: 'wedding', tags: '' });
        }}
        templateData={templateData}
        setTemplateData={setTemplateData}
        onSave={handleSaveAsTemplate}
      />

      {/* 초대 모달 */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        pageId={roomId}
      />



      {/* 스타일 태그로 high-contrast, readable 스타일 보장 */}
      <style>{`
        body, html { overflow: hidden !important; height: 100%; }
        input, button { outline: none; }
        ::selection { background: #3B4EFF22; }
      `}</style>
    </div>
  );
}

export default NoCodeEditor;
