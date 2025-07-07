import React from 'react';

export default function WeddingInviteRenderer({ comp }) {
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
    } = comp.props || {};

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                background: backgroundColor,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontFamily: bodyFontFamily
            }}
        >
            {/* 장식 요소들 */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '60px',
                height: '60px',
                background: 'radial-gradient(circle, rgba(251,207,232,0.4) 0%, transparent 70%)',
                borderRadius: '50%'
            }}></div>
            <div style={{
                position: 'absolute',
                top: '40px',
                right: '30px',
                width: '40px',
                height: '40px',
                background: 'radial-gradient(circle, rgba(254,243,199,0.5) 0%, transparent 70%)',
                borderRadius: '50%'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '40px',
                width: '50px',
                height: '50px',
                background: 'radial-gradient(circle, rgba(253,242,248,0.6) 0%, transparent 70%)',
                borderRadius: '50%'
            }}></div>

            {/* 메인 콘텐츠 */}
            <div style={{
                padding: '40px 30px',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                {/* 하트 아이콘 */}
                <div style={{
                    fontSize: '24px',
                    marginBottom: '20px',
                    opacity: 0.7
                }}>
                    💕
                </div>

                {/* 메인 타이틀 */}
                <h1 style={{
                    fontFamily: titleFontFamily,
                    fontSize: `${titleFontSize}px`,
                    fontWeight: '700',
                    color: textColor,
                    margin: '0 0 10px 0',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    letterSpacing: '1px'
                }}>
                    {title}
                </h1>

                {/* 서브타이틀 */}
                <h2 style={{
                    fontFamily: bodyFontFamily,
                    fontSize: `${subtitleFontSize}px`,
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 8px 0'
                }}>
                    {subtitle}
                </h2>

                {/* 설명 */}
                <p style={{
                    fontSize: `${bodyFontSize}px`,
                    color: '#6b7280',
                    margin: '0 0 30px 0',
                    fontWeight: '400',
                    lineHeight: '1.4'
                }}>
                    {description}
                </p>

                {/* 장식 라인 */}
                <div style={{
                    width: '80px',
                    height: '2px',
                    background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
                    margin: '0 auto 25px auto',
                    borderRadius: '1px'
                }}></div>

                {/* 신랑신부 이름 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '25px'
                }}>
                    <span style={{
                        fontSize: `${bodyFontSize + 2}px`,
                        fontWeight: '600',
                        color: '#3b82f6',
                        padding: '8px 16px',
                        background: 'rgba(219,234,254,0.5)',
                        borderRadius: '20px',
                        border: '1px solid rgba(147,197,253,0.3)'
                    }}>
                        {groomName}
                    </span>
                    <span style={{
                        fontSize: '18px',
                        color: textColor,
                        fontWeight: '500'
                    }}>
                        ♥
                    </span>
                    <span style={{
                        fontSize: `${bodyFontSize + 2}px`,
                        fontWeight: '600',
                        color: '#ec4899',
                        padding: '8px 16px',
                        background: 'rgba(252,231,243,0.5)',
                        borderRadius: '20px',
                        border: '1px solid rgba(249,168,212,0.3)'
                    }}>
                        {brideName}
                    </span>
                </div>

                {/* 날짜 및 시간 */}
                <div style={{
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                }}>
                    <div style={{
                        fontSize: `${bodyFontSize + 4}px`,
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '5px'
                    }}>
                        {date}
                    </div>
                    <div style={{
                        fontSize: `${bodyFontSize + 1}px`,
                        color: '#6b7280',
                        marginBottom: '8px'
                    }}>
                        {time}
                    </div>
                    <div style={{
                        fontSize: `${bodyFontSize}px`,
                        color: '#374151',
                        fontWeight: '500'
                    }}>
                        {venue}
                    </div>
                </div>

                {/* 메시지 */}
                <p style={{
                    fontSize: `${bodyFontSize}px`,
                    color: '#4b5563',
                    fontStyle: 'italic',
                    lineHeight: '1.5',
                    margin: '0',
                    fontWeight: '400'
                }}>
                    {message}
                </p>

                {/* 하단 장식 */}
                <div style={{
                    marginTop: '20px',
                    fontSize: '16px',
                    opacity: 0.6
                }}>
                    🌸 ✨ 🌸
                </div>
            </div>
        </div>
    );
}