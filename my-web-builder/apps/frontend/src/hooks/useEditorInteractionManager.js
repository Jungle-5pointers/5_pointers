import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../config';

/**
 * 에디터 UI 상호작용 관리 훅
 * - UI 상태 관리 (선택, 줌, 패널, 모달 등)
 * - 뷰포트/편집모드 전환 핸들러
 */
export function useEditorInteractionManager(designMode, setDesignMode, roomId) {
  // UI 상태 관리
  const [selectedId, setSelectedId] = useState(null);
  const [snapLines, setSnapLines] = useState({ vertical: [], horizontal: [] });
  const [zoom, setZoom] = useState(100);
  const [viewport, setViewport] = useState(designMode);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 모달 상태들
  const [isTemplateSaveOpen, setIsTemplateSaveOpen] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: '',
    category: 'wedding',
    tags: '',
  });
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // designMode가 외부(PageDataManager)에서 바뀌면 viewport 동기화
  useEffect(() => {
    setViewport(designMode);
  }, [designMode]);

  // 선택 핸들러
  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  // 줌 변경 핸들러
  const handleZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  // 뷰포트 전환 핸들러
  const handleViewportChange = useCallback(
    (newViewport) => {
      console.log(`🔄 뷰포트 변경: ${viewport} → ${newViewport}`);
      setViewport(newViewport);
      // 뷰포트 변경 시 선택된 컴포넌트 해제 (UX 향상)
      setSelectedId(null);
      // 뷰포트 변경 시 스냅라인 초기화
      setSnapLines({ vertical: [], horizontal: [] });
      console.log('🧹 뷰포트 변경으로 인한 스냅라인 초기화');
    },
    [viewport]
  );

  // 편집 기준 모드 변경 핸들러
  const handleDesignModeChange = useCallback(
    async (newDesignMode) => {
      if (newDesignMode === designMode) return;
      if (!roomId) {
        console.error('roomId가 필요합니다.');
        alert('페이지 ID가 유효하지 않습니다.');
        return;
      }

      // 변경 확인 메시지
      const confirmChange = window.confirm(
        `편집 기준을 "${newDesignMode === 'desktop' ? '데스크탑' : '모바일'}"으로 변경하시겠습니까?\n\n이 변경사항은 저장됩니다.`
      );

      if (!confirmChange) return;

      console.log(
        `🔄 편집 기준 변경: ${designMode} → ${newDesignMode} (roomId: ${roomId})`
      );

      try {
        // API 호출하여 DB에 designMode 저장
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_BASE_URL}/users/pages/${roomId}/design-mode`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ designMode: newDesignMode }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('서버 응답:', errorText);
          throw new Error('편집 기준 변경 실패');
        }

        // API 성공 후 상태 업데이트
        setDesignMode(newDesignMode);
        // 편집 기준이 변경되면 뷰포트를 동일하게 설정
        setViewport(newDesignMode);
        // 선택 해제
        setSelectedId(null);

        console.log(
          `✅ 편집 기준이 ${newDesignMode}으로 성공적으로 변경되었습니다.`
        );
      } catch (error) {
        console.error('편집 기준 변경 실패:', error);
        alert('편집 기준 변경에 실패했습니다. 다시 시도해주세요.');
      }
    },
    [designMode, setDesignMode, roomId]
  );

  // 템플릿 저장 관련 핸들러들
  const handleTemplateSaveOpen = useCallback(() => {
    setIsTemplateSaveOpen(true);
  }, []);

  const handleTemplateSaveClose = useCallback(() => {
    setIsTemplateSaveOpen(false);
    setTemplateData({ name: '', category: 'wedding', tags: '' });
  }, []);

  // 초대 모달 관련 핸들러들
  const handleInviteOpen = useCallback(() => {
    setIsInviteOpen(true);
  }, []);

  const handleInviteClose = useCallback(() => {
    setIsInviteOpen(false);
  }, []);

  // 미리보기 모달 관련 핸들러들
  const handlePreviewOpen = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const handlePreviewClose = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  // 라이브러리 토글 핸들러
  const handleLibraryToggle = useCallback(() => {
    setIsLibraryOpen((prev) => !prev);
  }, []);

  return {
    // 상태
    selectedId,
    setSelectedId,
    snapLines,
    setSnapLines,
    zoom,
    viewport,
    isLibraryOpen,
    isPreviewOpen,
    isTemplateSaveOpen,
    templateData,
    setTemplateData,
    isInviteOpen,

    // 핸들러들
    handleSelect,
    handleZoomChange,
    handleViewportChange,
    handleDesignModeChange,
    handleTemplateSaveOpen,
    handleTemplateSaveClose,
    handleInviteOpen,
    handleInviteClose,
    handlePreviewOpen,
    handlePreviewClose,
    handleLibraryToggle,
  };
}
