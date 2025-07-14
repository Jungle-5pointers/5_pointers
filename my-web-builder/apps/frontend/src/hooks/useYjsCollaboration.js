// frontend/src/hooks/useYjsCollaboration.js

import { useEffect, useState, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { addUserColor } from '../utils/userColors';
import { YJS_WEBSOCKET_URL } from '../config';

export function useYjsCollaboration(roomId, userInfo) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const awarenessRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  // 연결 정리 함수
  const cleanupConnection = useCallback(() => {
    console.log('🧹 Y.js 연결 정리 시작');
    try {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (awarenessRef.current) {
        awarenessRef.current.destroy();
        awarenessRef.current = null;
      }
      
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
      
      console.log('✅ Y.js 연결 정리 완료');
    } catch (error) {
      console.error('❌ Y.js 연결 정리 오류:', error);
    }
  }, []);

  // 재연결 시도 함수
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('🛑 최대 재연결 시도 횟수 초과');
      setIsLocalMode(true);
      return;
    }

    reconnectAttemptsRef.current++;
    console.log(`🔄 재연결 시도 ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
    
    if (providerRef.current) {
      providerRef.current.connect();
    }
  }, []);

  useEffect(() => {
    // 기본값 보장
    const safeRoomId = roomId || 'default-room';
    const safeUserInfo = userInfo || { id: 'anonymous', name: 'Anonymous', color: '#000000' };

    // 기존 연결 정리
    cleanupConnection();
    reconnectAttemptsRef.current = 0;

    // Y.Doc 인스턴스 생성
    const ydoc = new Y.Doc();

    // JWT 토큰 가져오기
    const token = localStorage.getItem('token');

    // 일관된 방 이름 형식 사용
    const roomName = `page:${safeRoomId}`;

    // 환경에 따른 WebSocket URL 설정
    const wsUrl = YJS_WEBSOCKET_URL;

    console.log('🔄 Y.js 서버 연결 시도:', wsUrl, 'Room:', roomName);

    // WebsocketProvider 초기화
    const provider = new WebsocketProvider(wsUrl, roomName, ydoc, {
      connect: true,
      auth: {
        token: token,
      },
      maxBackoffTime: 5000,
      resyncInterval: 5000,
      params: {
        pageId: safeRoomId,
        userId: safeUserInfo.id,
      },
    });

    // Awareness 인스턴스
    const awareness = provider.awareness;

    // 연결 상태 모니터링 (최적화됨)
    provider.on('status', (event) => {
      if (event.status === 'connected') {
        setIsConnected(true);
        setConnectionError(null);
        setIsLocalMode(false);
        reconnectAttemptsRef.current = 0; // 연결 성공 시 재시도 횟수 리셋
        
        // 사용자 정보 설정
        const userWithColor = addUserColor(userInfo);
        awareness.setLocalStateField('user', {
          name: userWithColor.name,
          color: userWithColor.color,
          id: userWithColor.id,
        });
      } else if (event.status === 'disconnected') {
        setIsConnected(false);
      }
    });

    // 연결 오류 처리 (최적화됨)
    provider.on('connection-error', (error) => {
      console.error('❌ WebSocket 연결 오류:', error);
      setConnectionError(error);
      setIsLocalMode(true);
      
      // 재연결 시도
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(attemptReconnect, 5000);
    });

    // 연결 종료 처리
    provider.on('connection-close', () => {
      setIsConnected(false);
    });

    // 동기화 상태 모니터링 (로깅 최소화)
    provider.on('sync', (isSynced) => {
      if (!isSynced) {
        console.log('🔄 Y.js 동기화 진행중...');
      }
    });

    // 참조 저장
    ydocRef.current = ydoc;
    providerRef.current = provider;
    awarenessRef.current = awareness;

    // 정리 함수
    return cleanupConnection;
  }, [roomId, userInfo, cleanupConnection, attemptReconnect]);

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    awareness: awarenessRef.current,
    isConnected,
    connectionError,
    isLocalMode,
  };
}
