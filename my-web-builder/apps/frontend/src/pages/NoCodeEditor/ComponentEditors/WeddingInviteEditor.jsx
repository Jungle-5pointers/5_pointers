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
    title = "Wedding Invitation",
    subtitle = "결혼합니다",
    description = "두 사람이 하나가 되는 소중한 날",
    groomName = "김민수",
    brideName = "박지영",
    date = "2024년 4월 20일",
    time = "오후 2시 30분",
    venue = "웨딩홀 그랜드볼룸",
    message = "저희의 새로운 시작을 축복해 주세요",
    backgroundColor = "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fef3c7 100%)",
    textColor = "#be185d",
    accentColor = "#f59e0b",
    titleFontFamily = '"Playfair Display", serif',
    bodyFontFamily = '"Noto Sans KR", sans-serif',
    titleFontSize = 28,
    subtitleFontSize = 20,
    bodyFontSize = 14
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
      {/* 헤더 정보 */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>
          💒 청첩장 정보
        </h4>
        
        <TextEditor
          value={title}
          onChange={v => updateProperty('title', v)}
          label="메인 타이틀"
          placeholder="Wedding Invitation"
        />
        
        <TextEditor
          value={subtitle}
          onChange={v => updateProperty('subtitle', v)}
          label="서브 타이틀"
          placeholder="결혼합니다"
        />
        
        <TextEditor
          value={description}
          onChange={v => updateProperty('description', v)}
          label="설명"
          placeholder="두 사람이 하나가 되는 소중한 날"
        />
      </div>

      {sectionBar}

      {/* 신랑신부 정보 */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>
          👫 신랑신부
        </h4>
        
        <TextEditor
          value={groomName}
          onChange={v => updateProperty('groomName', v)}
          label="신랑 이름"
          placeholder="김민수"
        />
        
        <TextEditor
          value={brideName}
          onChange={v => updateProperty('brideName', v)}
          label="신부 이름"
          placeholder="박지영"
        />
      </div>

      {sectionBar}

      {/* 결혼식 정보 */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>
          📅 결혼식 정보
        </h4>
        
        <TextEditor
          value={date}
          onChange={v => updateProperty('date', v)}
          label="날짜"
          placeholder="2024년 4월 20일"
        />
        
        <TextEditor
          value={time}
          onChange={v => updateProperty('time', v)}
          label="시간"
          placeholder="오후 2시 30분"
        />
        
        <TextEditor
          value={venue}
          onChange={v => updateProperty('venue', v)}
          label="장소"
          placeholder="웨딩홀 그랜드볼룸"
        />
        
        <TextEditor
          value={message}
          onChange={v => updateProperty('message', v)}
          label="메시지"
          placeholder="저희의 새로운 시작을 축복해 주세요"
        />
      </div>

      {sectionBar}

      {/* 디자인 설정 */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>
          🎨 디자인
        </h4>
        
        <TextEditor
          value={backgroundColor}
          onChange={v => updateProperty('backgroundColor', v)}
          label="배경색/그라데이션"
          placeholder="linear-gradient(...)"
        />
        
        <ColorEditor
          value={textColor}
          onChange={v => updateProperty('textColor', v)}
          label="메인 텍스트 색상"
        />
        
        <ColorEditor
          value={accentColor}
          onChange={v => updateProperty('accentColor', v)}
          label="강조 색상"
        />
      </div>

      {sectionBar}

      {/* 폰트 설정 */}
      <div style={{ marginBottom: 8 }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>
          🔤 폰트
        </h4>
        
        <FontFamilyEditor
          value={titleFontFamily}
          onChange={v => updateProperty('titleFontFamily', v)}
          label="제목 폰트"
        />
        
        <FontFamilyEditor
          value={bodyFontFamily}
          onChange={v => updateProperty('bodyFontFamily', v)}
          label="본문 폰트"
        />
        
        <NumberEditor
          value={titleFontSize}
          onChange={v => updateProperty('titleFontSize', v)}
          label="제목 크기"
          min={20}
          max={40}
          suffix="px"
        />
        
        <NumberEditor
          value={subtitleFontSize}
          onChange={v => updateProperty('subtitleFontSize', v)}
          label="서브타이틀 크기"
          min={16}
          max={30}
          suffix="px"
        />
        
        <NumberEditor
          value={bodyFontSize}
          onChange={v => updateProperty('bodyFontSize', v)}
          label="본문 크기"
          min={12}
          max={20}
          suffix="px"
        />
      </div>
    </div>
  );
}

export default WeddingInviteEditor;