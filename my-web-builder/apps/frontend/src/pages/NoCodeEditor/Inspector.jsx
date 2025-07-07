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
      case 'attend':
        return ComponentEditors.AttendEditor;
      case 'image':
        return ComponentEditors.ImageEditor;
      case 'map':
        return ComponentEditors.MapEditor;
      case 'dday':
        return ComponentEditors.DdayEditor;
      case 'weddingContact':
        return ComponentEditors.WeddingContactEditor;
      case 'gridGallery':
        return ComponentEditors.GridGalleryEditor;
      case 'slideGallery':
        return ComponentEditors.SlideGalleryEditor;
      case 'mapInfo':
        return ComponentEditors.MapInfoEditor;
      case 'calendar':
        return ComponentEditors.CalendarEditor;
      case 'bankAccount':
        return ComponentEditors.BankAccountEditor;
      case 'comment':
        return ComponentEditors.CommentEditor;
      case 'weddingInvite':
        return ComponentEditors.WeddingInviteEditor;
      case 'musicPlayer':
        return ComponentEditors.MusicEditor;
      case 'kakaotalkShare':
        return ComponentEditors.KakaoTalkShareEditor;
      default:
        console.warn(`Unknown component type: ${componentType}`);
        return null;
    }
  };

  // 컴포넌트 타입별 아이콘
  const getComponentIcon = (type) => {
    const icons = {
      button: '🔘',
      text: '📝',
      link: '🔗',
      map: '🗺️',
      attend: '✅',
      image: '🖼️',
      dday: '📅',
      weddingContact: '💒',
      bankAccount: '🏦',
      comment: '💬',
      gridGallery: '🖼️',
      slideGallery: '🎞️',
      mapInfo: '📍',
      calendar: '🗓️',
      weddingInvite: '💌',
      musicPlayer: '🎵',
      kakaotalkShare: '💛'
    };
    return icons[type] || '📦';
  };

  // 컴포넌트 타입별 라벨
  const getComponentLabel = (type) => {
    const labels = {
      button: 'Button',
      text: 'Text',
      link: 'Link',
      map: 'Map',
      attend: 'Attend',
      image: 'Image',
      dday: 'D-day',
      weddingContact: 'Wedding Contact',
      gridGallery: 'Grid Gallery',
      slideGallery: 'Slide Gallery',
      calendar: 'Calendar',
      bankAccount: 'Bank Account',
      comment: 'Comment',
      mapInfo: 'Map Info',
      weddingInvite: 'Wedding Invite',
      musicPlayer: 'Music Player',
      kakaotalkShare: 'KakaoTalk Share'
    };
    return labels[type] || 'Component';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 64, // 헤더 높이만큼 아래로
      right: 0,
      width: 340,
      height: 'calc(100vh - 64px)', // 헤더 높이만큼 제외
      zIndex: 10,
      background: '#ffffff',
      borderLeft: '1px solid #e1e5e9',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.05)',
      overflowY: 'auto',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e1e5e9',
        backgroundColor: '#fafbfc',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 8
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: '#3B4EFF',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: '#fff'
          }}>
            ⚙️
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: '#1d2129',
              letterSpacing: '0.3px'
            }}>
              Properties
            </h3>
            <div style={{
              fontSize: 12,
              color: '#65676b',
              marginTop: 2
            }}>
              {selectedComp ? getComponentLabel(selectedComp.type) : 'No selection'}
            </div>
          </div>
        </div>
      </div>

      {/* 속성 영역 */}
      <div style={{ 
        flex: 1, 
        padding: '24px',
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
                    color: '#dc3545',
                    fontSize: 14,
                    background: '#f8d7da',
                    borderRadius: 6,
                    border: '1px solid #f5c6cb'
                  }}>
                    ⚠️ No editor available for component type: {selectedComp.type}
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


          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#65676b'
          }}>
            <div style={{ 
              fontSize: 48, 
              marginBottom: 16,
              opacity: 0.6
            }}>
              👆
            </div>
            <div style={{ 
              fontSize: 16, 
              marginBottom: 8,
              fontWeight: 500,
              color: '#1d2129'
            }}>
              Select a component
            </div>
            <div style={{ 
              fontSize: 13,
              lineHeight: 1.5
            }}>
              Click on any component in the canvas<br />
              to edit its properties here
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

export default Inspector;
