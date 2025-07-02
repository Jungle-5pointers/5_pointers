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
  calculateSnapLines 
} from './NoCodeEditor/utils/editorUtils';
import { API_BASE_URL } from '../config';

// 컴포넌트 정의
import { ComponentDefinitions } from './components/definitions';

// 협업 기능 imports
import { useCollaboration } from '../hooks/useCollaboration';

function NoCodeEditor() {
  const { roomId } = useParams();
  const location = useLocation();
  // 기본 상태
  const [components, setComponents] = useState([]);
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
    tags: ''
  });

  // 초대 모달 상태
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true); // 컴포넌트 라이브러리 토글 상태
  const [canvasHeight, setCanvasHeight] = useState(viewport === 'mobile' ? 667 : 1080); // 캔버스 높이 관리

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
      return JSON.parse(utf8String);
    } catch (error) {
      console.error('JWT 디코딩 실패:', error);
      return null;
    }
  };

  // 사용자 정보 및 권한 관리
  const [userInfo] = useState(() => {
    // JWT 토큰에서 사용자 정보 추출
    let userId = Math.random().toString(36).slice(2, 10);
    let nickname = `게스트${Math.floor(Math.random() * 1000)}`; // 더 친근한 fallback
    let isAdminUser = false;
    
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJWTPayload(token);
      if (payload) {
        userId = payload.userId || userId;
        nickname = payload.nickname || '사용자';
        isAdminUser = payload.role === 'ADMIN';
        
        console.log('사용자 정보:', { userId, nickname, role: payload.role });
      } else {
        console.log('JWT 토큰 파싱 실패, 게스트로 설정');
      }
    } else {
      console.log('로그인하지 않은 사용자:', nickname);
    }
    
    // 관리자 권한 설정
    setIsAdmin(isAdminUser);
    
    return {
      id: userId,
      name: nickname,
      color: randomColor()
    };
  });

  // ref
  const canvasRef = useRef();
  const containerRef = useRef();
  
  const handleComponentsUpdate = useCallback((newComponents) => {
    setComponents(newComponents);
  }, []);

  // 협업 기능 통합
  const collaboration = useCollaboration({
    roomId,
    userInfo,
    canvasRef,
    selectedComponentId: selectedId,
    onComponentsUpdate: setComponents
  });

  // 협업 상태 구조분해할당
  const {
    isConnected,
    otherCursors,
    otherSelections,
    updateComponent,
    addComponent,
    removeComponent,
    updateCursorPosition,
    getActiveUsers
  } = collaboration;

  // 연결 상태 표시 (선택사항)
  useEffect(() => {
    if (isConnected) {
      console.log('협업 서버에 연결되었습니다.');
    }
  }, [isConnected]);

 // 템플릿 로딩 - YJS 초기화 대기
  const loadedTemplateRef = useRef(null);
  
  useEffect(() => {
    const templateComponents = location.state?.templateComponents;
    if (templateComponents && Array.isArray(templateComponents) && collaboration.ydoc) {
      // 이전에 로딩한 템플릿과 다른지 확인
      const templateKey = JSON.stringify(templateComponents.map(c => c.id));
      if (loadedTemplateRef.current !== templateKey) {
        console.log('새로운 템플릿 로딩:', templateComponents.length, '개');
        templateComponents.forEach((comp, index) => {
          console.log(`addComponent ${index} 호출:`, comp);
          addComponent(comp);
          console.log(`addComponent ${index} 완료`);
        });
        loadedTemplateRef.current = templateKey;
        console.log('템플릿 로딩 완료');
      }
    } else if (templateComponents) {
      console.log('YJS 초기화 대기 중...', { hasYdoc: !!collaboration.ydoc });
    }
  }, [location.state, addComponent, collaboration.ydoc]);

  // viewport 변경 시 캔버스 높이 초기화
  useEffect(() => {
    const baseHeight = viewport === 'mobile' ? 667 : 1080;
    setCanvasHeight(baseHeight);
  }, [viewport]);

  // 기존 더미 컴포넌트 제거 (초기화 시)
  useEffect(() => {
    const extenderComponents = components.filter(comp => comp.id.startsWith('canvas-extender-'));
    if (extenderComponents.length > 0) {
      console.log(`기존 더미 컴포넌트 ${extenderComponents.length}개를 제거합니다.`);
      extenderComponents.forEach(comp => removeComponent(comp.id));
    }
  }, []); // 초기 로딩 시에만 실행

  // 컴포넌트 선택 시 해당 컴포넌트가 보이도록 스크롤 이동
  useEffect(() => {
    if (!selectedId || !canvasRef.current || !containerRef.current) return;
    const comp = components.find(c => c.id === selectedId);
    if (!comp) return;
    const compRect = {
      left: comp.x,
      top: comp.y,
      right: comp.x + (comp.width || 120),
      bottom: comp.y + (comp.height || 40)
    };
    const container = containerRef.current;
    // 스크롤 이동 (컴포넌트가 중앙에 오도록)
    container.scrollTo({
      left: Math.max(0, compRect.left - container.clientWidth / 2 + ((comp.width || getComponentDimensions(comp.type).defaultWidth) / 2)),
      top: Math.max(0, compRect.top - container.clientHeight / 2 + ((comp.height || getComponentDimensions(comp.type).defaultHeight) / 2)),
      behavior: 'smooth'
    });
  }, [selectedId, components]);

  // 캔버스에서 드래그 앤 드롭으로 컴포넌트 추가
  const handleDrop = e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType');
    if (type) {
      const compDef = ComponentDefinitions.find(def => def.type === type);
      if (compDef) {
        const effectiveGridSize = GRID_SIZE;
        const dimensions = getComponentDimensions(type);
        const width = dimensions.defaultWidth;
        const height = dimensions.defaultHeight;
        
        const snappedX = Math.round(e.nativeEvent.offsetX / effectiveGridSize) * effectiveGridSize;
        const snappedY = Math.round(e.nativeEvent.offsetY / effectiveGridSize) * effectiveGridSize;
        
        const maxX = viewport === 'mobile' ? Math.max(0, 375 - width) : Math.max(0, 1920 - width);
        const maxY = Math.max(0, canvasHeight - height); // 확장된 캔버스 높이 사용
        
        let clampedX = clamp(snappedX, 0, maxX);
        let clampedY = clamp(snappedY, 0, maxY);
        
        const newComponent = {
          id: Math.random().toString(36).slice(2, 10),
          type,
          x: clampedX,
          y: clampedY,
          width,
          height,
          props: { ...compDef.defaultProps }
        };
        
        const collisionResult = resolveCollision(newComponent, components, getComponentDimensions);
        clampedX = collisionResult.x;
        clampedY = collisionResult.y;
        
        clampedX = clamp(clampedX, 0, maxX);
        clampedY = clamp(clampedY, 0, maxY);
        
        // 협업 기능으로 컴포넌트 추가
        addComponent({
          ...newComponent,
          x: clampedX,
          y: clampedY
        });
      }
    }
  };

  // 컴포넌트 선택
  const handleSelect = id => {
    setSelectedId(id);
  };

  // 속성 변경 (스냅라인 포함)
  const handleUpdate = comp => {
    // 협업 기능으로 컴포넌트 업데이트
    updateComponent(comp.id, comp);
      
      // 스냅라인 계산
    const lines = calculateSnapLines(comp, components, zoom, viewport, getComponentDimensions);
      setSnapLines(lines);
  };

  // 컴포넌트 삭제
  const handleDelete = id => {
    // 협업 기능으로 컴포넌트 삭제
    removeComponent(id);
    if (selectedId === id) setSelectedId(null);
  };

  // Delete 키로 삭제
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Delete' && selectedId) {
        handleDelete(selectedId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId, components]);

  // 속성 인스펙터
  const selectedComp = components.find(c => c.id === selectedId);
  
  // 활성 사용자 정보 (디버깅용)
  const activeUsers = getActiveUsers();
  console.log('활성 사용자:', activeUsers.length);

  // 브라우저 전체 확대/축소(Ctrl+스크롤, Ctrl+키, 트랙패드 pinch) 완벽 차단
  useEffect(() => {
    const preventWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', preventWheelZoom, { passive: false });
    document.addEventListener('wheel', preventWheelZoom, { passive: false });
    document.body.addEventListener('wheel', preventWheelZoom, { passive: false });

    const preventKeyZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
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
      document.removeEventListener('wheel', preventWheelZoom, { passive: false });
      document.body.removeEventListener('wheel', preventWheelZoom, { passive: false });

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
  const handleViewportChange = useCallback((newViewport) => {
    setViewport(newViewport);
    // 뷰포트 변경 시 선택된 컴포넌트 해제 (UX 향상)
    setSelectedId(null);
  }, []);


  
  // 템플릿으로 저장
  const handleSaveAsTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates/from-components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          components: components, // 현재 에디터 상태
          name: templateData.name,
          category: templateData.category,
          tags: templateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });
      
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

  // 새 섹션 추가 핸들러
  const handleAddSection = useCallback((sectionY) => {
    // 현재 캔버스 높이에 새 섹션 높이를 추가 (더미 컴포넌트 없이)
    const newCanvasHeight = Math.max(canvasHeight, sectionY + 400); // 400px 추가 공간
    console.log('섹션 추가:', { currentHeight: canvasHeight, sectionY, newCanvasHeight });
    setCanvasHeight(newCanvasHeight);
    
    // 새로 추가된 섹션으로 스크롤
    setTimeout(() => {
      if (containerRef.current) {
        const targetScrollTop = sectionY * (zoom / 100) - 200;
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  }, [viewport, zoom, canvasHeight]);

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
      background: '#fff', color: '#222', fontFamily: 'Inter, sans-serif', overflow: 'hidden'
    }}>
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
      <div style={{
        flex: 1,
        display: 'flex',
        height: 'calc(100vh - 64px)', // 헤더 높이만큼 제외 (h-16 = 64px)
        overflow: 'hidden'
      }}>
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
        <div style={{ 
          flex: 1, 
          minWidth: 0, 
          height: '100%', // 부모 컨테이너 높이에 맞춤
          display: 'flex',
          position: 'relative',
          overflow: 'hidden' // 내부 컴포넌트에서 스크롤 처리
        }}>
        <CanvasArea
            containerRef={containerRef}
          canvasRef={canvasRef}
          components={components}
          selectedId={selectedId}
            users={{}} // 기존 users 대신 빈 객체
            nickname={userInfo.name}
          snapLines={snapLines}
            setSnapLines={setSnapLines}
          onDrop={e => { handleDrop(e); }}
          onDragOver={e => e.preventDefault()}
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