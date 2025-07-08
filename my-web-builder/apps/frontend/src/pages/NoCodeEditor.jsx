import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useAutoSave from '../hooks/useAutoSave';
import SaveStatusIndicator from '../components/SaveStatusIndicator';

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

// 훅들
import { usePageDataManager } from '../hooks/usePageDataManager';
import { useCollaboration } from '../hooks/useCollaboration';
import { useEditorInteractionManager } from '../hooks/useEditorInteractionManager';
import { useComponentActions } from '../hooks/useComponentActions';

// 유틸리티
import { getUserColor } from '../utils/userColors';
import {
  getCanvasSize,
  getComponentDimensions,
} from './NoCodeEditor/utils/editorUtils';

function NoCodeEditor({ pageId }) {
  const { roomId } = useParams();
  console.log('🔍 NoCodeEditor roomId:', roomId);
  console.log('🔍 NoCodeEditor pageId:', pageId);
  const canvasRef = useRef();
  const containerRef = useRef();
  const [components, setComponents] = useState([]);

  // 1. 데이터 로딩 및 상태 관리
  const {
    designMode,
    setDesignMode,
    canvasHeight,
    setCanvasHeight,
    isLoading,
    decodeJWTPayload,
  } = usePageDataManager(pageId);

  // 2. 사용자 정보 처리 (단순화)
  const [userInfo] = useState(() => {
    const token = localStorage.getItem('token');
    const payload = decodeJWTPayload(token);

    if (!payload) {
      console.error('토큰이 유효하지 않습니다.');
      return null;
    }

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

    return {
      id: userId,
      name: nickname,
      color: getUserColor(userId),
    };
  });

  // 3. UI 상호작용 관리
  const interaction = useEditorInteractionManager(designMode, setDesignMode);

  // 4. 협업 동기화 로직
  const {
    otherCursors,
    otherSelections,
    updateCursorPosition,
    addComponent,
    updateComponent,
    removeComponent,
    updateAllComponents,
    getActiveUsers,
    undo,
    redo,
    getHistory,
    setHistory,
    isConnected,
  } = useCollaboration({
    roomId: pageId,
    userInfo,
    canvasRef,
    selectedComponentId: interaction.selectedId,
    onComponentsUpdate: setComponents,
    viewport: interaction.viewport,
  });

  // 5. 컴포넌트 액션 관리
  const actions = useComponentActions(
    {
      otherCursors,
      otherSelections,
      updateCursorPosition,
      addComponent,
      updateComponent,
      removeComponent,
      updateAllComponents,
      getActiveUsers,
      undo,
      redo,
      getHistory,
      setHistory,
      isConnected,
    },
    userInfo,
    components,
    interaction.viewport,
    canvasHeight,
    setCanvasHeight,
    interaction.templateData,
    interaction.setTemplateData,
    interaction.handleTemplateSaveClose
  );

  // 컴포넌트 선택 시 스크롤 이동
  useEffect(() => {
    if (!interaction.selectedId || !canvasRef.current || !containerRef.current)
      return;

    const comp = components.find((c) => c.id === interaction.selectedId);
    if (!comp) return;

    const container = containerRef.current;
    container.scrollTo({
      left: Math.max(
        0,
        comp.x - container.clientWidth / 2 + (comp.width || 120) / 2
      ),
      top: Math.max(
        0,
        comp.y - container.clientHeight / 2 + (comp.height || 40) / 2
      ),
      behavior: 'smooth',
    });
  }, [interaction.selectedId, components]);

  // Delete 키로 삭제
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Delete' && interaction.selectedId) {
        actions.handleDelete(
          interaction.selectedId,
          interaction.selectedId,
          interaction.setSelectedId
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [interaction.selectedId, actions.handleDelete]);

  // 브라우저 확대/축소 방지
  useEffect(() => {
    const preventWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    const preventKeyZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const preventGesture = (e) => e.preventDefault();

    window.addEventListener('wheel', preventWheelZoom, { passive: false });
    window.addEventListener('keydown', preventKeyZoom);
    window.addEventListener('gesturestart', preventGesture);
    window.addEventListener('gesturechange', preventGesture);
    window.addEventListener('gestureend', preventGesture);

    return () => {
      window.removeEventListener('wheel', preventWheelZoom);
      window.removeEventListener('keydown', preventKeyZoom);
      window.removeEventListener('gesturestart', preventGesture);
      window.removeEventListener('gesturechange', preventGesture);
      window.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  // 드롭 핸들러 (컴포넌트 추가 후 자동 선택)
  const handleDrop = (e) => {
    const newComponentId = actions.handleDrop(e);
    if (newComponentId) {
      setTimeout(() => interaction.setSelectedId(newComponentId), 100);
    }
  };

  // 자동저장 훅
  const { isSaving, lastSaved, saveError, saveCount, saveNow } = useAutoSave(
    pageId,
    components,
    2000
  );

  // 컴포넌트 업데이트 핸들러
  const handleComponentsUpdate = useCallback((newComponents) => {
    setComponents(newComponents);
  }, []);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontSize: '1.2rem', color: '#64748b' }}>
            페이지를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 컴포넌트와 선택된 컴포넌트
  const selectedComp = components.find((c) => c.id === interaction.selectedId);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      {/* 헤더 */}
      <EditorHeader
        components={components}
        selectedComp={selectedComp}
        isLibraryOpen={interaction.isLibraryOpen}
        viewport={interaction.viewport}
        designMode={designMode}
        onViewportChange={interaction.handleViewportChange}
        onDesignModeChange={interaction.handleDesignModeChange}
        onPreviewOpen={interaction.handlePreviewOpen}
        onTemplateSaveOpen={interaction.handleTemplateSaveOpen}
        onInviteOpen={interaction.handleInviteOpen}
        roomId={roomId || pageId}
        isAdmin={true}
      />

      {/* 저장 상태 표시 */}
      <SaveStatusIndicator
        isSaving={isSaving}
        lastSaved={lastSaved}
        saveError={saveError}
        saveCount={saveCount}
        onSaveNow={saveNow}
      />

      {/* 메인 에디터 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 컴포넌트 라이브러리 */}
        <ComponentLibrary
          onDragStart={(e, type) => {
            e.dataTransfer.setData('componentType', type);
          }}
          components={components}
          roomId={roomId || pageId}
          isOpen={interaction.isLibraryOpen}
          onToggle={interaction.handleLibraryToggle}
          isReady={isConnected}
        />

        {/* 중앙 캔버스 영역 */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <CanvasArea
            containerRef={containerRef}
            canvasRef={canvasRef}
            components={components}
            selectedId={interaction.selectedId}
            users={{}}
            nickname={userInfo.name}
            onSelect={interaction.handleSelect}
            onUpdate={actions.handleUpdate}
            onDelete={(id) =>
              actions.handleDelete(
                id,
                interaction.selectedId,
                interaction.setSelectedId
              )
            }
            snapLines={interaction.snapLines}
            setSnapLines={interaction.setSnapLines}
            viewport={interaction.viewport}
            zoom={interaction.zoom}
            onZoomChange={interaction.handleZoomChange}
            canvasHeight={canvasHeight}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => interaction.handleSelect(null)}
            onMouseMove={() => {}}
            onMouseUp={() => {}}
            otherCursors={otherCursors}
            otherSelections={otherSelections}
            collaboration={{
              otherCursors,
              otherSelections,
              updateCursorPosition,
              addComponent,
              updateComponent,
              removeComponent,
              updateAllComponents,
              getActiveUsers,
              undo,
              redo,
              getHistory,
              setHistory,
              isConnected,
            }}
            CanvasComponent={CanvasComponent}
            UserCursor={UserCursor}
            getComponentDimensions={getComponentDimensions}
            updateCursorPosition={updateCursorPosition}
            onAddSection={(sectionY) =>
              actions.handleAddSection(
                sectionY,
                containerRef,
                interaction.zoom
              )
            }
          />
        </div>

        {/* 속성 인스펙터 */}
        {selectedComp && (
          <Inspector
            selectedComp={selectedComp}
            onUpdate={actions.handleUpdate}
            viewport={interaction.viewport}
          />
        )}
      </div>

      {/* 모달들 */}
      <PreviewModal
        isOpen={interaction.isPreviewOpen}
        onClose={interaction.handlePreviewClose}
        pageId={pageId}
        components={components}
        canvasHeight={canvasHeight}
      />

      <TemplateModal
        isOpen={interaction.isTemplateSaveOpen}
        onClose={interaction.handleTemplateSaveClose}
        templateData={interaction.templateData}
        setTemplateData={interaction.setTemplateData}
        onSave={actions.handleSaveAsTemplate}
      />

      <InviteModal
        isOpen={interaction.isInviteOpen}
        onClose={interaction.handleInviteClose}
        pageId={pageId}
      />
    </div>
  );
}

export default NoCodeEditor;
