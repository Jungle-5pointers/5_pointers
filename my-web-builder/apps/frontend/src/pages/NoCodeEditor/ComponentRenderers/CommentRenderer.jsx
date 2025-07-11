import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

function CommentRenderer({ comp, isEditor = false, viewport = 'desktop', pageId }) {
  const { title, placeholder, backgroundColor } = comp.props;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    author: '',
    content: '',
    password: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');

  // 댓글 목록 조회
  const fetchComments = async () => {
    if (isEditor) return; // 에디터 모드에서는 API 호출 안함

    const actualPageId = pageId || comp.pageId;
    const actualApiBaseUrl = API_BASE_URL || (typeof window !== 'undefined' ? window.API_BASE_URL : null);
    
    if (!actualPageId || !actualApiBaseUrl) {
      return;
    }

    try {
      const apiUrl = `${actualApiBaseUrl}/users/pages/${actualPageId}/comments/${comp.id}`;
      
      const response = await fetch(apiUrl);
      console.log('🚀 CommentRenderer - API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🚀 CommentRenderer - API 응답 데이터:', data);
        setComments(data);
      } else {
        console.error('❌ CommentRenderer - API 응답 오류:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ CommentRenderer - 댓글 조회 실패:', error);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.author || !newComment.content || !newComment.password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const actualPageId = pageId || comp.pageId;
    const actualApiBaseUrl = API_BASE_URL || (typeof window !== 'undefined' ? window.API_BASE_URL : null);
    
    console.log('🚀 CommentRenderer - handleSubmitComment 호출');
    console.log('🚀 CommentRenderer - actualPageId:', actualPageId);
    console.log('🚀 CommentRenderer - actualApiBaseUrl:', actualApiBaseUrl);
    console.log('🚀 CommentRenderer - comp.id:', comp.id);
    console.log('🚀 CommentRenderer - newComment:', newComment);
    
    if (!actualPageId || !actualApiBaseUrl) {
      console.error('❌ CommentRenderer - pageId 또는 API_BASE_URL이 없습니다', {
        actualPageId,
        actualApiBaseUrl,
        comp: comp
      });
      alert('페이지 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    try {
      const apiUrl = `${actualApiBaseUrl}/users/pages/${actualPageId}/comments/${comp.id}`;
      console.log('🚀 CommentRenderer - POST API 호출 URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });

      if (response.ok) {
        const result = await response.json();
        
        setNewComment({ author: '', content: '', password: '' });
        await fetchComments(); // 댓글 목록 새로고침
        alert('댓글이 성공적으로 등록되었습니다.');
      } else {
        const errorText = await response.text();
        console.error('API 응답 에러:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        alert(`댓글 등록에 실패했습니다. (${response.status}: ${response.statusText})`);
      }
    } catch (error) {
      console.error('댓글 등록 실패:', error);
      alert(`댓글 등록에 실패했습니다. 네트워크 오류: ${error.message}`);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async () => {
    if (!deletePassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/pages/${comp.pageId}/comments/${comp.id}/${showDeleteModal}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: deletePassword }),
        }
      );

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

  // viewport에 따른 반응형 스타일 계산
  const getResponsiveStyles = () => {
    const isMobile = viewport === 'mobile';

    return {
      containerPadding: isMobile ? '16px' : '24px',
      titleFontSize: isMobile ? '16px' : '18px',
      inputPadding: isMobile ? '6px 10px' : '8px 12px',
      inputFontSize: isMobile ? '13px' : '14px',
      buttonPadding: isMobile ? '6px 12px' : '8px 16px',
      commentPadding: isMobile ? '12px' : '16px',
      minWidth: isMobile ? '200px' : '250px',
      minHeight: isMobile ? '120px' : '150px',
      gridColumns: isMobile ? '1fr' : '1fr 1fr',
      textareaHeight: isMobile ? '60px' : '80px',
    };
  };

  const styles = getResponsiveStyles();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: styles.containerPadding,
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        backgroundColor,
        minWidth: styles.minWidth,
        minHeight: styles.minHeight,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h3
        style={{
          fontSize: styles.titleFontSize,
          fontWeight: '600',
          marginBottom: '16px',
          color: '#1f2937',
          whiteSpace: 'pre-wrap', // ✅
        }}
      >
        {title || '축하 메세지를 남겨주세요'}
      </h3>

      {/* 댓글 작성 폼 */}
      <form
        onSubmit={handleSubmitComment}
        style={{
          marginBottom: viewport === 'mobile' ? '16px' : '24px',
          padding: styles.commentPadding,
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column', 
            gridTemplateColumns: styles.gridColumns,
            gap: viewport === 'mobile' ? '8px' : '12px',
            marginBottom: viewport === 'mobile' ? '8px' : '12px',
          }}
        >
          <input
            type="text"
            placeholder="이름"
            value={newComment.author}
            onChange={(e) =>
              setNewComment({ ...newComment, author: e.target.value })
            }
            style={{
              padding: styles.inputPadding,
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: styles.inputFontSize,
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={newComment.password}
            onChange={(e) =>
              setNewComment({ ...newComment, password: e.target.value })
            }
            style={{
              padding: styles.inputPadding,
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: styles.inputFontSize,
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          />
        </div>
        <textarea
          placeholder={placeholder || '댓글을 남겨주세요'}
          value={newComment.content}
          onChange={(e) =>
            setNewComment({ ...newComment, content: e.target.value })
          }
          style={{
            width: '100%',
            padding: styles.inputPadding,
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: styles.inputFontSize,
            outline: 'none',
            resize: 'none',
            minHeight: styles.textareaHeight,
            whiteSpace: 'pre-wrap', // ✅
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          rows="3"
        />
        <button
          type="submit"
          disabled={isEditor}
          style={{
            marginTop: viewport === 'mobile' ? '8px' : '12px',
            padding: styles.buttonPadding,
            borderRadius: '6px',
            fontSize: styles.inputFontSize,
            border: 'none',
            cursor: isEditor ? 'not-allowed' : 'pointer',
            backgroundColor: isEditor ? '#d1d5db' : '#2563eb',
            color: isEditor ? '#6b7280' : '#ffffff',
            transition: 'background-color 0.2s',
            whiteSpace: 'pre-wrap', // ✅
          }}
          onMouseOver={(e) => {
            if (!isEditor) e.target.style.backgroundColor = '#1d4ed8';
          }}
          onMouseOut={(e) => {
            if (!isEditor) e.target.style.backgroundColor = '#2563eb';
          }}
        >
          {isEditor ? '배포 후 사용 가능' : '댓글 작성'}
        </button>
      </form>

      {/* 댓글 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isEditor ? (
          <>
            <div
              style={{
                position: 'relative',
                padding: styles.commentPadding,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            >
              <button
                disabled={true}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  color: '#d1d5db',
                  cursor: 'not-allowed',
                  border: 'none',
                  background: 'none',
                  fontSize: '16px',
                }}
              >
                ×
              </button>
              <div style={{ paddingRight: '32px' }}>
                <div
                  style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    marginBottom: '4px',
                  }}
                >
                  샘플 사용자
                </div>
                <div
                  style={{
                    color: '#4b5563',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap', // ✅
                  }}
                >
                  이곳에 댓글이 표시됩니다. 배포 후에 실제 댓글을 작성할 수
                  있습니다.
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '8px',
                  }}
                >
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            <div
              style={{
                position: 'relative',
                padding: styles.commentPadding,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            >
              <button
                disabled={true}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  color: '#d1d5db',
                  cursor: 'not-allowed',
                  border: 'none',
                  background: 'none',
                  fontSize: '16px',
                }}
              >
                ×
              </button>
              <div style={{ paddingRight: '32px' }}>
                <div
                  style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    marginBottom: '4px',
                  }}
                >
                  또 다른 사용자
                </div>
                <div
                  style={{
                    color: '#4b5563',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap', // ✅
                  }}
                >
                  댓글 예시입니다.
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '8px',
                  }}
                >
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </>
        ) : comments.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#6b7280',
              padding: '32px 0',
            }}
          >
            첫 번째 댓글을 남겨보세요!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                position: 'relative',
                padding: styles.commentPadding,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            >
              <button
                onClick={() => setShowDeleteModal(comment.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  fontSize: '16px',
                  transition: 'color 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.color = '#ef4444')}
                onMouseOut={(e) => (e.target.style.color = '#9ca3af')}
              >
                ×
              </button>
              <div style={{ paddingRight: '32px' }}>
                <div
                  style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    marginBottom: '4px',
                  }}
                >
                  {comment.author}
                </div>
                <div
                  style={{
                    color: '#4b5563',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap', // ✅
                  }}
                >
                  {comment.content}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '8px',
                  }}
                >
                  {new Date(comment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: styles.containerPadding,
              borderRadius: '8px',
              width: viewport === 'mobile' ? '280px' : '320px',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                whiteSpace: 'pre-wrap', // ✅
              }}
            >
              댓글 삭제
            </h3>
            <p
              style={{
                color: '#4b5563',
                marginBottom: '16px',
                whiteSpace: 'pre-wrap', // ✅
              }}
            >
              댓글 작성 시 입력한 비밀번호를 입력해주세요.
            </p>
            <input
              type="password"
              placeholder="비밀번호"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              style={{
                width: '100%',
                padding: styles.inputPadding,
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                marginBottom: viewport === 'mobile' ? '12px' : '16px',
                outline: 'none',
                fontSize: styles.inputFontSize,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              onKeyPress={(e) => e.key === 'Enter' && handleDeleteComment()}
            />
            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              <button
                onClick={handleDeleteComment}
                style={{
                  flex: 1,
                  padding: styles.buttonPadding,
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontSize: styles.inputFontSize,
                  whiteSpace: 'pre-wrap', // ✅
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#b91c1c')
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = '#dc2626')}
              >
                삭제
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(null);
                  setDeletePassword('');
                }}
                style={{
                  flex: 1,
                  padding: styles.buttonPadding,
                  backgroundColor: '#d1d5db',
                  color: '#374151',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontSize: styles.inputFontSize,
                  whiteSpace: 'pre-wrap', // ✅
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#9ca3af')
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = '#d1d5db')}
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