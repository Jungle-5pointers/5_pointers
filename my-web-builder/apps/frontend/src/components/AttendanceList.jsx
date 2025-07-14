import React, { useState, useEffect } from 'react';

const AttendanceList = ({ pageId, componentId }) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAttendees: 0,
    guestSideCounts: { '신부측': 0, '신랑측': 0 },
    mealCounts: { '식사함': 0, '식사안함': 0 },
  });

  useEffect(() => {
    if (pageId && componentId) {
      fetchAttendances();
    }
  }, [pageId, componentId]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/pages/${pageId}/attendance/${componentId}`);
      
      if (!response.ok) {
        throw new Error('참석자 정보를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setAttendances(data);
      calculateStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalAttendees = data.reduce((sum, attendance) => sum + attendance.attendeeCount, 0);
    const guestSideCounts = { '신부측': 0, '신랑측': 0 };
    const mealCounts = { '식사함': 0, '식사안함': 0 };

    data.forEach(attendance => {
      if (attendance.guestSide) {
        guestSideCounts[attendance.guestSide] += attendance.attendeeCount;
      }
      if (attendance.mealOption) {
        mealCounts[attendance.mealOption] += attendance.attendeeCount;
      }
    });

    setStats({
      totalAttendees,
      guestSideCounts,
      mealCounts,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>참석자 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
        <div>오류: {error}</div>
        <button 
          onClick={fetchAttendances}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>
        참석자 관리
      </h2>

      {/* 통계 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
            총 참석자 수
          </h3>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
            {stats.totalAttendees}명
          </div>
        </div>

        <div style={{
          backgroundColor: '#fef3f2',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
            신부측 / 신랑측
          </h3>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
            {stats.guestSideCounts['신부측']}명 / {stats.guestSideCounts['신랑측']}명
          </div>
        </div>

        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
            식사 여부
          </h3>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
            식사함 {stats.mealCounts['식사함']}명 / 식사안함 {stats.mealCounts['식사안함']}명
          </div>
        </div>
      </div>

      {/* 참석자 목록 */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            참석자 목록 ({attendances.length}명)
          </h3>
        </div>

        {attendances.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            아직 참석 신청이 없습니다.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#374151' }}>성함</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#374151' }}>구분</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#374151' }}>인원</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#374151' }}>연락처</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#374151' }}>동행인 수</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#374151' }}>식사</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '500', color: '#374151' }}>신청일</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((attendance, index) => (
                  <tr key={attendance.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: '#1f2937' }}>
                      {attendance.attendeeName}
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: attendance.guestSide === '신부측' ? '#fef3f2' : '#f0f9ff',
                        color: attendance.guestSide === '신부측' ? '#dc2626' : '#2563eb'
                      }}>
                        {attendance.guestSide}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {attendance.attendeeCount}명
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {attendance.contact || '-'}
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {attendance.companionCount ? `${attendance.companionCount}명` : '-'}
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {attendance.mealOption || '-'}
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280', fontSize: '14px' }}>
                      {formatDate(attendance.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 새로고침 버튼 */}
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button
          onClick={fetchAttendances}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          새로고침
        </button>
      </div>
    </div>
  );
};

export default AttendanceList;