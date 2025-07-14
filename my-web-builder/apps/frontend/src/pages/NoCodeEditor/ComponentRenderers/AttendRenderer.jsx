import React, { useState } from 'react';

function AttendRenderer({ comp, mode = 'editor' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestSide, setGuestSide] = useState(''); // 신부측/신랑측
  const [contact, setContact] = useState(''); // 연락처
  const [companionCount, setCompanionCount] = useState(0); // 동행인 수
  const [mealOption, setMealOption] = useState(''); // 식사여부
  const [privacyConsent, setPrivacyConsent] = useState(false); // 개인정보 동의

  const handleSubmit = async () => {
    if (!attendeeName.trim() || !guestSide || !privacyConsent) return;

    setIsSubmitting(true);
    try {
      // 기존 패턴을 따라 attendance 전용 엔드포인트 호출
      const response = await fetch(`/api/users/pages/${comp.pageId}/attendance/${comp.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeName: attendeeName.trim(),
          attendeeCount: attendeeCount,
          guestSide: guestSide,
          contact: contact.trim(),
          companionCount: companionCount,
          mealOption: mealOption,
          privacyConsent: privacyConsent,
        }),
      });

      if (response.ok) {
        alert('참석 의사가 성공적으로 전달되었습니다!');
        setIsModalOpen(false);
        // 폼 초기화
        setAttendeeName('');
        setAttendeeCount(1);
        setGuestSide('');
        setContact('');
        setCompanionCount(0);
        setMealOption('');
        setPrivacyConsent(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '참석 의사 전달에 실패했습니다.');
      }
    } catch (error) {
      console.error('참석 의사 전달 오류:', error);
      alert('참석 의사 전달에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // 컴포넌트 크기를 인라인 스타일로 적용
  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: comp.props.backgroundColor || '#faf9f7',
    borderRadius: '0px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '32px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '280px',
    fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
    border: '1px solid #e5e7eb'
  };

  return (
    <div style={containerStyle}>
      <div style={{
        color: comp.props.titleColor || '#8b7355',
        fontSize: comp.props.titleFontSize || '24px',
        fontWeight: '600',
        marginBottom: '24px',
        whiteSpace: 'pre-wrap',
        fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
        letterSpacing: '0.025em',
        lineHeight: '1.3'
      }}>
        {comp.props.title || '참석 의사 전달'}
      </div>
      <div style={{
        color: comp.props.descriptionColor || '#4a5568',
        fontSize: comp.props.descriptionFontSize || '16px',
        lineHeight: '1.7',
        marginBottom: '32px',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'pre-wrap',
        fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
        fontWeight: '400',
        letterSpacing: '0.01em'
      }}>
        {comp.props.description || (
          <>
            축하의 마음으로 참석해 주실<br />
            모든 분을 정중히 모시고자 하오니,<br />
            참석 여부를 알려주시면 감사하겠습니다.
          </>
        )}
      </div>
      <button
        style={{
          width: '100%',
          padding: '16px 24px',
          color: comp.props?.buttonTextColor || 'white',
          fontSize: comp.props?.buttonFontSize || '18px',
          fontWeight: '600',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          letterSpacing: '0.025em',
          background: comp.props?.buttonColor || '#6366f1',
          whiteSpace: 'pre-wrap',
          fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
          textTransform: 'none'
        }}
        onClick={e => {
          e.stopPropagation();
          if (mode === 'preview') {
            alert('참석 기능은 배포 모드에서 사용 가능합니다.');
          } else {
            setIsModalOpen(true);
          }
        }}
        onMouseEnter={e => {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={e => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.1)';
        }}
      >
        {comp.props.buttonText || '전달하기'}
      </button>

      {/* 참석 정보 입력 모달 */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1f2937',
              textAlign: 'center',
              fontFamily: comp.props.fontFamily || 'Playfair Display, serif'
            }}>
              참석 정보 입력
            </h2>

            {/* 신부측/신랑측 선택 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151',
                fontFamily: comp.props.fontFamily || 'Playfair Display, serif'
              }}>
                참석자 구분 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="신부측"
                    checked={guestSide === '신부측'}
                    onChange={(e) => setGuestSide(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '16px', fontFamily: comp.props.fontFamily || 'Playfair Display, serif' }}>
                    신부측
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="신랑측"
                    checked={guestSide === '신랑측'}
                    onChange={(e) => setGuestSide(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '16px', fontFamily: comp.props.fontFamily || 'Playfair Display, serif' }}>
                    신랑측
                  </span>
                </label>
              </div>
            </div>

            {/* 참석자 성함 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151',
                fontFamily: comp.props.fontFamily || 'Playfair Display, serif'
              }}>
                참석자 성함 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                placeholder="성함을 입력해주세요"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 참석 인원 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151',
                fontFamily: comp.props.fontFamily || 'Playfair Display, serif'
              }}>
                참석 인원
              </label>
              <input
                type="number"
                value={attendeeCount}
                onChange={(e) => setAttendeeCount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 연락처 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151',
                fontFamily: comp.props.fontFamily || 'Playfair Display, serif'
              }}>
                연락처
              </label>
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="전화번호를 입력해주세요"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 동행인 수 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151',
                fontFamily: comp.props.fontFamily || 'Playfair Display, serif'
              }}>
                동행인 수
              </label>
              <input
                type="number"
                value={companionCount}
                onChange={(e) => setCompanionCount(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                max="5"
                placeholder="동행인 수를 입력해주세요 (0명 = 동행인 없음)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 식사여부 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151',
                fontFamily: comp.props.fontFamily || 'Playfair Display, serif'
              }}>
                식사여부
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="식사함"
                    checked={mealOption === '식사함'}
                    onChange={(e) => setMealOption(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '16px', fontFamily: comp.props.fontFamily || 'Playfair Display, serif' }}>
                    식사함
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="식사안함"
                    checked={mealOption === '식사안함'}
                    onChange={(e) => setMealOption(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '16px', fontFamily: comp.props.fontFamily || 'Playfair Display, serif' }}>
                    식사안함
                  </span>
                </label>
              </div>
            </div>

            {/* 개인정보 수집 및 이용 동의 */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
                color: '#374151',
                gap: '8px'
              }}>
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  style={{ marginTop: '2px' }}
                />
                <div>
                  <span style={{ fontWeight: '500' }}>개인정보 수집 및 이용 동의</span>
                  <span style={{ color: '#ef4444' }}> *</span>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                    참석 관련 업무 처리를 위해 개인정보 수집 및 이용에 동의합니다.
                  </div>
                </div>
              </label>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: comp.props.fontFamily || 'Playfair Display, serif'
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!attendeeName.trim() || !guestSide || !privacyConsent || isSubmitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (!attendeeName.trim() || !guestSide || !privacyConsent || isSubmitting) ? '#d1d5db' : (comp.props?.buttonColor || '#6366f1'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: (!attendeeName.trim() || !guestSide || !privacyConsent || isSubmitting) ? 'not-allowed' : 'pointer',
                  fontFamily: comp.props.fontFamily || 'Playfair Display, serif'
                }}
              >
                {isSubmitting ? '전송 중...' : '참석 의사 전달'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendRenderer;