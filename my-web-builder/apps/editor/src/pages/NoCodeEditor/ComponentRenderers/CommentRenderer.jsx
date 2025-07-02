import React, { useState, useEffect } from 'react';

function CommentRenderer({ comp, isEditor = false }) {
  const { title, placeholder, backgroundColor } = comp.props;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ author: '', content: '', password: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');

  // 댓글 목록 조회
  const fetchComments = async () => {
    if (isEditor) return; // 에디터 모드에서는 API 호출 안함
    
    try {
      const response = await fetch(`http://localhost:3000/pages/${comp.pageId}/comments/${comp.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.author || !newComment.content || !newComment.password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/pages/${comp.pageId}/comments/${comp.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      });

      if (response.ok) {
        setNewComment({ author: '', content: '', password: '' });
        fetchComments(); // 댓글 목록 새로고침
      } else {
        alert('댓글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async () => {
    if (!deletePassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/pages/${comp.pageId}/comments/${comp.id}/${showDeleteModal}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword })
      });

      if (response.ok) {
        setShowDeleteModal(null);
        setDeletePassword('');
        fetchComments(); // 댓글 목록 새로고침
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [comp.id, comp.pageId, isEditor]);

  // 에디터 모드에서도 실제 UI를 보여주되 버튼만 비활성화

  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor,
      minWidth: '250px',
      minHeight: '150px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    }}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {title || '축하 메세지를 남겨주세요'}
      </h3>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="이름"
            value={newComment.author}
            onChange={(e) => setNewComment({...newComment, author: e.target.value})}
            className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={newComment.password}
            onChange={(e) => setNewComment({...newComment, password: e.target.value})}
            className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <textarea
          placeholder={placeholder || "댓글을 남겨주세요"}
          value={newComment.content}
          onChange={(e) => setNewComment({...newComment, content: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
          rows="3"
        />
        <button
          type="submit"
          disabled={isEditor}
          className={`mt-3 px-4 py-2 rounded-lg text-sm transition-colors ${
            isEditor 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isEditor ? '배포 후 사용 가능' : '댓글 작성'}
        </button>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-3">
        {isEditor ? (
          // 에디터 모드에서 샘플 댓글 보여주기
          <>
            <div className="relative p-4 bg-white border rounded-lg">
              <button
                disabled={true}
                className="absolute top-2 right-2 w-6 h-6 text-gray-300 cursor-not-allowed"
              >
                ×
              </button>
              <div className="pr-8">
                <div className="font-medium text-gray-800 mb-1">샘플 사용자</div>
                <div className="text-gray-600 text-sm leading-relaxed">이곳에 댓글이 표시됩니다. 배포 후에 실제 댓글을 작성할 수 있습니다.</div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="relative p-4 bg-white border rounded-lg">
              <button
                disabled={true}
                className="absolute top-2 right-2 w-6 h-6 text-gray-300 cursor-not-allowed"
              >
                ×
              </button>
              <div className="pr-8">
                <div className="font-medium text-gray-800 mb-1">또 다른 사용자</div>
                <div className="text-gray-600 text-sm leading-relaxed">댓글 예시입니다.</div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            첫 번째 댓글을 남겨보세요!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="relative p-4 bg-white border rounded-lg">
              <button
                onClick={() => setShowDeleteModal(comment.id)}
                className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"
              >
                ×
              </button>
              <div className="pr-8">
                <div className="font-medium text-gray-800 mb-1">{comment.author}</div>
                <div className="text-gray-600 text-sm leading-relaxed">{comment.content}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-4">댓글 삭제</h3>
            <p className="text-gray-600 mb-4">댓글 작성 시 입력한 비밀번호를 입력해주세요.</p>
            <input
              type="password"
              placeholder="비밀번호"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 outline-none focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleDeleteComment()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteComment}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(null);
                  setDeletePassword('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentRenderer;