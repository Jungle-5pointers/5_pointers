import React from 'react';

export default function WeddingInviteRenderer({ comp, mode = 'editor' }) {
    const {
        containerWidth = comp.width || 450,
        containerHeight = comp.height || 400,
        title = "Our Love Story",
        titleFontFamily = "Playfair Display, serif",
        titleFontSize = 30,
        titleFontStyle = "italic",
        titleFontWeight = "600",
        titleTextDecoration = "none",
        titleColor = "#4A4A4A",
        titleAlign = comp.props.titleAlign || comp.props.textAlign || "center",

        content = [
            "서로가 마주보며 다져온 사랑을",
            "이제 함께 한 곳을 바라보며",
            "걸어갈 수 있는 큰 사랑으로 키우고자 합니다.",
            "",
            "저희 두 사람이 사랑의 이름으로",
            "지켜나갈 수 있게 앞날을",
            "축복해 주시면 감사하겠습니다."
        ],
        contentFontFamily = "Playfair Display, serif",
        contentFontSize = 18,
        contentFontWeight = "400",
        contentFontStyle = "normal",
        contentTextDecoration = "none",
        contentColor = "#4A4A4A",
        contentAlign = comp.props.contentAlign || comp.props.textAlign || "center",
        backgroundColor = "#FAF9F6"
    } = comp.props;

    // px 변환
    const toPx = v => (typeof v === 'number' ? `${v}px` : v || undefined);
    // content가 배열이 아니면 줄바꿈 분리
    const contentLines = Array.isArray(content) ? content : String(content || '').split('\n');

    return (
        <div
            style={{
                padding: 40,
                background: backgroundColor,
                borderRadius: 0,
                width: '100%',
                height: '100%',
                minWidth: 200,
                minHeight: 120,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #BDB5A6',
                boxShadow: '0 8px 32px rgba(189, 181, 166, 0.15)',
            }}
        >
            {/* 제목 */}
            <div
                style={{
                    fontFamily: titleFontFamily,
                    fontSize: toPx(titleFontSize),
                    fontStyle: titleFontStyle,
                    fontWeight: titleFontWeight,
                    textDecoration: titleTextDecoration,
                    color: titleColor,
                    marginBottom: 28,
                    textAlign: titleAlign,
                    width: '100%',
                    letterSpacing: 1,
                    lineHeight: 1.2,
                    wordBreak: 'keep-all',
                    background: 'none',
                    whiteSpace: 'pre-wrap' // ✅ 연속 스페이스/줄바꿈 반영
                }}
            >
                {title || <span style={{ color: "#bbb" }}>제목 없음</span>}
            </div>

            {/* 본문 */}
            <div
                style={{
                    fontFamily: contentFontFamily,
                    fontSize: toPx(contentFontSize),
                    fontWeight: contentFontWeight,
                    fontStyle: contentFontStyle,
                    textDecoration: contentTextDecoration,
                    color: contentColor,
                    textAlign: contentAlign,
                    lineHeight: 1.7,
                    width: '100%',
                    wordBreak: 'keep-all',
                    background: 'none',
                    whiteSpace: 'pre-wrap' // ✅ 연속 스페이스/줄바꿈 반영
                }}
            >
                {contentLines.map((line, idx) => (
                    <div key={idx} style={{ minHeight: 24, whiteSpace: 'pre-wrap' }}>
                        {line && line.trim().length > 0 ? line : <span style={{ opacity: 0.3 }}>　</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}