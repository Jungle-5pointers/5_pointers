import React, { useState, useRef } from 'react';

function ImageSourceEditor({ label, value, onChange }) {
  const [activeTab, setActiveTab] = useState('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsUploading(true);

    try {
      // Base64로 변환 (임시 방식 - 실제로는 서버 업로드)
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target.result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패했습니다.');
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleUrlKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '6px', 
        fontSize: '12px', 
        fontWeight: '500',
        color: '#374151'
      }}>
        {label}
      </label>
      
      {/* 탭 버튼들 */}
      <div style={{
        display: 'flex',
        marginBottom: '8px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        padding: '2px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          style={{
            flex: 1,
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'upload' ? '#3b82f6' : 'transparent',
            color: activeTab === 'upload' ? 'white' : '#6b7280',
            transition: 'all 0.2s ease'
          }}
        >
          📁 파일 업로드
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          style={{
            flex: 1,
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'url' ? '#3b82f6' : 'transparent',
            color: activeTab === 'url' ? 'white' : '#6b7280',
            transition: 'all 0.2s ease'
          }}
        >
          🔗 URL
        </button>
      </div>

      {/* 파일 업로드 탭 */}
      {activeTab === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px dashed #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              color: '#6b7280',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = '#f8fafc';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading) {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.backgroundColor = 'white';
              }
            }}
          >
            {isUploading ? '업로드 중...' : '📁 이미지 파일 선택'}
          </button>
        </div>
      )}

      {/* URL 입력 탭 */}
      {activeTab === 'url' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleUrlKeyPress}
            placeholder="이미지 주소를 입력해주세요"
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            적용
          </button>
        </div>
      )}

      {/* 미리보기 */}
      {value && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: '#f9fafb'
        }}>
          <img
            src={value}
            alt="미리보기"
            style={{
              width: '100%',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{
            display: 'none',
            textAlign: 'center',
            padding: '20px',
            color: '#ef4444',
            fontSize: '12px'
          }}>
            이미지를 불러올 수 없습니다
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageSourceEditor;
