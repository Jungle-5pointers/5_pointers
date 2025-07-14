import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationToggle from '../../../components/NotificationToggle';
import { useDeploy } from '../ComponentLibrary/hooks/useDeploy';
import DeployModal from './DeployModal';
import { usePageMembers } from '../../../hooks/usePageMembers';
import { getUserColor } from '../../../utils/userColors';``
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
}) {
  const navigate = useNavigate();

  // 배포 관련 훅 (컴포넌트 라이브러리에서 사용하던 것을 재사용)
  const {
    setDomainName,
    handleDeploy,
    isDeploying,
    deployedUrl,
    resetDeploy,
  } = useDeploy();

  // 페이지 멤버 정보 가져오기
  const { members, otherMembers, currentUser, loading: membersLoading, refetch: refetchMembers } = usePageMembers(pageId);

  // 배포 모달 상태
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const membersDropdownRef = useRef(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (membersDropdownRef.current && !membersDropdownRef.current.contains(event.target)) {
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

  // refetchMembers 함수를 부모 컴포넌트로 전달
  useEffect(() => {
    if (onMembersRefetch) {
      onMembersRefetch(refetchMembers);
    }
  }, [refetchMembers, onMembersRefetch]);
  return (
    <div
      className="
        h-16 w-full
        bg-pink-50 backdrop-blur-sm border-b border-pink-100 
        flex items-center justify-between px-6
        shadow-sm
      "
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        height: '64px',
        backgroundColor: '#fdf2f8',
        borderBottom: '1px solid #fce7f3',
        color: '#1f2937',
        zIndex: 10,
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
            alt="뚝딱"
            className="w-13 h-6 object-contain"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
            DDUKDDAK
          </h1>
        </div>
      </div>

      {/* 중앙: 편집 기준 선택 및 멤버 정보 */}
      <div className="flex-1 flex justify-center mx-4 min-w-0">
        <div className="flex items-center gap-4">
          {/* DesignMode 선택 드롭다운 */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap">
              편집 기준
            </label>
            <select
              value={designMode}
              onChange={(e) => onDesignModeChange(e.target.value, pageId)}
              disabled={isFromTemplate}
              className={`
                px-3 py-2 text-sm
                border rounded-lg transition-colors
                ${isFromTemplate 
                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 cursor-pointer'
                }
              `}
              title={isFromTemplate ? '템플릿에서는 편집 기준을 변경할 수 없습니다' : '편집 기준 선택'}
            >
              {templateCategory !== 'wedding' && <option value="desktop">💻 데스크탑</option>}
              <option value="mobile">📱 모바일</option>
            </select>
          </div>

          {/* 멤버 정보 표시 */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap">
              멤버
            </label>
            <div className="relative" ref={membersDropdownRef}>
              {/* 현재 사용자와 멤버들을 가로로 배치 */}
              <div className="flex items-center gap-2">
                {/* 현재 사용자 표시 */}
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentUser ? getUserColor(currentUser.id) : '#10B981' }}
                  ></span>
                  <span className="max-w-16 truncate">
                    {currentUser?.nickname || '나'}
                  </span>
                </div>
                
                {/* 다른 멤버들 표시 (최대 2명까지) */}
                {otherMembers.slice(0, 2).map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      member.status === 'PENDING' 
                        ? 'bg-yellow-50 text-yellow-700' 
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: member.color }}
                    ></span>
                    <span className="max-w-16 truncate">
                      {member.nickname}
                    </span>
                  </div>
                ))}
                
                {/* 3명 이상이면 + 버튼 표시 */}
                {otherMembers.length > 2 && (
                  <button
                    onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                  >
                    +{otherMembers.length - 2}
                  </button>
                )}
              </div>
              
              {/* 멤버 드롭다운 */}
              {showMembersDropdown && otherMembers.length > 2 && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2 px-2">페이지 멤버</div>
                    {otherMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-gray-50 ${
                          member.status === 'PENDING' ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: member.color }}
                        ></span>
                        <span className="flex-1 truncate">
                          {member.nickname}
                        </span>
                        <span className={`text-xs ${
                          member.status === 'PENDING' 
                            ? 'text-yellow-600 font-medium' 
                            : 'text-gray-500'
                        }`}>
                          {member.isOwner ? '소유자' : 
                           member.status === 'PENDING' ? '초대 대기' : member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 우측: 버튼들 */}
      <div className="flex items-center min-w-0 flex-shrink-0 gap-3">
        {/* 연결 상태 표시 */}
        <div className="flex items-center gap-2">
          {connectionError ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>연결 오류</span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>연결됨</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              <span>연결 중...</span>
            </div>
          )}
        </div>

        {/* 템플릿 저장 버튼 (관리자만) */}
        {isAdmin && (
          <button
            onClick={onTemplateSaveOpen}
            className="
              px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800
              font-medium rounded-lg transition-colors duration-200
              flex items-center whitespace-nowrap text-sm
            "
          >
            <span className="material-symbols-outlined text-xl" title="템플릿 저장" aria-label="템플릿 저장">save</span>
          </button>
        )}

        {/* 공유 버튼 */}
        <button
          onClick={onInviteOpen}
          className="
            px-4 py-2 bg-white border border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700
            font-medium rounded-lg transition-colors duration-200
            flex items-center whitespace-nowrap text-sm
          "
        >
          <span className="material-symbols-outlined text-base" title="공유" aria-label="공유">group_add</span>
        </button>

        {/* 미리보기 버튼 */}
        <button
          onClick={onPreviewOpen}
          className="
            px-4 py-2 bg-white border border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700
            font-medium rounded-lg transition-colors duration-200
            flex items-center whitespace-nowrap text-sm
          "
        >
          미리보기
        </button>

        {/* 뚝딱 게시 버튼 (최우측, 강조 색상) */}
        <button
          onClick={() => setShowDeployModal(true)}
          disabled={isDeploying || !components || components.length === 0}
          className="
            px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500
            hover:from-pink-600 hover:to-rose-600 text-white
            font-medium rounded-lg transition-all duration-200
            flex items-center whitespace-nowrap text-sm
          "
        >
          게시
        </button>
      </div>
      {/* 배포 모달 */}
      <DeployModal
        isOpen={showDeployModal}
        onClose={() => { setShowDeployModal(false); resetDeploy(); }}
        isDeploying={isDeploying}
        deployedUrl={deployedUrl}
        onDeploy={(domain) => {
          handleDeploy(components, roomId, domain);
        }}
      />
    </div>
  );
}

export default EditorHeader;
