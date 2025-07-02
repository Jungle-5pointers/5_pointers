import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

/**
 * Y.js 기본 협업 인프라를 설정하는 훅
 * WebSocket Provider, Y.Doc, Awareness를 초기화하고 관리
 */
export function useYjsCollaboration(roomId, userInfo) {
  const [isConnected, setIsConnected] = useState(false);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const awarenessRef = useRef(null);

  useEffect(() => {
    if (!roomId || !userInfo) return;

    // Y.Doc 인스턴스 생성 - 모든 협업 데이터의 중앙 저장소
    const ydoc = new Y.Doc();
    
    // WebSocket Provider 생성 - 실시간 동기화를 담당
    // 임시로 공개 Y.js 서버 사용 (개발용)
    const provider = new WebsocketProvider(
      'wss://demos.yjs.dev', // 공개 Y.js 서버 (개발용)
      roomId, // 룸 ID로 협업 세션을 구분
      ydoc,
      {
        connect: true,
        // 연결 재시도 설정
        maxBackoffTime: 5000,
        resyncInterval: 5000
      }
    );

    // Awareness 인스턴스 - 사용자의 실시간 상태(커서, 선택 등)를 관리
    const awareness = provider.awareness;

    // 현재 사용자 정보를 Awareness에 설정
    awareness.setLocalStateField('user', {
      name: userInfo.name,
      color: userInfo.color,
      id: userInfo.id
    });

    // 연결 상태 관리
    provider.on('status', (event) => {
      setIsConnected(event.status === 'connected');
    });

    // 컴포넌트 언마운트 시 정리
    const cleanup = () => {
      awareness.destroy();
      provider.destroy();
      ydoc.destroy();
    };

    // ref에 저장하여 다른 훅에서 접근 가능하도록 함
    ydocRef.current = ydoc;
    providerRef.current = provider;
    awarenessRef.current = awareness;

    return cleanup;
  }, [roomId, userInfo]);

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    awareness: awarenessRef.current,
    isConnected
  };
} 