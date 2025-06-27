import React from 'react';

function Inspector({ selectedComp, onUpdate, color, nickname, roomId }) {
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
              <span style={{ fontSize: 16 }}>
                {selectedComp.type === 'button' ? '🔘' : '📝'}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
                  {selectedComp.type === 'button' ? 'Button' : 'Text'}
                </div>
                <div style={{ fontSize: 11, color: '#65676b' }}>
                  {selectedComp.id}
                </div>
              </div>
            </div>

            {/* 텍스트 입력 - 기존 기능 유지, 스타일만 변경 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block',
                fontSize: 13, 
                color: '#333', 
                fontWeight: 500,
                marginBottom: 6
              }}>
                Text
              </label>
              <input
                value={selectedComp.props.text}
                onChange={e => onUpdate({ ...selectedComp, props: { ...selectedComp.props, text: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 14,
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0066FF'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            {/* 구분선 */}
            <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />

            {/* 폰트 크기 - 기존 기능 유지, 스타일만 변경 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 6
              }}>
                <label style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
                  Font Size
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number"
                    value={selectedComp.props.fontSize}
                    onChange={e => onUpdate({ ...selectedComp, props: { ...selectedComp.props, fontSize: Number(e.target.value) } })}
                    style={{
                      width: 60,
                      padding: '4px 8px',
                      fontSize: 12,
                      textAlign: 'right',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0066FF'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  />
                  <span style={{ fontSize: 11, color: '#666' }}>px</span>
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />

            {/* 색상 섹션 헤더 */}
            <div style={{ 
              fontSize: 12, 
              color: '#65676b', 
              fontWeight: 600, 
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Colors
            </div>

            {/* 텍스트 색상 - 기존 기능 유지, 스타일만 변경 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>Text Color</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      border: '1px solid #ddd',
                      backgroundColor: selectedComp.props.color,
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  />
                  <input
                    type="color"
                    value={selectedComp.props.color}
                    onChange={e => onUpdate({ ...selectedComp, props: { ...selectedComp.props, color: e.target.value } })}
                    style={{
                      width: 32,
                      height: 24,
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 버튼 배경색 - 기존 기능 유지, 스타일만 변경 */}
            {selectedComp.type === 'button' && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>Background</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: '1px solid #ddd',
                        backgroundColor: selectedComp.props.bg,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    />
                    <input
                      type="color"
                      value={selectedComp.props.bg}
                      onChange={e => onUpdate({ ...selectedComp, props: { ...selectedComp.props, bg: e.target.value } })}
                      style={{
                        width: 32,
                        height: 24,
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

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
