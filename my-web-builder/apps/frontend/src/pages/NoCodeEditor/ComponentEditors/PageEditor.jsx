import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config.js';
import {
  TextEditor,
  TextAreaEditor,
  ThumbnailEditor,
  ColorEditor,
  NumberEditor,
  SelectEditor
} from '../PropertyEditors';

const PageEditor = ({ selectedComp, onUpdate }) => {
  const [localProps, setLocalProps] = useState(selectedComp.props || {});
  const [noBorder, setNoBorder] = useState(
    selectedComp.props?.noBorder !== undefined ? !!selectedComp.props.noBorder : true
  );

  // 컴포넌트 props 초기화
  useEffect(() => {
    if (selectedComp && selectedComp.props) {
      setLocalProps(selectedComp.props);
      setNoBorder(selectedComp.props.noBorder !== undefined ? !!selectedComp.props.noBorder : true);
    }
  }, [selectedComp]);

  const updateProperty = (key, value) => {
    const newProps = { ...localProps, [key]: value };
    setLocalProps(newProps);
    if (key === 'noBorder') setNoBorder(!!value);
    const updatedComponent = {
      ...selectedComp,
      props: newProps
    };
    onUpdate(updatedComponent);
  };

  // 테두리 제거 체크박스 핸들러
  const handleNoBorderChange = (e) => {
    const checked = e.target.checked;
    setNoBorder(checked);
    updateProperty('noBorder', checked);
  };

  const handleThumbnailUpload = async (file) => {
    try {
      // 기존 업로드 시스템 활용 (S3 업로드)
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        updateProperty('thumbnail', result.url);
        updateProperty('thumbnailType', 'upload');
      }
    } catch (error) {
      console.error('썸네일 업로드 실패:', error);
    }
  };

  const regenerateAutoThumbnail = () => {
    updateProperty('thumbnailType', 'auto');
    updateProperty('thumbnail', '');
  };

  // 연결 상태 확인
  const isConnected = !!(localProps.linkedPageId);

  return React.createElement('div', { className: 'page-editor' }, [
    React.createElement('h3', { key: 'title' }, '📄 Page 컴포넌트 설정'),
    
    // 기본 정보 섹션
    React.createElement('div', { 
      key: 'basic-section',
      style: { 
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }
    }, [
      React.createElement('h4', { 
        key: 'basic-title',
        style: { marginBottom: '12px', color: '#495057' }
      }, '기본 정보'),
      
      React.createElement(TextEditor, {
        key: 'pageName',
        value: localProps.pageName || '새 페이지',
        onChange: (value) => updateProperty('pageName', value),
        label: '페이지 이름',
        placeholder: '페이지 이름을 입력하세요'
      }),
      
      React.createElement(TextAreaEditor, {
        key: 'description',
        value: localProps.description || '',
        onChange: (value) => updateProperty('description', value),
        label: '페이지 설명',
        placeholder: '페이지에 대한 간단한 설명을 입력하세요'
      })
    ]),

    // 썸네일 섹션
    React.createElement('div', { 
      key: 'thumbnail-section',
      style: { 
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }
    }, [
      React.createElement('h4', { 
        key: 'thumbnail-title',
        style: { marginBottom: '12px', color: '#495057' }
      }, '썸네일 설정'),
      
      React.createElement(SelectEditor, {
        key: 'thumbnailType',
        value: localProps.thumbnailType || 'auto',
        onChange: (value) => updateProperty('thumbnailType', value),
        label: '썸네일 타입',
        options: [
          { value: 'auto', label: '자동 생성' },
          { value: 'upload', label: '직접 업로드' },
          { value: 'none', label: '썸네일 없음' }
        ]
      }),
      
      localProps.thumbnailType === 'upload' && React.createElement(ThumbnailEditor, {
        key: 'thumbnail',
        currentThumbnail: localProps.thumbnail,
        onThumbnailChange: handleThumbnailUpload,
        label: '썸네일 이미지'
      }),
      
      localProps.thumbnailType === 'auto' && React.createElement('button', {
        key: 'regen-thumbnail',
        onClick: regenerateAutoThumbnail,
        style: {
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }
      }, '🔄 자동 썸네일 재생성')
    ]),

    // 스타일 섹션
    React.createElement('div', { 
      key: 'style-section',
      style: { 
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }
    }, [
      React.createElement('h4', { 
        key: 'style-title',
        style: { marginBottom: '12px', color: '#495057' }
      }, '스타일 설정'),

      // 테두리 제거 체크박스
      React.createElement('div', {
        key: 'no-border-checkbox',
        style: { marginBottom: '12px' }
      }, [
        React.createElement('label', { key: 'label', style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' } }, [
          React.createElement('input', {
            key: 'checkbox',
            type: 'checkbox',
            checked: noBorder,
            onChange: handleNoBorderChange,
            style: { accentColor: '#007bff' }
          }),
          '테두리 제거'
        ])
      ]),

      React.createElement(ColorEditor, {
        key: 'backgroundColor',
        value: localProps.backgroundColor || '#ffffff',
        onChange: (value) => updateProperty('backgroundColor', value),
        label: '배경색'
      }),

      React.createElement(ColorEditor, {
        key: 'textColor',
        value: localProps.textColor || '#333333',
        onChange: (value) => updateProperty('textColor', value),
        label: '텍스트 색상'
      }),

      // 테두리 관련 에디터는 noBorder가 false일 때만 표시
      !noBorder && React.createElement(ColorEditor, {
        key: 'borderColor',
        value: localProps.borderColor || '#007bff',
        onChange: (value) => updateProperty('borderColor', value),
        label: '테두리 색상'
      }),

      !noBorder && React.createElement(SelectEditor, {
        key: 'borderWidth',
        value: localProps.borderWidth || '2px',
        onChange: (value) => updateProperty('borderWidth', value),
        label: '테두리 두께',
        options: [
          { value: '1px', label: '1px' },
          { value: '2px', label: '2px' },
          { value: '3px', label: '3px' },
          { value: '4px', label: '4px' }
        ]
      }),

      !noBorder && React.createElement(NumberEditor, {
        key: 'borderRadius',
        value: parseInt(localProps.borderRadius) || 8,
        onChange: (value) => updateProperty('borderRadius', value),
        label: '모서리 둥글기',
        min: 0,
        max: 50,
        suffix: 'px'
      }),

      React.createElement(NumberEditor, {
        key: 'fontSize',
        value: parseInt(localProps.fontSize) || 14,
        onChange: (value) => updateProperty('fontSize', value),
        label: '폰트 크기',
        min: 8,
        max: 32,
        suffix: 'px'
      }),

      React.createElement(SelectEditor, {
        key: 'fontWeight',
        value: localProps.fontWeight || '500',
        onChange: (value) => updateProperty('fontWeight', value),
        label: '폰트 굵기',
        options: [
          { value: '400', label: 'Normal' },
          { value: '500', label: 'Medium' },
          { value: '600', label: 'Semi Bold' },
          { value: '700', label: 'Bold' }
        ]
      })
    ]),

    // 연결 정보 섹션
    React.createElement('div', { 
      key: 'connection-section',
      style: { 
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        borderRadius: '8px'
      }
    }, [
      React.createElement('h4', { 
        key: 'connection-title',
        style: { marginBottom: '12px', color: '#495057' }
      }, '연결 정보'),
      
      React.createElement('div', { 
        key: 'connection-status',
        style: { marginBottom: '12px' }
      }, [
        React.createElement('div', {
          key: 'status-indicator',
          style: {
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: isConnected ? '#155724' : '#721c24',
            color: 'white',
            marginBottom: '8px'
          }
        }, isConnected ? '✅ 페이지 연결됨' : '⚠️ 페이지가 연결되지 않음'),
        
        isConnected && React.createElement('button', {
          key: 'open-page-btn',
          onClick: () => {
            const url = localProps.deployedUrl || `/editor/${localProps.linkedPageId}`;
            window.open(url, '_blank');
          },
          style: {
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }, '🔗 연결된 페이지 열기')
      ]),
      
      !isConnected && React.createElement('div', {
        key: 'connection-help',
        style: {
          fontSize: '12px',
          color: '#6c757d',
          fontStyle: 'italic'
        }
      }, 'Page 컴포넌트를 드래그 앤 드롭하면 자동으로 새 페이지가 생성됩니다.')
    ])
  ]);
};

export default PageEditor;
