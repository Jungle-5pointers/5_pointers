import React from 'react';
import * as PropertyEditors from '../PropertyEditors';

function CalendarEditor({ selectedComp, onUpdate }) {
  const handlePropChange = (propName, value) => {
    onUpdate({
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [propName]: value
      }
    });
  };

  return (
    <div>
      {/* 컴포넌트 정보 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        padding: '8px 12px',
        backgroundColor: '#f0f2f5',
        borderRadius: 6
      }}>
        <span style={{ fontSize: 16 }}>🗓️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
            Calendar
          </div>
          <div style={{ fontSize: 11, color: '#65676b' }}>
            {selectedComp.id}
          </div>
        </div>
      </div>

      <PropertyEditors.DateEditor
        label="결혼식 날짜"
        value={selectedComp.props.weddingDate || ''}
        onChange={(value) => handlePropChange('weddingDate', value)}
      />
      
      <PropertyEditors.ColorEditor
        label="Highlight Color"
        value={selectedComp.props.highlightColor || '#ff6b9d'}
        onChange={(value) => handlePropChange('highlightColor', value)}
      />
    </div>
  );
}

export default CalendarEditor;