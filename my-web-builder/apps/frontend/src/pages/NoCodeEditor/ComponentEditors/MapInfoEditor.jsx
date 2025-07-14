import React, { useState, useEffect } from 'react';
import {
  TextEditor,
  NumberEditor,
  FontFamilyEditor,
  TextStyleEditor,
  ColorEditor,
  SelectEditor
} from '../PropertyEditors';

function MapInfoEditor({ selectedComp, onUpdate }) {
  const {
    fontSize = 14,
    fontFamily = '"Noto Sans KR", "맑은 고딕", "Malgun Gothic", sans-serif"',
    fontWeight = 'normal',
    fontStyle = 'normal',
    textDecoration = 'none',
    color = '#222',
    bgColor = '#fff',
    sections = [],
    noBorder = true,
    borderColor = '#e5e7eb',
    borderWidth = '1px',
    borderRadius = 8,
  } = selectedComp.props;

  const [localNoBorder, setLocalNoBorder] = useState(noBorder);

  useEffect(() => {
    setLocalNoBorder(selectedComp.props?.noBorder !== undefined ? !!selectedComp.props.noBorder : true);
  }, [selectedComp.props?.noBorder]);

  // 공통 스타일 업데이트
  const updateCommon = (key, value) => {
    onUpdate({
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [key]: value
      }
    });
  };

  // 테두리 제거 체크박스 핸들러
  const handleNoBorderChange = (e) => {
    setLocalNoBorder(e.target.checked);
    updateCommon('noBorder', e.target.checked);
  };

  // 섹션 내용 업데이트
  const updateSection = (index, key, value) => {
    const newSections = sections.map((section, idx) =>
      idx === index ? { ...section, [key]: value } : section
    );
    updateCommon('sections', newSections);
  };

  // 섹션 추가/삭제
  const handleAddSection = () => {
    updateCommon('sections', [
      ...sections,
      { header: '', content: '' }
    ]);
  };
  const handleRemoveSection = (index) => {
    updateCommon('sections', sections.filter((_, idx) => idx !== index));
  };

  return (
    <div>
      {/* 공통 스타일 */}
      <div style={{ fontSize: 12, color: '#65676b', fontWeight: 600, marginBottom: 12 }}>
        공통 스타일
      </div>
      <NumberEditor
        value={fontSize}
        onChange={v => updateCommon('fontSize', v)}
        label="글자 크기"
        min={8}
        max={48}
        suffix="px"
      />
      <FontFamilyEditor
        value={fontFamily}
        onChange={v => updateCommon('fontFamily', v)}
        label="폰트"
      />
      <TextStyleEditor
        label="텍스트 스타일"
        boldValue={fontWeight === 'bold'}
        italicValue={fontStyle === 'italic'}
        underlineValue={textDecoration === 'underline'}
        onBoldChange={v => updateCommon('fontWeight', v ? 'bold' : 'normal')}
        onItalicChange={v => updateCommon('fontStyle', v ? 'italic' : 'normal')}
        onUnderlineChange={v => updateCommon('textDecoration', v ? 'underline' : 'none')}
        currentFont={fontFamily}
      />
      <ColorEditor
        value={color}
        onChange={v => updateCommon('color', v)}
        label="글자색"
      />
      <ColorEditor
        value={bgColor}
        onChange={v => updateCommon('bgColor', v)}
        label="배경색"
      />

      {/* 테두리 옵션 */}
      <div style={{ margin: '16px 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={localNoBorder}
          onChange={handleNoBorderChange}
          id="noBorderCheckbox"
          style={{ accentColor: '#007bff' }}
        />
        <label htmlFor="noBorderCheckbox" style={{ fontSize: 14 }}>테두리 제거</label>
      </div>
      {!localNoBorder && (
        <>
          <ColorEditor
            value={borderColor}
            onChange={v => updateCommon('borderColor', v)}
            label="테두리 색상"
          />
          <SelectEditor
            value={borderWidth}
            onChange={v => updateCommon('borderWidth', v)}
            label="테두리 두께"
            options={[
              { value: '1px', label: '1px' },
              { value: '2px', label: '2px' },
              { value: '3px', label: '3px' },
              { value: '4px', label: '4px' }
            ]}
          />
          <NumberEditor
            value={parseInt(borderRadius) || 8}
            onChange={v => updateCommon('borderRadius', v)}
            label="모서리 둥글기"
            min={0}
            max={50}
            suffix="px"
          />
        </>
      )}

      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />

      {/* 안내 항목 리스트 */}
      <div style={{ fontSize: 12, color: '#65676b', fontWeight: 600, marginBottom: 12 }}>
        안내 항목
      </div>
      {sections.map((section, idx) => (
        <div key={idx} style={{
          border: '1px solid #eee',
          borderRadius: 6,
          marginBottom: 12,
          background: '#fafbfc',
          padding: 12,
          position: 'relative'
        }}>
          <button
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              border: 'none',
              background: 'transparent',
              color: '#888',
              cursor: 'pointer',
              fontSize: 18
            }}
            onClick={() => handleRemoveSection(idx)}
            title="섹션 삭제"
          >
            ×
          </button>
          <TextEditor
            value={section.header}
            onChange={v => updateSection(idx, 'header', v)}
            label="제목"
            placeholder="예: 버스 안내"
          />
          <TextEditor
            value={section.content}
            onChange={v => updateSection(idx, 'content', v)}
            label="내용"
            placeholder="예: 간선버스: 147, 241 / 지선버스: 4211, 4412"
            multiline
          />
        </div>
      ))}
      <button
        onClick={handleAddSection}
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: 6,
          background: '#f5f5f5',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500
        }}
      >
        + 안내 항목 추가
      </button>
    </div>
  );
}

export default MapInfoEditor;