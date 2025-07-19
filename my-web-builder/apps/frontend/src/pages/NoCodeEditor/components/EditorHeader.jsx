import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationToggle from '../../../components/NotificationToggle';
import { useDeploy } from '../ComponentLibrary/hooks/useDeploy';
import DeployModal from './DeployModal';
import { usePageMembers } from '../../../hooks/usePageMembers';
import { getUserColor } from '../../../utils/userColors';
import { colors } from '../../../styles/colors';
import ddukddakLogo from '/ddukddak-logo.png';

function EditorHeader({
  components,
  selectedComp,
  isLibraryOpen,
  viewport,
  designMode,
  onViewportChange,
  onDesignModeChange,
  onPreviewOpen,
  onTemplateSaveOpen,
  onInviteOpen,
  pageId,
  roomId,
  isConnected,
  connectionError,
  isAdmin,
  templateCategory = null,
  isFromTemplate = false,
  onMembersRefetch,
  pageTitle = '',
  onPageTitleChange,
}) {
  const navigate = useNavigate();

  // 배포 관련 훅 (컴포넌트 라이브러리에서 사용하던 것을 재사용)
  const {
    setDomainName,
    handleDeploy,
    isDeploying,
    deployedUrl,
    errorMessage,
    resetDeploy,
  } = useDeploy();

  // 페이지 멤버 정보 가져오기
  const {
    members,
    otherMembers,
    currentUser,
    loading: membersLoading,
    refetch: refetchMembers,
  } = usePageMembers(pageId);

  // 배포 모달 상태
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const membersDropdownRef = useRef(null);

  // 페이지 제목 수정 상태
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(pageTitle);
  const titleInputRef = useRef(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        membersDropdownRef.current &&
        !membersDropdownRef.current.contains(event.target)
      ) {
        setShowMembersDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  // 제목 수정 시작
  const startEditTitle = () => {
    setIsEditingTitle(true);
    setEditingTitle(pageTitle);
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
      }
    }, 100);
  };

  // 제목 수정 취소
  const cancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditingTitle(pageTitle);
  };

  // 제목 수정 저장
  const saveEditTitle = () => {
    if (editingTitle.trim() && onPageTitleChange) {
      onPageTitleChange(editingTitle.trim());
    }
    setIsEditingTitle(false);
  };

  // 제목 수정 중 Enter 키 처리
  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEditTitle();
    } else if (e.key === 'Escape') {
      cancelEditTitle();
    }
  };

  // refetchMembers 함수를 부모 컴포넌트로 전달
  useEffect(() => {
    if (onMembersRefetch) {
      onMembersRefetch(refetchMembers);
    }
  }, [refetchMembers, onMembersRefetch]);

  // 페이지 제목이 변경될 때마다 상태 업데이트
  useEffect(() => {
    setEditingTitle(pageTitle);
  }, [pageTitle]);
  return (
    <div
      className="
        h-16 w-full
        backdrop-blur-sm border-b border-pink-100 
        flex items-center justify-between px-6
        shadow-sm
      "
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        height: '64px',
        background: 'linear-gradient(to right, #FE969B, #CF9AC0)',
        borderBottom: '1px solid #fce7f3',
        color: '#1f2937',
        zIndex: 1000,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* 좌측: 로고와 컴포넌트 개수 */}
      <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
        {/* 로고 */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={handleLogoClick}
        >
          <img
            src={ddukddakLogo}
            alt="DDUKDDAK"
            className="h-9 w-auto object-contain"
            style={{ maxWidth: '120px' }}
          />
        </div>
      </div>

      {/* 중앙: 화면 기준 및 페이지 제목 */}
      <div className="flex-1 flex justify-center mx-4 min-w-0">
        <div className="flex items-center gap-6">
          {/* DesignMode 선택 드롭다운 */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/80 font-medium whitespace-nowrap">
              화면 기준
            </label>
            <select
              value={designMode}
              onChange={(e) => onDesignModeChange(e.target.value, pageId)}
              disabled={isFromTemplate}
              className={`
                px-3 py-2 text-sm
                border rounded-lg transition-colors
                ${
                  isFromTemplate
                    ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-pink-500 hover:border-blue-400 cursor-pointer'
                }
              `}
              title={
                isFromTemplate
                  ? '템플릿에서는 편집 기준을 변경할 수 없습니다'
                  : '편집 기준 선택'
              }
            >
              {templateCategory !== 'wedding' && (
                <option value="desktop">데스크탑</option>
              )}
              <option value="mobile">모바일</option>
            </select>
          </div>

          {/* 페이지 제목 */}
          <div className="flex items-center gap-2 min-w-48">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={saveEditTitle}
                onKeyDown={handleTitleKeyPress}
                className="
                  px-3 py-1 text-lg font-light text-white text-center
                  bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
                  w-48 max-w-96
                  placeholder:text-gray-300 placeholder:font-light
                "
                placeholder="페이지 제목을 입력하세요"
                style={{ textAlign: 'center' }}
              />
            ) : (
              <button
                onClick={startEditTitle}
                className="
                  px-3 py-1 text-lg font-semibold text-white
                  hover:bg-white/10 rounded-lg transition-colors
                  w-64 max-w-96 truncate
                "
                title="클릭하여 제목 수정"
              >
                {pageTitle && pageTitle.length > 15 
                  ? `${pageTitle.substring(0, 15)}...` 
                  : (pageTitle || '제목 없음')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 우측: 버튼들 */}
      <div className="flex items-center min-w-0 flex-shrink-0 gap-3">
        {/* 멤버 정보 표시 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/80 font-medium whitespace-nowrap">
            멤버
          </span>
          <div className="relative" ref={membersDropdownRef}>
            {/* 현재 사용자와 멤버들을 가로로 배치 */}
            <div className="flex items-center gap-2">
              {/* 현재 사용자 표시 */}
              <div
                className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/90"
                style={{
                  color: currentUser ? getUserColor(currentUser.id) : '#EC4899',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: currentUser
                      ? getUserColor(currentUser.id)
                      : '#EC4899',
                  }}
                ></span>
                <span className="max-w-16 truncate">
                  {currentUser?.nickname || '나'}
                </span>
              </div>

              {/* 다른 멤버들 표시 (최대 2명까지) */}
              {otherMembers.slice(0, 2).map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${member.status === 'PENDING' ? 'bg-white/40' : 'bg-white/90'}`}
                  style={{
                    color: member.color,
                  }}
                  title={member.status === 'PENDING' ? '수락 대기 중' : '편집 중'}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: member.color }}
                  ></span>
                  <span className="max-w-16 truncate">{member.nickname}</span>
                </div>
              ))}

              {/* 3명 이상이면 + 버튼 표시 */}
              {otherMembers.length > 2 && (
                <button
                  onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                >
                  +{otherMembers.length - 2}
                </button>
              )}
            </div>

            {/* 멤버 드롭다운 */}
            {showMembersDropdown && otherMembers.length > 2 && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2 px-2">
                    페이지 멤버
                  </div>
                  {otherMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-gray-50 ${member.status === 'PENDING' ? 'bg-gray-50' : ''}`}
                      style={{
                        color: member.color
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: member.color }}
                      ></span>
                      <span className="flex-1 truncate">{member.nickname}</span>
                      <span
                        className="text-xs text-gray-500 font-medium"
                      >
                        {member.isOwner
                          ? '소유자'
                          : member.status === 'PENDING'
                            ? '수락대기'
                            : '편집 중'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 템플릿 저장 버튼 (관리자만) */}
        {isAdmin && (
          <button
            onClick={onTemplateSaveOpen}
            className="
              w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white
              font-medium rounded-lg transition-all duration-300
              flex items-center justify-center
            "
            title="템플릿 저장"
          >
            <span
              className="material-symbols-outlined text-base"
              aria-label="템플릿 저장"
            >
              save
            </span>
          </button>
        )}

        {/* 공유 버튼 */}
        <button
          onClick={onInviteOpen}
          className="
            w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white
            font-medium rounded-lg transition-all duration-300
            flex items-center justify-center
          "
        >
          <span
            className="material-symbols-outlined text-base"
            title="공유"
            aria-label="공유"
          >
            group_add
          </span>
        </button>

        {/* 미리보기 버튼 */}
        <button
          onClick={onPreviewOpen}
          className="
            h-10 px-4 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white
            font-medium rounded-lg transition-all duration-300
            flex items-center whitespace-nowrap text-sm
          "
        >
          미리보기
        </button>

        {/* 최종 확정 버튼 */}
        <button
          onClick={() => setShowDeployModal(true)}
          disabled={isDeploying || !components || components.length === 0}
          className="
            h-10 px-4 text-white font-medium rounded-lg
            flex items-center whitespace-nowrap text-sm border border-white/30
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          style={{
            backgroundColor: '#8477FF',
          }}
        >
          최종 확정
        </button>
      </div>
      {/* 배포 모달 */}
      <DeployModal
        isOpen={showDeployModal}
        onClose={() => {
          setShowDeployModal(false);
          resetDeploy();
        }}
        isDeploying={isDeploying}
        deployedUrl={deployedUrl}
        errorMessage={errorMessage}
        onDeploy={(domain) => {
          handleDeploy(components, roomId, domain, designMode);
        }}
      />
    </div>
  );
}

export default EditorHeader;
