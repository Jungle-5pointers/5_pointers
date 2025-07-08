import { getRendererByType } from '@my-project/ui';
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

// API 기본 URL 설정 - 프로덕션 환경 고려
const API_BASE_URL = process.env.API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.pagecube.net/api'
    : 'http://localhost:3000/api');

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '40px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(255,255,255,0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }} />
      <div style={{ fontSize: '18px', fontWeight: '600' }}>
        페이지를 불러오는 중...
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

const DynamicPageRenderer = ({
  components,
  pageId,
  subdomain,
}: {
  components: ComponentData[];
  pageId: string;
  subdomain?: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 컴포넌트가 마운트되면 로딩 완료
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Head>
        <title>{subdomain ? `${subdomain} - My Web Builder` : 'My Web Builder'}</title>
        <meta name="description" content={`${subdomain || pageId}에서 만든 웹사이트입니다.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* 모바일 최적화 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* 소셜 미디어 메타 태그 */}
        <meta property="og:title" content={`${subdomain || pageId} - My Web Builder`} />
        <meta property="og:description" content={`${subdomain || pageId}에서 만든 웹사이트입니다.`} />
        <meta property="og:type" content="website" />
        
        {/* 글로벌 스타일 */}
        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            scroll-behavior: smooth;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          body {
            line-height: 1.6;
            color: #333;
          }
          
          /* 컴포넌트 호버 효과 */
          .component-container {
            transition: all 0.2s ease;
          }
          
          .component-container:hover {
            z-index: 10;
          }
          
          /* 스크롤바 스타일링 */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
        `}</style>
      </Head>
      
      <div
        style={{
          position: 'relative',
          width: '100vw',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          overflow: 'auto',
          padding: '0',
          margin: '0'
        }}
      >
        {/* 배경 패턴 */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        
        {/* 메인 컨텐츠 */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh'
        }}>
          {components && components.length > 0 ? (
            components.map((comp) => {
              try {
                const RendererComponent = getRendererByType(comp.type);

                if (!RendererComponent) {
                  return (
                    <div
                      key={comp.id}
                      className="component-container"
                      style={{
                        position: 'absolute',
                        left: comp.x || 0,
                        top: comp.y || 0,
                        padding: '16px 20px',
                        background: 'rgba(248, 249, 250, 0.95)',
                        border: '2px dashed #dee2e6',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#6c757d',
                        fontWeight: '500',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>🔧</span>
                        <span>
                          {comp.props?.text || `${comp.type} 컴포넌트`}
                        </span>
                      </div>
                    </div>
                  );
                }

                // 컴포넌트별 기본 크기 설정
                const getComponentDefaultSize = (componentType: string) => {
                  const defaultSizes: { [key: string]: { width: number; height: number } } = {
                    slido: { width: 400, height: 300 },
                    button: { width: 150, height: 50 },
                    text: { width: 200, height: 50 },
                    image: { width: 200, height: 150 },
                    map: { width: 400, height: 300 },
                    attend: { width: 300, height: 200 },
                    dday: { width: 250, height: 100 },
                    page: { width: 300, height: 150 },
                    default: { width: 200, height: 100 }
                  };
                  return defaultSizes[componentType] || defaultSizes.default;
                };

                const defaultSize = getComponentDefaultSize(comp.type);
                const componentWidth = comp.width || defaultSize.width;
                const componentHeight = comp.height || defaultSize.height;

                return (
                  <div
                    key={comp.id}
                    className="component-container"
                    style={{
                      position: 'absolute',
                      left: comp.x || 0,
                      top: comp.y || 0,
                      width: `${componentWidth}px`,
                      height: `${componentHeight}px`,
                      zIndex: 2
                    }}
                  >
                    <RendererComponent
                      comp={{ ...comp, pageId, width: componentWidth, height: componentHeight }}
                      component={{ ...comp, pageId, width: componentWidth, height: componentHeight }}
                      isEditor={false}
                      onUpdate={() => {}}
                      onPropsChange={() => {}}
                    />
                  </div>
                );
              } catch (error) {
                console.error('Error rendering component:', comp.type, error);
                return (
                  <div
                    key={comp.id}
                    className="component-container"
                    style={{
                      position: 'absolute',
                      left: comp.x || 0,
                      top: comp.y || 0,
                      padding: '16px 20px',
                      background: 'rgba(255, 230, 230, 0.95)',
                      border: '2px solid #ff6b6b',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: '#c92a2a',
                      fontWeight: '600',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 12px rgba(255, 107, 107, 0.2)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>⚠️</span>
                      <span>
                        렌더링 오류: {comp.type}
                      </span>
                    </div>
                  </div>
                );
              }
            })
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              padding: '40px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '60px 40px',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎨</div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2d3748',
                  marginBottom: '12px'
                }}>
                  빈 페이지입니다
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  아직 컴포넌트가 추가되지 않았습니다.<br />
                  에디터에서 컴포넌트를 추가해보세요!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

interface ComponentData {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  props: any;
}

interface PageProps {
  pageData: {
    components: ComponentData[];
    pageId?: string;
  } | null;
  pageId: string;
}

const ErrorPage = ({ message, subdomain }: { message: string; subdomain?: string }) => (
  <>
    <Head>
      <title>페이지를 찾을 수 없습니다 - My Web Builder</title>
      <meta name="description" content="요청하신 페이지를 찾을 수 없습니다." />
    </Head>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 40px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        maxWidth: '500px',
        margin: '40px'
      }}>
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🔍</div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '16px',
          lineHeight: '1.3'
        }}>
          페이지를 찾을 수 없습니다
        </h1>
        {subdomain && (
          <p style={{
            fontSize: '16px',
            marginBottom: '16px',
            opacity: 0.9,
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontFamily: 'monospace'
          }}>
            {subdomain}
          </p>
        )}
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          opacity: 0.8,
          marginBottom: '32px'
        }}>
          {message}
        </p>
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          fontSize: '14px',
          lineHeight: '1.5',
          opacity: 0.7
        }}>
          💡 페이지가 배포되지 않았거나 삭제되었을 수 있습니다.<br />
          에디터에서 페이지를 다시 배포해보세요.
        </div>
      </div>
    </div>
  </>
);

