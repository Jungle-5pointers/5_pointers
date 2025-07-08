import React from 'react';

export default function MapInfoRenderer({ comp }) {
  const {
    containerWidth = comp.width || 300,
    containerHeight = comp.height || 275,
    sections = [],
    fontSize = 14,
    fontFamily = '"Noto Sans KR", "맑a은 고딕", "Malgun Gothic", sans-serif"',
    fontWeight = 'normal',
    fontStyle = 'normal',
    textDecoration = 'none',
    color = '#222',
    bgColor = '#fff'
  } = comp.props;

  const toPx = v => (typeof v === 'number' ? `${v}px` : v || undefined);

  return (
    <div
      style={{
        padding: 8,
        background: bgColor,
        borderRadius: 8,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'auto'
      }}
    >
      {sections.map((sec, idx) => (
        <div
          key={idx}
          style={{
            padding: '10px 0',
            borderBottom: idx < sections.length - 1 ? '1px solid #eee' : 'none'
          }}
        >
          {/* 제목 */}
          <div style={{
            fontSize: toPx(fontSize),
            fontWeight,
            fontStyle,
            textDecoration,
            color,
            fontFamily,
            marginBottom: 2,
            whiteSpace: 'pre-wrap' // ✅
          }}>
            {sec.header || '제목 없음'}
          </div>

          {/* 내용 */}
          <div style={{
            fontSize: toPx(fontSize),
            fontWeight,
            fontStyle,
            textDecoration,
            color,
            fontFamily,
            whiteSpace: 'pre-wrap' // ✅
          }}>
            {sec.content || '내용 없음'}
          </div>
        </div>
      ))}
    </div>
  );
}