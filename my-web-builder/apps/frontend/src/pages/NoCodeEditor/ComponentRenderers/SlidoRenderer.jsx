import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../../config';

function SlidoRenderer({ comp, isEditor = false }) {
  const { question, placeholder, backgroundColor } = comp.props;
  const [opinions, setOpinions] = useState([]);
  const [newOpinion, setNewOpinion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animatingItems, setAnimatingItems] = useState([]);
  const [opinionGroups, setOpinionGroups] = useState({});
  const intervalRef = useRef(null);

  // 동일한 의견 그룹화 함수
  const groupOpinions = (opinions) => {
    const groups = {};
    opinions.forEach(opinion => {
      const normalizedContent = opinion.content.trim().toLowerCase();
      if (!groups[normalizedContent]) {
        groups[normalizedContent] = [];
      }
      groups[normalizedContent].push(opinion);
    });
    return groups;
  };

  // 의견 목록 조회
  const fetchOpinions = async () => {
    if (isEditor) return; // 에디터 모드에서는 API 호출 안함
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/pages/${comp.pageId}/slido/${comp.id}`);
      if (response.ok) {
        const data = await response.json();
        // 새로운 의견이 있는지 확인하고 애니메이션 추가
        const newItems = data.filter(item => !opinions.find(existing => existing.id === item.id));
        if (newItems.length > 0) {
          setAnimatingItems(prev => [...prev, ...newItems.map(item => item.id)]);
          setTimeout(() => {
            setAnimatingItems(prev => prev.filter(id => !newItems.find(item => item.id === id)));
          }, 1000);
        }
        setOpinions(data);
        // 의견 그룹 업데이트
        const groups = groupOpinions(data);
        setOpinionGroups(groups);
      }
    } catch (error) {
      console.error('의견 조회 실패:', error);
    }
  };

  // 의견 작성
  const handleSubmitOpinion = async (e) => {
    e.preventDefault();
    if (!newOpinion.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/pages/${comp.pageId}/slido/${comp.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newOpinion.trim() })
      });

      if (response.ok) {
        setNewOpinion('');
        fetchOpinions(); // 의견 목록 새로고침
      } else {
        alert('의견 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('의견 제출 실패:', error);
      alert('의견 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 실시간 업데이트를 위한 폴링
  useEffect(() => {
    if (!isEditor) {
      fetchOpinions(); // 초기 로드
      intervalRef.current = setInterval(fetchOpinions, 3000); // 3초마다 업데이트
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [comp.id, comp.pageId, isEditor]);

  // 애니메이션 스타일
  const getOpinionStyle = (opinion) => {
    const isAnimating = animatingItems.includes(opinion.id);
    const normalizedContent = opinion.content.trim().toLowerCase();
    const groupSize = opinionGroups[normalizedContent]?.length || 1;
    
    // 그룹 크기에 따른 스케일 계산 (2개 이상부터 확대)
    const groupScale = groupSize >= 2 ? 1 + (groupSize - 1) * 0.1 : 1;
    const maxScale = 1.5; // 최대 확대 비율
    const finalScale = Math.min(groupScale, maxScale);
    
    // 그룹 크기에 따른 색상 변화
    const getGroupColor = (size) => {
      if (size >= 5) return '#e3f2fd'; // 강한 파란색
      if (size >= 3) return '#f3e5f5'; // 보라색
      if (size >= 2) return '#fff3e0'; // 주황색
      return '#f8f9fa'; // 기본 색상
    };
    
    const getBorderColor = (size) => {
      if (size >= 5) return '#2196f3'; // 강한 파란색 테두리
      if (size >= 3) return '#9c27b0'; // 보라색 테두리
      if (size >= 2) return '#ff9800'; // 주황색 테두리
      return '#e9ecef'; // 기본 테두리
    };
    
    return {
      padding: '12px 16px',
      margin: '8px 0',
      backgroundColor: getGroupColor(groupSize),
      borderRadius: '12px',
      border: `2px solid ${getBorderColor(groupSize)}`,
      fontSize: groupSize >= 2 ? '16px' : '14px',
      lineHeight: '1.4',
      color: '#495057',
      wordBreak: 'break-word',
      transform: isAnimating ? `scale(${finalScale * 1.05})` : `scale(${finalScale})`,
      opacity: isAnimating ? 0.8 : 1,
      transition: 'all 0.5s ease-in-out',
      animation: isAnimating ? 'slideIn 0.5s ease-out' : (groupSize >= 2 ? 'glow 2s infinite' : 'none'),
      boxShadow: groupSize >= 2 ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative',
      zIndex: groupSize >= 2 ? 10 : 1
    };
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      backgroundColor,
      minWidth: '300px',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes slideIn {
          0% {
            transform: translateY(-20px) scale(0.9);
            opacity: 0;
          }
          50% {
            transform: translateY(0) scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            background-color: #f8f9fa;
          }
          50% {
            background-color: #e9ecef;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          50% {
            box-shadow: 0 8px 24px rgba(255, 148, 0, 0.4);
          }
        }
        
        .pulsing {
          animation: pulse 2s infinite;
        }
        
        .glowing {
          animation: glow 2s infinite;
        }
      `}</style>

      {/* 질문 제목 */}
      <div style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#1f2937',
        textAlign: 'center'
      }}>
        {question || '여러분의 의견을 들려주세요'}
      </div>

      {/* 의견 입력 폼 */}
      <form onSubmit={handleSubmitOpinion} style={{
        marginBottom: '20px',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          placeholder={placeholder || "의견을 입력하세요..."}
          value={newOpinion}
          onChange={(e) => setNewOpinion(e.target.value)}
          disabled={isEditor || isSubmitting}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '25px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: isEditor ? '#f8f9fa' : '#ffffff'
          }}
          onFocus={(e) => {
            if (!isEditor) e.target.style.borderColor = '#007bff';
          }}
          onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
        />
        <button
          type="submit"
          disabled={isEditor || isSubmitting || !newOpinion.trim()}
          style={{
            padding: '12px 20px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: isEditor || isSubmitting || !newOpinion.trim() ? '#d1d5db' : '#007bff',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isEditor || isSubmitting || !newOpinion.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            minWidth: '60px'
          }}
          onMouseOver={(e) => {
            if (!isEditor && !isSubmitting && newOpinion.trim()) {
              e.target.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseOut={(e) => {
            if (!isEditor && !isSubmitting && newOpinion.trim()) {
              e.target.style.backgroundColor = '#007bff';
            }
          }}
        >
          {isSubmitting ? '...' : '제출'}
        </button>
      </form>

      {/* 의견 목록 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: 'calc(100% - 120px)'
      }}>
        {isEditor ? (
          // 에디터 모드에서 샘플 의견들 표시
          <div>
            <div style={getOpinionStyle({id: 'sample1', content: '이런 아이디어는 어떨까요?'})}>
              이런 아이디어는 어떨까요? 정말 흥미로운 주제네요! 👍
            </div>
            <div style={getOpinionStyle({id: 'sample2', content: '저도 비슷한 생각을 했었는데'})}>
              저도 비슷한 생각을 했었는데, 더 구체적으로 설명해주실 수 있나요?
            </div>
            <div style={getOpinionStyle({id: 'sample3', content: '새로운 관점이네요'})}>
              새로운 관점이네요. 이런 방식으로 접근하면 어떨까요?
            </div>
            <div style={{
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '12px',
              marginTop: '16px',
              fontStyle: 'italic'
            }}>
              배포 후 실시간 의견이 여기에 표시됩니다
            </div>
          </div>
        ) : opinions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            padding: '40px 20px',
            fontSize: '14px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💭</div>
            <div>첫 번째 의견을 남겨보세요!</div>
          </div>
        ) : (
          <div>
            {opinions.map((opinion) => {
              const normalizedContent = opinion.content.trim().toLowerCase();
              const groupSize = opinionGroups[normalizedContent]?.length || 1;
              
              return (
                <div
                  key={opinion.id}
                  style={getOpinionStyle(opinion)}
                >
                  {opinion.content}
                  {groupSize >= 2 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {groupSize}
                    </div>
                  )}
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    marginTop: '6px',
                    textAlign: 'right'
                  }}>
                    {new Date(opinion.createdAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 실시간 표시기 */}
      {!isEditor && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px',
          color: '#6c757d'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#28a745',
            animation: 'pulse 2s infinite'
          }} />
          LIVE
        </div>
      )}
    </div>
  );
}

export default SlidoRenderer;