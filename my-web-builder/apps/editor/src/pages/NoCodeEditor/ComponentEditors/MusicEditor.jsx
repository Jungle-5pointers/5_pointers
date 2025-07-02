import React, { useState, useRef, useEffect } from 'react';
import { musicLibrary } from '../../../data/musicLibrary';

export default function MusicEditor({ selectedComp, onUpdate }) {
    const previewAudioRef = useRef(null);
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
    const [previewMusicId, setPreviewMusicId] = useState(null);

    // 음악 선택 핸들러
    const selectMusic = (music) => {
        const updatedComp = {
            ...selectedComp,
            props: {
                ...selectedComp.props,
                selectedMusicId: music.id,
                musicData: music.data,
                musicTitle: music.title,
                showTitle: false // 음악 제목 표시 항상 false로 고정
            }
        };
        if (typeof onUpdate === 'function') {
            onUpdate(updatedComp);
        }
    };

    // 미리듣기 핸들러
    const togglePreview = (music) => {
        // 다른 오디오 정지
        window.dispatchEvent(new Event('stopAllMusic'));

        if (isPreviewPlaying && previewMusicId === music.id) {
            previewAudioRef.current?.pause();
            setIsPreviewPlaying(false);
            setPreviewMusicId(null);
        } else {
            if (previewAudioRef.current) {
                previewAudioRef.current.src = music.data;
                previewAudioRef.current.play().catch(console.error);
                setIsPreviewPlaying(true);
                setPreviewMusicId(music.id);
            }
        }
    };

    // stopAllMusic 이벤트 수신 시 미리듣기 정지
    useEffect(() => {
        const stopPreview = () => {
            previewAudioRef.current?.pause();
            setIsPreviewPlaying(false);
            setPreviewMusicId(null);
        };
        window.addEventListener('stopAllMusic', stopPreview);
        return () => window.removeEventListener('stopAllMusic', stopPreview);
    }, []);

    return (
        <div>
            {/* 미리듣기용 오디오 */}
            <audio
                ref={previewAudioRef}
                onEnded={() => {
                    setIsPreviewPlaying(false);
                    setPreviewMusicId(null);
                }}
            />

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
                <span style={{ fontSize: 16 }}>🎵</span>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
                        Music Player
                    </div>
                </div>
            </div>

            {/* 음악 라이브러리 */}
            <div style={{ marginBottom: 20 }}>
                <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1d2129',
                    marginBottom: '12px'
                }}>
                    🎼 음악 선택 ({musicLibrary.length}곡)
                </h4>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {musicLibrary.map(music => (
                        <div
                            key={music.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 12px',
                                border: selectedComp.props.selectedMusicId === music.id
                                    ? '2px solid #3B4EFF'
                                    : '1px solid #ddd',
                                borderRadius: 6,
                                marginBottom: 6,
                                backgroundColor: selectedComp.props.selectedMusicId === music.id
                                    ? '#f0f4ff'
                                    : '#fff',
                                cursor: 'pointer'
                            }}
                            onClick={() => selectMusic(music)}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>
                                    {music.title}
                                </div>
                            </div>
                            {/* 미리듣기 버튼 */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePreview(music);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: 0,
                                    color: '#222',
                                    cursor: 'pointer',
                                    fontSize: '20px',
                                    width: 'auto',
                                    height: 'auto',
                                    padding: 0,
                                    marginLeft: 8
                                }}
                            >
                                {isPreviewPlaying && previewMusicId === music.id ? '⏹' : '▶'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}