import { useState } from 'react';
import { API_BASE_URL, getDeployedUrl } from '../../../../config';

// JWT 토큰에서 사용자 ID 추출
const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;

    // Base64URL을 Base64로 변환
    let base64 = tokenParts[1];
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

    // 패딩 추가
    while (base64.length % 4) {
      base64 += '=';
    }

    // UTF-8로 안전하게 디코딩
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const utf8String = new TextDecoder('utf-8').decode(bytes);
    const payload = JSON.parse(utf8String);

    return payload.userId || payload.sub || null;
  } catch (error) {
    console.error('토큰 파싱 실패:', error);
    return null;
  }
};

export function useDeploy() {
  const [showDomainInput, setShowDomainInput] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');

  const handleDeploy = async (components, roomId, domainOverride = null, onDeploySuccess = null) => {
    const domainToUse = domainOverride ? domainOverride.trim() : domainName.trim();

    console.log('🚀 배포 시작:', { domainToUse, roomId, componentsCount: components?.length });

    if (!domainToUse) {
      setShowDomainInput(true);
      return;
    }

    // 만약 외부에서 도메인을 전달했다면 상태도 동기화
    if (domainOverride) {
      setDomainName(domainToUse);
    }
    
    setIsDeploying(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('인증 토큰이 없습니다. 로그인이 필요할 수 있습니다.');
      }
      
      const headers = { 
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error('사용자 ID를 찾을 수 없습니다. 로그인 후 다시 시도해주세요.');
      }

      const requestBody = {
        projectId: roomId,
        userId: userId.toString(),
        components: components || [],
        domain: domainToUse
      };
      
      console.log('📤 API 요청:', {
        url: `${API_BASE_URL}/generator/deploy`,
        headers,
        body: requestBody
      });
      
      const response = await fetch(`${API_BASE_URL}/generator/deploy`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      console.log('배포 API 응답:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('배포 성공 데이터:', data);
        
        // 백엔드에서 반환된 URL을 사용 (백엔드가 환경별 올바른 URL을 제공)
        const deployedUrl = data.url || getDeployedUrl(domainToUse);
        console.log('최종 배포 URL:', deployedUrl);
        
        setDeployedUrl(deployedUrl);
        setShowDomainInput(false);
        
        console.log('배포 완료! URL 상태 업데이트됨:', deployedUrl);
        
        // 배포 성공 후 콜백 실행
        if (onDeploySuccess) {
          onDeploySuccess(deployedUrl);
        }
      } else {
        const errorData = await response.text();
        console.error('배포 실패 응답:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
        } else {
          throw new Error(`배포 실패: ${response.status} - ${errorData}`);
        }
      }
    } catch (error) {
      console.error('배포 실패:', error);
      console.error('Deploy error', error);
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    showDomainInput,
    setShowDomainInput,
    domainName,
    setDomainName,
    isDeploying,
    deployedUrl,
    handleDeploy,
    resetDeploy: () => {
      setDeployedUrl('');
      setDomainName('');
    }
  };
}
