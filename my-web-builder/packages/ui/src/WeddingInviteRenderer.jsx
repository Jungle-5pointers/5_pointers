import React from 'react';

export default function WeddingInviteRenderer({ comp }) {
    const {
        containerWidth = comp.width || 450,
        containerHeight = comp.height || 400,
        title = "Our Love Story",
        titleFontFamily = "Dancing Script, cursive, Noto Sans KR, 맑은 고딕, sans-serif",
        titleFontSize = 32,
        titleFontStyle = "italic",
        titleFontWeight = "normal",
        titleTextDecoration = "none",
        titleColor = "#222",
        titleAlign = comp.props.titleAlign || comp.props.textAlign || "center", // 수정된 부분

        content = [
            "서로가 마주보며 다져온 사랑을",
            "이제 함께 한 곳을 바라보며",
            "걸어갈 수 있는 큰 사랑으로 키우고자 합니다.",
            "",
            "저희 두 사람이 사랑의 이름으로",
            "지켜나갈 수 있게 앞날을",
            "축복해 주시면 감사하겠습니다."
        ],
        contentFontFamily = "Noto Sans KR, 맑은 고딕, sans-serif",
        contentFontSize = 22,
        contentFontWeight = "normal",
        contentFontStyle = "normal",
        contentTextDecoration = "none",
        contentColor = "#444",
        contentAlign = comp.props.contentAlign || comp.props.textAlign || "center", // 수정된 부분
        backgroundColor = "#fff"
    } = comp.props; // 수정된 부분

    // px 변환
    const toPx = v => (typeof v === 'number' ? `${v}px` : v || undefined);
    // content가 배열이 아니면 줄바꿈 분리
    const contentLines = Array.isArray(content) ? content : String(content || '').split('\n');

    return (
        <div
            style={{
                padding: 32,
                background: backgroundColor,
                borderRadius: 16,
                width: '100%',
                height: '100%',
                minWidth: 200,
                minHeight: 120,
                boxSizing: 'border-box',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #e3e3e3',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
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
                }}
            >
                {contentLines.map((line, idx) => (
                    <div key={idx} style={{ minHeight: 24 }}>
                        {line && line.trim().length > 0 ? line : <span style={{ opacity: 0.3 }}>　</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}