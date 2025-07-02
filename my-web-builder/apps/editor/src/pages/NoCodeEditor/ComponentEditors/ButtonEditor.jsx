import React from 'react';
import { 
  TextEditor, 
  NumberEditor, 
  ColorEditor, 
  FontFamilyEditor, 
  TextAlignEditor,
  LineHeightEditor,
  LetterSpacingEditor,
  TextStyleEditor
} from '../PropertyEditors';

function ButtonEditor({ selectedComp, onUpdate }) {
  // 속성 업데이트 함수
  const updateProperty = (propKey, value) => {
    const updatedComp = {
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [propKey]: value
      }
    };
    onUpdate(updatedComp);
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
        <span style={{ fontSize: 16 }}>🔘</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
            Button
          </div>
          <div style={{ fontSize: 11, color: '#65676b' }}>
            {selectedComp.id}
          </div>
        </div>
      </div>

      {/* 텍스트 섹션 */}
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Text
      </div>

      <TextEditor
        value={selectedComp.props.text}
        onChange={(value) => updateProperty('text', value)}
        label="버튼명"
        placeholder="버튼 텍스트를 입력하세요"
      />

      <NumberEditor
        value={selectedComp.props.fontSize}
        onChange={(value) => updateProperty('fontSize', value)}
        label="글자 크기"
        min={8}
        max={72}
        suffix="px"
      />

      <FontFamilyEditor
        value={selectedComp.props.fontFamily}
        onChange={(value) => updateProperty('fontFamily', value)}
        label="폰트"
      />

      <TextStyleEditor
        label="텍스트 스타일"
        boldValue={selectedComp.props.fontWeight}
        italicValue={selectedComp.props.fontStyle}
        underlineValue={selectedComp.props.textDecoration}
        onBoldChange={(value) => updateProperty('fontWeight', value)}
        onItalicChange={(value) => updateProperty('fontStyle', value)}
        onUnderlineChange={(value) => updateProperty('textDecoration', value)}
        currentFont={selectedComp.props.fontFamily}
      />

      <LineHeightEditor
        value={selectedComp.props.lineHeight}
        onChange={(value) => updateProperty('lineHeight', value)}
        label="줄간격"
      />

      <LetterSpacingEditor
        value={selectedComp.props.letterSpacing}
        onChange={(value) => updateProperty('letterSpacing', value)}
        label="글자간격"
      />

      <TextAlignEditor
        value={selectedComp.props.textAlign}
        onChange={(value) => updateProperty('textAlign', value)}
        label="텍스트 정렬"
      />

      {/* 색상 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
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

      <ColorEditor
        value={selectedComp.props.color}
        onChange={(value) => updateProperty('color', value)}
        label="글자 색상"
      />

      <ColorEditor
        value={selectedComp.props.bg}
        onChange={(value) => updateProperty('bg', value)}
        label="배경색"
      />
    </div>
  );
}

export default ButtonEditor;
