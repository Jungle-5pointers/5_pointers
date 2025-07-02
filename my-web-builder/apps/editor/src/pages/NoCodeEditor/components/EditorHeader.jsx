import React from 'react';
import ViewportController from '../ViewportController';

function EditorHeader({
  components,
  selectedComp,
  isLibraryOpen,
  viewport,
  onViewportChange,
  onPreviewOpen,
  onTemplateSaveOpen,
  onInviteOpen,
  roomId,
  isAdmin
}) {
  return (
    <div 
      className="
        h-16 w-full
        bg-white/95 backdrop-blur-sm border-b border-blue-200/30 
        flex items-center justify-between px-6
        shadow-sm
      "
    >
      {/* 좌측: 로고와 컴포넌트 개수 */}
      <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
          PAGE CUBE
        </h1>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium whitespace-nowrap">
          {components.length}개
        </div>
      </div>

      {/* 중앙: 뷰포트 컨트롤러 */}
      <div className="flex-1 flex justify-center mx-4 min-w-0">
        <div className="max-w-md">
          <ViewportController
            currentViewport={viewport}
            onViewportChange={onViewportChange}
          />
        </div>
      </div>

      {/* 우측: 버튼들 */}
      <div className="flex items-center min-w-0 flex-shrink-0 gap-3">
        {/* 템플릿 저장 버튼 (관리자만) */}
        {isAdmin && (
          <button
            onClick={onTemplateSaveOpen}
            className="
              px-4 py-2
              bg-gradient-to-r from-emerald-500 to-green-500 
              hover:from-emerald-600 hover:to-green-600
              text-white font-medium rounded-lg
              transition-all duration-200 transform hover:scale-105 hover:shadow-lg
              flex items-center gap-2 whitespace-nowrap
              text-sm
            "
          >
                          <span className="text-base">💾</span>
              <span className="hidden sm:inline">템플릿 저장</span>
          </button>
        )}
        
        {/* 공유 버튼 */}
        <button
          onClick={onInviteOpen}
          className="
            px-4 py-2
            bg-gradient-to-r from-purple-600 to-pink-600 
            hover:from-purple-700 hover:to-pink-700
            text-white font-medium rounded-lg
            transition-all duration-200 transform hover:scale-105 hover:shadow-lg
            flex items-center gap-2 whitespace-nowrap
            text-sm
          "
        >
          <span className="text-base">👥</span>
          <span className="hidden sm:inline">공유</span>
        </button>
        
        {/* 미리보기 버튼 */}
        <button
          onClick={onPreviewOpen}
          className="
            px-4 py-2
            bg-gradient-to-r from-blue-600 to-indigo-600 
            hover:from-blue-700 hover:to-indigo-700
            text-white font-medium rounded-lg
            transition-all duration-200 transform hover:scale-105 hover:shadow-lg
            flex items-center gap-2 whitespace-nowrap
            text-sm
          "
        >
                      <span className="text-base">🔍</span>
            <span className="hidden sm:inline">미리보기</span>
        </button>

        {/* Room ID 표시 - 작은 화면에서는 숨김 */}
        <div className="hidden md:flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
          <span className="hidden lg:inline">Room: </span>
          <span className="font-mono">{roomId}</span>
        </div>

        {/* 작은 화면용 Room ID */}
        <div className="md:hidden flex px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
          {roomId.slice(0, 6)}
        </div>
      </div>
    </div>
  );
}

export default EditorHeader; 