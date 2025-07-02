import React from 'react';
import { TextEditor, DateEditor } from '../PropertyEditors';

function DdayEditor({ selectedComp, onUpdate }) {
  const { defaultProps = {} } = selectedComp;
  const title = selectedComp.props.title ?? defaultProps.title ?? '';
  const targetDate = selectedComp.props.targetDate ?? defaultProps.targetDate ?? '';

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
        <span style={{ fontSize: 16 }}>📅</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
            D-day
          </div>
          <div style={{ fontSize: 11, color: '#65676b' }}>
            {selectedComp.id}
          </div>
        </div>
      </div>

      <TextEditor
        value={title}
        onChange={value => onUpdate({
          ...selectedComp,
          props: { ...selectedComp.props, title: value }
        })}
        label="제목"
        placeholder="디데이 제목을 입력하세요"
      />
      <DateEditor
        value={targetDate}
        onChange={value => onUpdate({
          ...selectedComp,
          props: { ...selectedComp.props, targetDate: value }
        })}
        label="목표 날짜"
      />
    </div>
  );
}

export default DdayEditor; 