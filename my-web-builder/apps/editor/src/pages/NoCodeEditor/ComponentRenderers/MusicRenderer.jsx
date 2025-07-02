import React, { useState, useRef, useEffect } from 'react';

export default function MusicRenderer({ comp, isEditor = false }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const props = comp?.props || {};
    const {
        musicData = null,
        autoPlay = false,
        loop = true,
        volume = 0.7
    } = props;

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (autoPlay && musicData && audioRef.current && !isEditor) {
            setTimeout(() => {
                audioRef.current.play().catch(() => {});
            }, 500);
        }
    }, [musicData, autoPlay, isEditor]);

    // 재생/일시정지 토글
    const togglePlay = () => {
        // 다른 오디오 정지
        window.dispatchEvent(new Event('stopAllMusic'));

        if (!musicData) return; // 음악 없으면 아무 동작 안함
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => {});
        }
        setIsPlaying(!isPlaying);
    };

    // 오디오 이벤트 리스너
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, [musicData]);

    // stopAllMusic 이벤트 수신 시 음악 정지
    useEffect(() => {
        const stopMusic = () => {
            audioRef.current?.pause();
            setIsPlaying(false);
        };
        window.addEventListener('stopAllMusic', stopMusic);
        return () => window.removeEventListener('stopAllMusic', stopMusic);
    }, []);

    return (
        <div style={{
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {musicData && (
                <audio
                    ref={audioRef}
                    src={musicData}
                    preload="metadata"
                    style={{ display: 'none' }}
                    autoPlay={autoPlay}
                    loop={loop}
                />
            )}
            <button
                onClick={togglePlay}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 40,
                    color: '#222',
                    cursor: 'pointer',
                    padding: 0
                }}
            >
                {isPlaying ? '⏸' : '▶'}
            </button>
        </div>
    );
}