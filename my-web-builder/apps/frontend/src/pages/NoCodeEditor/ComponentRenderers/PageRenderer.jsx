import React from 'react';

const PageRenderer = ({ component, comp, mode = 'editor', onUpdate }) => {
  // component 또는 comp 중 하나를 사용 (하위 호환성)
  const actualComp = comp || component;
  const {
    pageName = '새 페이지',
    description = '',
    thumbnail = '',
    thumbnailType = 'auto',
    backgroundColor = '#ffffff',
    textColor = '#333333',
    borderColor = '#007bff',
    borderWidth = '2px',
    borderRadius = 8,
    fontSize = 14,
    fontWeight = '500',
    linkedPageId = '',
    deployedUrl = '',
    noBorder = true
  } = actualComp?.props || {};

  const handleClick = (e) => {
    if (mode === 'preview') return; // 미리보기에서는 클릭 비활성화
    
    if (mode === 'editor') {
      if (e.ctrlKey || e.metaKey) {
        e.stopPropagation();
        navigateToLinkedPage();
      }
    } else {
      navigateToLinkedPage();
    }
  };

  const navigateToLinkedPage = () => {
    if (mode === 'editor' && linkedPageId) {
      window.location.href = `/editor/${linkedPageId}`;
    } else if (mode !== 'editor' && deployedUrl) {
      window.location.href = deployedUrl;
    }
  };

  const renderThumbnail = () => {
    if (thumbnailType === 'none') return null;
    
    if (thumbnailType === 'upload' && thumbnail) {
      return React.createElement('img', {
        src: thumbnail,
        alt: `${pageName} 썸네일`,
        style: {
          width: '100%',
          height: '60%',
          objectFit: 'cover',
          borderRadius: `${borderRadius}px ${borderRadius}px 0 0`
        }
      });
    }
    
    return React.createElement('div', {
      style: {
        width: '100%',
        height: '60%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: `${borderRadius}px ${borderRadius}px 0 0`
      }
    }, React.createElement('span', { style: { fontSize: '24px' } }, '📄'));
  };

  return React.createElement('div', {
    className: `page-component ${mode === 'editor' ? 'editor-mode' : 'deploy-mode'}`,
    style: {
      width: '100%',
      height: '100%',
      backgroundColor,
      //border: `${borderWidth} solid ${borderColor}`,
      border: noBorder ? 'none' : `${borderWidth} solid ${borderColor}`,
      borderRadius: 0,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    onClick: handleClick,
    title: mode === 'editor' 
      ? `${pageName} (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+클릭으로 페이지 이동)` 
      : `${pageName}으로 이동`
  }, [
    renderThumbnail(),
    React.createElement('div', {
      style: {
        padding: '8px',
        height: '40%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }
    }, [
      React.createElement('div', {
        key: 'title',
        style: {
          fontSize: `${fontSize}px`,
          fontWeight,
          color: textColor,
          textAlign: 'center',
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, pageName),
      description && React.createElement('div', {
        key: 'desc',
        style: {
          fontSize: `${fontSize - 2}px`,
          color: textColor,
          opacity: 0.7,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, description)
    ]),
    mode === 'editor' && React.createElement('div', {
      style: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }
    }, [
      React.createElement('div', {
        key: 'hint',
        style: {
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '8px'
        }
      }, navigator.platform.includes('Mac') ? '⌘+클릭' : 'Ctrl+클릭'),
      React.createElement('div', {
        key: 'status',
        style: {
          backgroundColor: linkedPageId ? '#10b981' : '#f59e0b',
          color: 'white',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px'
        }
      }, linkedPageId ? '🔗' : '⚠️')
    ])
  ]);
};

export default PageRenderer;