const RenderedPage = ({ pageData, pageId, subdomain }: PageProps & { subdomain?: string }) => {
  if (!pageData) {
    return (
      <ErrorPage 
        message="요청하신 페이지가 존재하지 않습니다." 
        subdomain={subdomain}
      />
    );
  }

  return (
    <DynamicPageRenderer
      components={pageData.components}
      pageId={pageData.pageId || pageId}
      subdomain={subdomain}
    />
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { pageId } = context.params!;
  const { req } = context;

  try {
    // 호스트 헤더에서 서브도메인 추출
    const host = req.headers.host || '';
    console.log('🌐 Host header:', host);
    console.log('📄 PageId from params:', pageId);

    // subdomain 추출 로직 개선
    let subdomain = pageId as string;
    
    // localhost 또는 배포 환경에서의 서브도메인 처리
    if (host.includes('.localhost')) {
      // 개발 환경: mysite.localhost:3001 -> mysite
      subdomain = host.split('.')[0];
    } else if (host.includes('.')) {
      // 프로덕션 환경에서 서브도메인 처리가 필요한 경우
      const parts = host.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
      }
    }
    // 그 외의 경우 pageId를 subdomain으로 사용

    console.log('🎯 Extracted subdomain:', subdomain);

    // API 요청 헤더 설정
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'SubdomainNextJS/1.0',
    };

    // 호스트 정보 전달 (디버깅용)
    if (req.headers['x-forwarded-for']) {
      headers['X-Forwarded-For'] = req.headers['x-forwarded-for'] as string;
    }

    console.log('🚀 API 요청 시작:', `${API_BASE_URL}/generator/subdomain/${subdomain}`);

    // 서버에서 백엔드 API 호출 (subdomain으로 조회)
    const res = await fetch(`${API_BASE_URL}/generator/subdomain/${subdomain}`, {
      method: 'GET',
      headers,
      // 타임아웃 설정 (10초)
      signal: AbortSignal.timeout(10000),
    });

    console.log('📡 API response status:', res.status);
    console.log('📡 API response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('❌ API 응답 에러:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText
      });

      // 404 에러인 경우 커스텀 에러 페이지 반환
      if (res.status === 404) {
        return {
          props: {
            pageData: null,
            pageId: subdomain,
            subdomain,
            error: 'PAGE_NOT_FOUND'
          },
        };
      }

      // 기타 서버 에러
      return {
        props: {
          pageData: null,
          pageId: subdomain,
          subdomain,
          error: 'SERVER_ERROR'
        },
      };
    }

    const pageData = await res.json();
    console.log('✅ Page data received:', {
      pageId: pageData.pageId,
      componentsCount: pageData.components?.length || 0,
      hasComponents: !!pageData.components
    });

    // 데이터 검증
    if (!pageData || typeof pageData !== 'object') {
      console.error('❌ Invalid page data format:', pageData);
      return {
        props: {
          pageData: null,
          pageId: subdomain,
          subdomain,
          error: 'INVALID_DATA'
        },
      };
    }

    // 컴포넌트 배열이 없는 경우 빈 배열로 초기화
    if (!Array.isArray(pageData.components)) {
      console.warn('⚠️ Components is not an array, initializing as empty array');
      pageData.components = [];
    }

    return {
      props: {
        pageData: {
          components: pageData.components,
          pageId: pageData.pageId || subdomain
        },
        pageId: subdomain,
        subdomain,
      },
    };
  } catch (error) {
    console.error('💥 Failed to fetch page data:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      subdomain: pageId
    });

    // 네트워크 에러나 타임아웃의 경우
    return {
      props: {
        pageData: null,
        pageId: pageId as string,
        subdomain: pageId as string,
        error: 'NETWORK_ERROR'
      },
    };
  }
};

export default RenderedPage;
