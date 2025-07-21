import { useState, useCallback, useRef, useEffect } from 'react';

export function useChat(awareness, userInfo, onCursorChatUpdate) {
  const [isChatInputOpen, setIsChatInputOpen] = useState(false);
  const [chatInputPosition, setChatInputPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const messageIdCounter = useRef(0);
  const autoCloseTimerRef = useRef(null);

  // 채팅 메시지 전송
  const sendChatMessage = useCallback((message, position) => {
    if (!awareness || !message.trim()) return;

    // 더 고유한 ID 생성 (타임스탬프 + 랜덤 + 카운터)
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${messageIdCounter.current++}`;
    const chatMessage = {
      id: messageId,
      message: message.trim(),
      user: {
        id: userInfo?.id || 'anonymous',
        name: userInfo?.name || 'Anonymous',
        color: userInfo?.color || '#000000',
      },
      timestamp: Date.now(),
      position: position,
    };

    // 커서에 채팅 메시지 표시 (자신의 메시지도 표시) - 즉시 표시
    if (onCursorChatUpdate) {
      console.log('💬 채팅 메시지 전송 - 커서 업데이트:', userInfo.id, chatMessage.message);
      onCursorChatUpdate(userInfo.id, chatMessage.message);
      // 10초 후 커서에서 채팅 메시지 제거
      setTimeout(() => {
        console.log('🗑️ 채팅 메시지 제거 - 커서 업데이트:', userInfo.id);
        onCursorChatUpdate(userInfo.id, null);
      }, 10000);
    }

    // Awareness를 통해 다른 사용자에게 메시지 브로드캐스트 (즉시 전송)
    awareness.setLocalStateField('chatMessage', chatMessage);

    // 입력창 닫기
    setIsChatInputOpen(false);
    setIsTyping(false);
  }, [awareness, userInfo, onCursorChatUpdate]);

  // 채팅 입력 열기
  const openChatInput = useCallback((x, y) => {
    setChatInputPosition({ x, y });
    setCursorPosition({ x, y });
    setIsChatInputOpen(true);
    setIsTyping(false);
    // 3초 후 자동으로 닫기 (타이핑 중이 아닐 때만)
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = setTimeout(() => {
      if (!isTyping) {
        setIsChatInputOpen(false);
      }
    }, 3000);
  }, [isTyping]);

  // 채팅 입력 닫기
  const closeChatInput = useCallback(() => {
    setIsChatInputOpen(false);
    setIsTyping(false);
    // 타이머 정리
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  // 타이핑 시작
  const startTyping = useCallback(() => {
    setIsTyping(true);
    // 타이핑 중일 때는 자동 닫기 타이머 비활성화
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  // 타이핑 중지
  const stopTyping = useCallback(() => {
    setIsTyping(false);
    // 타이핑이 끝나면 3초 후 자동으로 닫기
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = setTimeout(() => {
      setIsChatInputOpen(false);
    }, 3000);
  }, []);

  // 타이머 리셋 (입력이 있을 때 호출)
  const resetAutoCloseTimer = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = setTimeout(() => {
      if (!isTyping) {
        setIsChatInputOpen(false);
      }
    }, 3000);
  }, [isTyping]);

  // 마우스 움직임 추적 (더 강한 쓰로틀링 적용)
  useEffect(() => {
    let timeoutId = null;
    let lastPosition = { x: 0, y: 0 };
    
    const handleMouseMove = (e) => {
      if (timeoutId) return; // 쓰로틀링
      
      // 위치가 크게 변경된 경우에만 업데이트
      const newPosition = { x: e.clientX, y: e.clientY };
      const distance = Math.sqrt(
        Math.pow(newPosition.x - lastPosition.x, 2) + 
        Math.pow(newPosition.y - lastPosition.y, 2)
      );
      
      if (distance > 5) { // 5px 이상 이동한 경우에만 업데이트
        timeoutId = setTimeout(() => {
          setCursorPosition(newPosition);
          lastPosition = newPosition;
          timeoutId = null;
        }, 32); // 30fps로 제한 (더 부드러운 성능)
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Awareness 변경 감지 (다른 사용자의 채팅 메시지 수신)
  useEffect(() => {
    if (!awareness) return;
    
    const processedMessages = new Set(); // 중복 처리 방지
    
    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const now = Date.now();
      
      states.forEach((state, clientId) => {
        // 자신의 상태는 제외
        if (clientId === awareness.clientID) return;
        const { chatMessage } = state;
        
        // 채팅 메시지 처리 (최근 1초 내 데이터만, 중복 처리 방지)
        if (chatMessage && 
            (now - chatMessage.timestamp) < 1000 && 
            !processedMessages.has(chatMessage.id)) {
          
          processedMessages.add(chatMessage.id);
          
          // 다른 사용자의 메시지를 내 라이브 커서에 표시
          if (onCursorChatUpdate) {
            console.log('💬 다른 사용자 채팅 메시지 수신 - 라이브 커서 업데이트:', chatMessage.user.id, chatMessage.message);
            onCursorChatUpdate(chatMessage.user.id, chatMessage.message);
            // 10초 후 라이브 커서에서 채팅 메시지 제거
            setTimeout(() => {
              console.log('🗑️ 다른 사용자 채팅 메시지 제거 - 라이브 커서 업데이트:', chatMessage.user.id);
              onCursorChatUpdate(chatMessage.user.id, null);
            }, 10000);
          }
          
          // 메시지 처리 후 Awareness에서 제거 (즉시 제거)
          setTimeout(() => {
            awareness.setLocalStateField('chatMessage', null);
          }, 100);
          
          // 1초 후 중복 처리 방지 Set에서 제거
          setTimeout(() => {
            processedMessages.delete(chatMessage.id);
          }, 1000);
        }
      });
    };
    
    awareness.on('change', handleAwarenessChange);
    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [awareness, onCursorChatUpdate]);

  return {
    isChatInputOpen,
    chatInputPosition,
    cursorPosition,
    isTyping,
    sendChatMessage,
    openChatInput,
    closeChatInput,
    startTyping,
    stopTyping,
    resetAutoCloseTimer,
  };
} 