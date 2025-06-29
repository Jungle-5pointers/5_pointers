import React from 'react';
import * as ComponentEditors from './ComponentEditors';

function Inspector({ selectedComp, onUpdate, color, nickname, roomId }) {
  // 컴포넌트 타입별 에디터 매핑
  const getComponentEditor = (componentType) => {
    switch (componentType) {
      case 'button':
        return ComponentEditors.ButtonEditor;
      case 'text':
        return ComponentEditors.TextComponentEditor;
      case 'link':
        return ComponentEditors.LinkEditor;
      case 'map':
        return ComponentEditors.MapEditor;
      case 'attend':
        return ComponentEditors.AttendEditor;
      case 'image':
        return ComponentEditors.ImageEditor;
      case 'dday':
        return ComponentEditors.DdayEditor;
      case 'weddingContact':
        return ComponentEditors.WeddingContactEditor;
      default:
        console.warn(`Unknown component type: ${componentType}`);
        return null;
    }
  };

  return (
    <div style={{
      width: 280,
      background: '#fff',
      borderLeft: '1px solid #e1e5e9',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e1e5e9',
        backgroundColor: '#fafbfc'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: '#1d2129',
          letterSpacing: '0.5px'
        }}>
          Properties
        </h3>
      </div>

      {/* 속성 영역 */}
      <div style={{ 
        flex: 1, 
        padding: '20px',
        overflowY: 'auto'
      }}>
        {selectedComp ? (
          <div>
            {/* 컴포넌트별 독립 에디터 렌더링 */}
            {(() => {
              const ComponentEditor = getComponentEditor(selectedComp.type);
              
              if (!ComponentEditor) {
                return (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'red',
                    fontSize: 14
                  }}>
                    No editor available for component type: {selectedComp.type}
                  </div>
                );
              }

              return (
                <ComponentEditor
                  selectedComp={selectedComp}
                  onUpdate={onUpdate}
                />
              );
            })()}

            {/* 구분선 */}
            <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />

            {/* 도움말 */}
            <div style={{
              padding: '12px',
              backgroundColor: '#f0f2f5',
              borderRadius: 6,
              fontSize: 12,
              color: '#65676b'
            }}>
              💡 Press <strong>Delete</strong> key to remove component
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#65676b'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👆</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>Select a component</div>
            <div style={{ fontSize: 12 }}>
              Click on any component to edit its properties
            </div>
          </div>
        )}
      </div>

      {/* 하단 사용자 정보 */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #e1e5e9',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{ fontSize: 12, color: '#65676b', marginBottom: 4 }}>
          <span style={{ color: color, fontWeight: 600 }}>{nickname}</span>
        </div>
        <div style={{ fontSize: 11, color: '#8a8d91' }}>
          Room: <strong>{roomId}</strong>
        </div>
      </div>
    </div>
  );
}

export default Inspector;
