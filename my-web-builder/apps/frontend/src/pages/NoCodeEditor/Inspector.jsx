import React from 'react';
import * as ComponentEditors from './ComponentEditors';
import * as PropertyEditors from './PropertyEditors';

function Inspector({ selectedComp, onUpdate, viewport }) {
  if (!selectedComp) return null;

  const editorMap = {
    text: ComponentEditors.TextComponentEditor,
    button: ComponentEditors.ButtonEditor,
    image: ComponentEditors.ImageEditor,
    link: ComponentEditors.LinkEditor,
    map: ComponentEditors.MapEditor,
    attend: ComponentEditors.AttendEditor,
    dday: ComponentEditors.DdayEditor,
    weddingContact: ComponentEditors.WeddingContactEditor,
    gridGallery: ComponentEditors.GridGalleryEditor,
    slideGallery: ComponentEditors.SlideGalleryEditor,
    mapInfo: ComponentEditors.MapInfoEditor,
    calendar: ComponentEditors.CalendarEditor,
    bankAccount: ComponentEditors.BankAccountEditor,
    comment: ComponentEditors.CommentEditor,
    slido: ComponentEditors.SlidoEditor,
    weddingInvite: ComponentEditors.WeddingInviteEditor,
    musicPlayer: ComponentEditors.MusicEditor,
    kakaotalkShare: ComponentEditors.KakaoTalkShareEditor,
  };

  const SpecificEditor = editorMap[selectedComp.type];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">               
        {SpecificEditor ? (
          <SpecificEditor selectedComp={selectedComp} onUpdate={onUpdate} />
        ) : (
          <div className="text-sm text-red-500 bg-red-100 p-3 rounded">
            ⚠️ 에디터를 찾을 수 없습니다: {selectedComp.type}
          </div>
        )}
      </div>
    </div>
  );
}

export default Inspector;
