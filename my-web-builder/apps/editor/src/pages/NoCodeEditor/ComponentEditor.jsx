import React from 'react';
import TextEditor from './PropertyEditors/TextEditor';
import ButtonEditor from './PropertyEditors/ButtonEditor';
import LinkEditor from './PropertyEditors/LinkEditor';
import AttendEditor from './PropertyEditors/AttendEditor';
import MapEditor from './ComponentEditors/MapEditor';
import DdayEditor from './ComponentEditors/DdayEditor.jsx';
import WeddingContactEditor from './ComponentEditors/WeddingContactEditor.jsx';
import ImageEditor from './ComponentEditors/ImageEditor.jsx';
import BankAccountEditor from './ComponentEditors/BankAccountEditor.jsx';
import WeddingInviteEditor from './ComponentEditors/WeddingInviteEditor';
import MusicEditor from './ComponentEditors/MusicEditor';



export default function ComponentEditor({ selectedComp, onUpdate }) {
    if (!selectedComp) {
        return <div style={{ padding: '20px', color: '#888' }}>컴포넌트를 선택하여 속성을 변경하세요.</div>;
    }

    switch (selectedComp.type) {
        case 'text':
            return <TextEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        case 'button':
            return <ButtonEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        case 'link':
            return <LinkEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        case 'attend':
            return <AttendEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        case 'map':
            return <MapEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        case 'dday':
            return <DdayEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        case 'weddingContact':
            return <WeddingContactEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        case 'image':
            return <ImageEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        case 'bankAccount':
            return <BankAccountEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        case 'weddingInvite':
            return <WeddingInviteEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        case 'musicPlayer':
            return <MusicEditor selectedComp={selectedComp} onUpdate={onUpdate} />;
        default:
            return <p>Select a component to edit its properties.</p>;
    }
} 