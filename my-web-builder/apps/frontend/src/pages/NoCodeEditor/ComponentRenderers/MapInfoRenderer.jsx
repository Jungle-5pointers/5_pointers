import React from 'react';

export default function MapInfoRenderer({ comp, mode = 'editor' }) {
  const {
    containerWidth = comp.width || 300,
    containerHeight = comp.height || 275,
    sections = [],
    fontSize = 16,
    fontFamily = comp.props?.fontFamily || '"Playfair Display", serif',
    fontWeight = comp.props?.fontWeight ? 'bold' : 'normal',
    fontStyle = comp.props?.fontStyle ? 'italic' : 'normal',
    textDecoration = comp.props?.textDecoration ? 'underline' : 'none',
    textAlign = comp.props?.textAlign || 'left',
    lineHeight = comp.props?.lineHeight || 1.6,
    letterSpacing = comp.props?.letterSpacing || 0,
    color = comp.props?.color || '#2c2c2c',
    bgColor = comp.props?.bgColor || '#ffffff',
    noBorder = true,
    borderColor = comp.props?.borderColor || '#e5e7eb',
    borderWidth = comp.props?.borderWidth || '1px',
    borderRadius = comp.props?.borderRadius || 8
  } = comp.props;

  const toPx = v => (typeof v === 'number' ? `${v}px` : v || undefined);
  const italicTransform = fontStyle === 'italic' ? 'skewX(-15deg)' : 'none';

  return (
    <div
      style={{
        padding: '28px 24px',
        background: bgColor,
        borderRadius: 0,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        //boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: noBorder ? 'none' : `${borderWidth} solid ${borderColor}`
      }}
    >
      {sections.map((sec, idx) => (
        <div
          key={idx}
          style={{
            padding: '18px 0',
            borderBottom: idx < sections.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
            position: 'relative'
          }}
        >
          {/* 제목 */}
          <div style={{
            fontSize: toPx(fontSize + 2),
            fontWeight: fontWeight === 'bold' ? '700' : '600',
            fontStyle: fontStyle,
            textDecoration,
            color: color,
            fontFamily: fontFamily,
            textAlign: textAlign,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing + 'px',
            transform: italicTransform,
            marginBottom: '8px',
            whiteSpace: 'pre-wrap',
            background: 'linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {sec.header || '제목 없음'}
          </div>

          {/* 내용 */}
          <div style={{
            fontSize: toPx(fontSize),
            fontWeight: fontWeight === 'bold' ? '500' : '400',
            fontStyle: fontStyle,
            textDecoration,
            color: color,
            fontFamily: fontFamily,
            textAlign: textAlign,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing + 'px',
            transform: italicTransform,
            whiteSpace: 'pre-wrap',
            opacity: 0.85,
            paddingLeft: '4px'
          }}>
            {sec.content || '내용 없음'}
          </div>
        </div>
      ))}
    </div>
  );
}