import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

function BankAccountRenderer({
  comp,
  isEditor = false,
  onUpdate,
  mode = 'live',
  setModalOpen,
}) {
  // Toast Context를 안전하게 사용
  let showSuccess = null;
  try {
    const { useToastContext } = require('../../../contexts/ToastContext');
    const toastContext = useToastContext();
    showSuccess = toastContext?.showSuccess;
  } catch (error) {
    // ToastProvider가 없는 경우 기본 alert 사용
    showSuccess = (message) => alert(message);
  }

  const { 
    title, 
    groomSide, 
    brideSide, 
    backgroundColor,
    groomSideTitle = '신랑 측',
    brideSideTitle = '신부 측',
    groomSideColor = '#87CEEB',
    brideSideColor = '#F4C2C2'
  } = comp.props;
  
  const [groomModalOpen, setGroomModalOpen] = useState(false);
  const [brideModalOpen, setBrideModalOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (ref.current && onUpdate) {
      const newHeight = ref.current.offsetHeight;
      if (comp.height !== newHeight) {
        onUpdate({ ...comp, height: newHeight });
      }
    }
  }, [comp.props, onUpdate]);

  // 모달 상태 변화를 상위 컴포넌트에 알리기
  useEffect(() => {
    if (setModalOpen) {
      setModalOpen(groomModalOpen || brideModalOpen);
    }
  }, [groomModalOpen, brideModalOpen, setModalOpen]);

  const copyToClipboard = (account, name) => {
    navigator.clipboard.writeText(account);
    showSuccess(`${name}의 계좌번호가 복사되었습니다.`);
  };

  const renderAccountInfo = (person, defaultRole, sideColor) => {
    // 신랑/신부는 항상 표시, 나머지는 enabled가 true일 때만 표시
    const isMainPerson = defaultRole === '신랑' || defaultRole === '신부';
    if (!isMainPerson && !person.enabled) return null;

    const displayRole = person.role || defaultRole;

    return (
      <div
        style={{
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          padding: 'clamp(12px, 3vw, 16px)',
          marginBottom: 'clamp(8px, 2vw, 12px)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ marginBottom: 'clamp(8px, 2vw, 12px)' }}>
          <span
            style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: '600',
              color: '#4A4A4A',
              whiteSpace: 'pre-wrap',
              fontFamily: 'Playfair Display, serif',
            }}
          >
            {displayRole} {person.name}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'clamp(6px, 2vw, 8px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 'clamp(50px, 15vw, 60px)',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                color: '#BDB5A6',
                marginBottom: '4px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: '500',
              }}
            >
              은행
            </span>
            <span
              style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                fontWeight: '600',
                color: '#4A4A4A',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {person.bank}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1',
              minWidth: 'clamp(100px, 30vw, 120px)',
              margin: '0 clamp(4px, 2vw, 8px)',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                color: '#BDB5A6',
                marginBottom: '4px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: '500',
              }}
            >
              계좌번호
            </span>
            <span
              style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                fontWeight: '600',
                color: '#4A4A4A',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {person.account}
            </span>
          </div>
          <button
            style={{
              padding: 'clamp(6px, 2vw, 8px) clamp(12px, 4vw, 16px)',
              background: sideColor,
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: '600',
              fontFamily: 'Montserrat, sans-serif',
              border: 'none',
              boxShadow: `0 2px 8px ${sideColor}50`,
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(person.account, person.name);
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = `0 4px 12px ${sideColor}70`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 2px 8px ${sideColor}50`;
            }}
          >
            복사
          </button>
        </div>
      </div>
    );
  };

  const renderModal = (sideData, modalTitle, isOpen, setIsOpen, sideColor, isGroomSide = true) => {
    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onClick={() => setIsOpen(false)}
        ></div>
        <div
          style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: 'min(28rem, calc(100vw - 2rem))',
            width: '100%',
            margin: '0 1rem',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'clamp(1rem, 4vw, 1.5rem)',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <h3
              style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                fontWeight: '600',
                color: '#4A4A4A',
                fontFamily: 'Playfair Display, serif',
              }}
            >
              {modalTitle}
            </h3>
            <button
              style={{
                color: '#9ca3af',
                transition: 'color 0.2s',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                userSelect: 'none',
                padding: 0,
              }}
              onClick={() => setIsOpen(false)}
            >
              <svg
                style={{
                  width: 'clamp(20px, 5vw, 24px)',
                  height: 'clamp(20px, 5vw, 24px)',
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div style={{ padding: 'clamp(1rem, 4vw, 1.5rem)' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(8px, 2vw, 12px)',
              }}
            >
              {isGroomSide ? (
                <>
                  {sideData?.groom &&
                    renderAccountInfo(sideData.groom, '신랑', sideColor)}
                  {sideData?.groomFather?.enabled &&
                    renderAccountInfo(sideData.groomFather, '아버지', sideColor)}
                  {sideData?.groomMother?.enabled &&
                    renderAccountInfo(sideData.groomMother, '어머니', sideColor)}
                </>
              ) : (
                <>
                  {sideData?.bride &&
                    renderAccountInfo(sideData.bride, '신부', sideColor)}
                  {sideData?.brideFather?.enabled &&
                    renderAccountInfo(sideData.brideFather, '아버지', sideColor)}
                  {sideData?.brideMother?.enabled &&
                    renderAccountInfo(sideData.brideMother, '어머니', sideColor)}
                </>
              )}
            </div>
          </div>
        </div>
      </div>,
      modalRoot
    );
  };

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '200px',
        padding: '18px 12px',
        borderRadius: 0,
        border: '1px solid #e5e7eb',
        backgroundColor,
        minWidth: '250px',
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {title && (
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '8px',
            color: '#4A4A4A',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Playfair Display, serif',
          }}
        >
          {title}
        </h3>
      )}

      <div style={{ marginBottom: '8px' }}>
        <button
          style={{
            width: '100%',
            padding: '16px 24px',
            background: groomSideColor,
            color: '#FFFFFF',
            borderRadius: '8px',
            fontWeight: '600',
            border: `1px solid ${groomSideColor}50`,
            boxShadow: `0 4px 16px ${groomSideColor}50`,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setGroomModalOpen(true);
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = `0 8px 24px ${groomSideColor}70`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = `0 4px 16px ${groomSideColor}50`;
          }}
        >
          <svg
            style={{ width: '20px', height: '20px', flexShrink: 0 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <span
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '600',
              userSelect: 'none',
            }}
          >
            {groomSideTitle} 계좌번호
          </span>
        </button>
      </div>

      <div style={{ marginBottom: '0px' }}>
        <button
          style={{
            width: '100%',
            padding: '16px 24px',
            background: brideSideColor,
            color: '#FFFFFF',
            borderRadius: '8px',
            fontWeight: '600',
            border: `1px solid ${brideSideColor}50`,
            boxShadow: `0 4px 16px ${brideSideColor}50`,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setBrideModalOpen(true);
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = `0 8px 24px ${brideSideColor}70`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = `0 4px 16px ${brideSideColor}50`;
          }}
        >
          <svg
            style={{ width: '20px', height: '20px', flexShrink: 0 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <span
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '600',
              userSelect: 'none',
            }}
          >
            {brideSideTitle} 계좌번호
          </span>
        </button>
      </div>

      {/* 모달들 */}
      {renderModal(
        groomSide,
        `${groomSideTitle} 계좌번호`,
        groomModalOpen,
        setGroomModalOpen,
        groomSideColor,
        true
      )}
      {renderModal(
        brideSide,
        `${brideSideTitle} 계좌번호`,
        brideModalOpen,
        setBrideModalOpen,
        brideSideColor,
        false
      )}
    </div>
  );
}

export default BankAccountRenderer;