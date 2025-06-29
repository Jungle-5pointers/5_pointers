import React from 'react';
import { TextEditor, DateEditor } from '../PropertyEditors';

function DdayEditor({ selectedComp, onUpdate }) {
  const { defaultProps = {} } = selectedComp;
  const title = selectedComp.props.title ?? defaultProps.title ?? '';
  const targetDate = selectedComp.props.targetDate ?? defaultProps.targetDate ?? '';

  return (
    <div>
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