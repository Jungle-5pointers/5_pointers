import React from 'react';
import {
  TextEditor,
  NumberEditor,
  FontFamilyEditor,
  TextStyleEditor,
  ColorEditor,
  TextAlignEditor
} from '../PropertyEditors';

function WeddingInviteEditor({ selectedComp, onUpdate }) {
  const {
    title = "Our Love Story",
    titleFontFamily = "\"Dancing Script\", \"cursive\", \"Noto Sans KR\", \"맑은 고딕\", sans-serif",
    titleFontSize = 32,
    titleFontStyle = "italic",
    titleFontWeight = "normal",
    titleTextDecoration = "none",
    titleColor = "#aaa",
    titleAlign = "center",
    content = [
      "서로가 마주보며 다져온 사랑을",
      "이제 함께 한 곳을 바라보며",
      "걸어갈 수 있는 큰 사랑으로 키우고자 합니다.",
      "",
      "저희 두 사람이 사랑의 이름으로",
      "지켜나갈 수 있게 앞날을",
      "축복해 주시면 감사하겠습니다."
    ],
    contentFontFamily = "\"Noto Sans KR\", \"맑은 고딕\", sans-serif",
    contentFontSize = 26,
    contentFontWeight = "normal",
    contentFontStyle = "normal",
    contentTextDecoration = "none",
    contentColor = "#444",
    contentAlign = "center",
    backgroundColor = "#fff"
  } = selectedComp.props;

  // 속성 업데이트 함수
  const updateProperty = (key, value) => {
    onUpdate({
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [key]: value
      }
    });
  };

  // 본문 textarea 입력값을 배열로 변환
  const handleContentChange = (value) => {
    updateProperty('content', value.split('\n'));
  };

  // 구분선 스타일
  const sectionBar = (
    <div style={{
      height: 1,
      background: '#e0e0e0',
      margin: '24px 0 18px 0',
      opacity: 0.7
    }} />
  );

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
        <span style={{ fontSize: 16 }}>💌</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
            Wedding Invite
          </div>
          <div style={{ fontSize: 11, color: '#65676b' }}>
            {selectedComp.id}
          </div>
        </div>
      </div>

      {/* 제목 영역 */}
      <div style={{ marginBottom: 8 }}>
        <TextEditor
          value={title}
          onChange={v => updateProperty('title', v)}
          label="제목"
          placeholder="Our Love Story"
        />
        <NumberEditor
          value={titleFontSize}
          onChange={v => updateProperty('titleFontSize', v)}
          label="제목 글자 크기"
          min={16}
          max={60}
          suffix="px"
        />
        <FontFamilyEditor
          value={titleFontFamily}
          onChange={v => updateProperty('titleFontFamily', v)}
          label="제목 폰트"
        />
        {/* 텍스트 정렬 */}
        <TextAlignEditor
          value={titleAlign}
          onChange={v => updateProperty('titleAlign', v)}
          label="제목 정렬"
        />
        {/* 스타일: 굵기, 기울임, 밑줄 */}
        <TextStyleEditor
          label="제목 스타일"
          boldValue={titleFontWeight === 'bold'}
          onBoldChange={v => updateProperty('titleFontWeight', v ? 'bold' : 'normal')}
          italicValue={titleFontStyle === 'italic'}
          onItalicChange={v => updateProperty('titleFontStyle', v ? 'italic' : 'normal')}
          underlineValue={titleTextDecoration === 'underline'}
          onUnderlineChange={v => updateProperty('titleTextDecoration', v ? 'underline' : 'none')}
          currentFont={titleFontFamily}
        />
        <ColorEditor
          value={titleColor}
          onChange={v => updateProperty('titleColor', v)}
          label="제목 색상"
        />
      </div>

      {sectionBar}

      {/* 본문 영역 */}
      <div style={{ marginBottom: 8 }}>
        <label style={{
          display: 'block',
          fontSize: 13,
          color: '#333',
          fontWeight: 500,
          marginBottom: 6
        }}>
          본문
        </label>
        <textarea
          value={Array.isArray(content) ? content.join('\n') : content}
          onChange={e => handleContentChange(e.target.value)}
          placeholder="여러 줄을 입력하세요"
          rows={7}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 14,
            border: '1px solid #ddd',
            borderRadius: 6,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
            resize: 'vertical'
          }}
          onFocus={(e) => e.target.style.borderColor = '#0066FF'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        <NumberEditor
          value={contentFontSize}
          onChange={v => updateProperty('contentFontSize', v)}
          label="본문 글자 크기"
          min={12}
          max={40}
          suffix="px"
        />
        <FontFamilyEditor
          value={contentFontFamily}
          onChange={v => updateProperty('contentFontFamily', v)}
          label="본문 폰트"
        />
        {/* 본문 정렬 */}
        <TextAlignEditor
          value={contentAlign}
          onChange={v => updateProperty('contentAlign', v)}
          label="본문 정렬"
        />
        {/* 본문 스타일 */}
        <TextStyleEditor
          label="본문 스타일"
          boldValue={contentFontWeight === 'bold'}
          onBoldChange={v => updateProperty('contentFontWeight', v ? 'bold' : 'normal')}
          italicValue={contentFontStyle === 'italic'}
          onItalicChange={v => updateProperty('contentFontStyle', v ? 'italic' : 'normal')}
          underlineValue={contentTextDecoration === 'underline'}
          onUnderlineChange={v => updateProperty('contentTextDecoration', v ? 'underline' : 'none')}
          currentFont={contentFontFamily}
        />
        <ColorEditor
          value={contentColor}
          onChange={v => updateProperty('contentColor', v)}
          label="본문 색상"
        />
      </div>

      {sectionBar}

      {/* 배경색 영역 */}
      <div style={{ marginBottom: 8 }}>
        <ColorEditor
          value={backgroundColor}
          onChange={v => updateProperty('backgroundColor', v)}
          label="배경색"
        />
      </div>
    </div>
  );
}

export default WeddingInviteEditor;