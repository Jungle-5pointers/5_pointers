import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

// Next.js 서브도메인 서버용 API 설정
const API_BASE_URL = process.env.API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'http://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/api'
    : 'http://localhost:3000/api');

// 실제 프론트엔드 컴포넌트들을 import
import ButtonRenderer from '../components/renderers/ButtonRenderer.jsx';
import TextRenderer from '../components/renderers/TextRenderer.jsx';
import LinkRenderer from '../components/renderers/LinkRenderer.jsx';
import AttendRenderer from '../components/renderers/AttendRenderer.jsx';
import ImageRenderer from '../components/renderers/ImageRenderer.jsx';
import MapInfoRenderer from '../components/renderers/MapInfoRenderer.jsx';
import DdayRenderer from '../components/renderers/DdayRenderer.jsx';
import WeddingContactRenderer from '../components/renderers/WeddingContactRenderer.jsx';
import GridGalleryRenderer from '../components/renderers/GridGalleryRenderer.jsx';
import SlideGalleryRenderer from '../components/renderers/SlideGalleryRenderer.jsx';
import CalendarRenderer from '../components/renderers/CalendarRenderer.jsx';
import BankAccountRenderer from '../components/renderers/BankAccountRenderer.jsx';
import CommentRenderer from '../components/renderers/CommentRenderer.jsx';
import SlidoRenderer from '../components/renderers/SlidoRenderer.jsx';
import WeddingInviteRenderer from '../components/renderers/WeddingInviteRenderer.jsx';
import MusicRenderer from '../components/renderers/MusicRenderer.jsx';
import KakaoTalkShareRenderer from '../components/renderers/KakaoTalkShareRenderer.jsx';
import MapView from '../components/renderers/MapView.jsx';
import PageRenderer from '../components/renderers/PageRenderer.jsx';
import PageButtonRenderer from '../components/renderers/PageButtonRenderer.jsx';
import LinkCopyRenderer from '../components/renderers/LinkCopyRenderer.jsx';

// API 설정을 전역으로 설정 (컴포넌트들이 사용할 수 있도록)
if (typeof window !== 'undefined') {
  (window as any).API_BASE_URL = API_BASE_URL;
  console.log('🔧 Next.js 서버 - API_BASE_URL 설정됨:', API_BASE_URL);
  console.log('🔧 Next.js 서버 - NODE_ENV:', process.env.NODE_ENV);
}

// 컴포넌트 타입별 렌더러 매핑 함수
const getRendererByType = (type: string) => {
  const renderers: { [key: string]: React.ComponentType<any> } = {
    'button': ButtonRenderer,
    'text': TextRenderer,
    'link': LinkRenderer,
    'attend': AttendRenderer,
    'image': ImageRenderer,
    'mapInfo': MapInfoRenderer,
    'dday': DdayRenderer,
    'weddingContact': WeddingContactRenderer,
    'gridGallery': GridGalleryRenderer,
    'slideGallery': SlideGalleryRenderer,
    'calendar': CalendarRenderer,
    'bankAccount': BankAccountRenderer,
    'comment': CommentRenderer,
    'slido': SlidoRenderer,
    'weddingInvite': WeddingInviteRenderer,
    'map': MapView,
    'musicPlayer': MusicRenderer,
    'kakaotalkShare': KakaoTalkShareRenderer,
    'page': PageRenderer,
    'music': MusicRenderer,
    'kakaoTalkShare': KakaoTalkShareRenderer,
    'pageButton': PageButtonRenderer,
    'linkCopy': LinkCopyRenderer,
  };

  console.log(`🎯 Getting renderer for type: ${type}`, renderers[type] ? 'Found' : 'Not found');
  return renderers[type] || null;
};

const DynamicPageRenderer = ({
  components,
  pageId,
  subdomain,
}: {
  components: ComponentData[];
  pageId: string;
  subdomain?: string;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    setIsMounted(true);
    
    const checkViewport = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);
      
      // 모바일에서만 375px 기준으로 스케일 계산
      if (isMobile) {
        const currentWidth = window.innerWidth;
        const baseWidth = 375;
        const newScaleFactor = currentWidth / baseWidth;
        setScaleFactor(newScaleFactor);
      } else {
        setScaleFactor(1);
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (!isMounted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>
            페이지를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 모바일에서 행 기반 레이아웃 사용
  const groupComponentsIntoRows = (components: ComponentData[]) => {
    if (!components || components.length === 0) return [];

    const sortedComponents = [...components].sort((a, b) => (a.y || 0) - (b.y || 0));
    const rows: ComponentData[][] = [];
    
    for (const component of sortedComponents) {
      const compTop = component.y || 0;
      const compBottom = compTop + (component.height || getComponentDefaultSize(component.type).height);
      
      let targetRow = null;
      
      for (const row of rows) {
        const hasOverlap = row.some(existingComp => {
          const existingTop = existingComp.y || 0;
          const existingBottom = existingTop + (existingComp.height || getComponentDefaultSize(existingComp.type).height);
          return Math.max(compTop, existingTop) < Math.min(compBottom, existingBottom);
        });
        
        if (hasOverlap) {
          targetRow = row;
          break;
        }
      }
      
      if (targetRow) {
        targetRow.push(component);
      } else {
        rows.push([component]);
      }
    }
    
    return rows.map(row => 
      [...row].sort((a, b) => (a.x || 0) - (b.x || 0))
    );
  };

  const getComponentDefaultSize = (componentType: string) => {
    const defaultSizes: { [key: string]: { width: number; height: number } } = {
      slido: { width: 400, height: 300 },
      button: { width: 150, height: 50 },
      text: { width: 200, height: 50 },
      image: { width: 200, height: 150 },
      map: { width: 400, height: 300 },
      attend: { width: 300, height: 200 },
      dday: { width: 250, height: 100 },
      default: { width: 200, height: 100 }
    };
    return defaultSizes[componentType] || defaultSizes.default;
  };

  const rows = isMobileView ? groupComponentsIntoRows(components) : null;
  const sortedComponents = !isMobileView ? [...components].sort((a, b) => (a.y || 0) - (b.y || 0)) : null;

  return (
    <>
      <Head>
        <title>{subdomain ? `${subdomain} - My Web Builder` : 'My Web Builder'}</title>
        <meta name="description" content={`${subdomain || pageId}에서 만든 웹사이트입니다.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/ddukddak-logo2.png" />
      </Head>
      
      <div
        className="page-container"
        style={{
          position: isMobileView ? 'static' : 'relative',
          display: isMobileView ? 'flex' : 'block',
          flexDirection: isMobileView ? 'column' : 'unset',
          alignItems: isMobileView ? 'center' : 'unset',
          justifyContent: isMobileView ? 'flex-start' : 'unset',
          width: '100%',
          maxWidth: '100vw',
          minHeight: '100vh',
          background: '#ffffff',
          overflowX: 'hidden', // 항상 가로 스크롤 방지
          padding: isMobileView ? '0' : 'unset'
        }}
      >
        <div style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          width: '100%',
          display: isMobileView ? 'flex' : 'block',
          flexDirection: isMobileView ? 'column' : 'unset',
          alignItems: isMobileView ? 'center' : 'unset',
        }}>
          {components && components.length > 0 ? (
            isMobileView ? (
              rows?.map((row, rowIndex) => (
                <div key={rowIndex} style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start'
                }}>
                  {row.map((comp) => {
                    console.log('🔍 Rendering component:', comp.type, comp.id);
                    const RendererComponent = getRendererByType(comp.type);
                    if (!RendererComponent) {
                      console.warn('❌ No renderer found for type:', comp.type);
                      return null;
                    }
                    
                    const defaultSize = getComponentDefaultSize(comp.type);
                    const originalWidth = comp.width || defaultSize.width;
                    const originalHeight = comp.height || defaultSize.height;
                    
                    return (
                      <div key={comp.id} className="component-wrapper" style={{
                        transform: `scale(${scaleFactor})`,
                        transformOrigin: 'top center',
                        width: `${originalWidth}px`,
                        height: `${originalHeight}px`,
                        marginBottom: `${16 * scaleFactor}px`,
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <RendererComponent
                          {...comp.props}
                          comp={{ ...comp, width: originalWidth, height: originalHeight }}
                          mode="live"
                          isEditor={false}
                          pageId={pageId}
                        />
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              sortedComponents?.map((comp) => {
                console.log('🔍 Desktop rendering component:', comp.type, comp.id);
                const RendererComponent = getRendererByType(comp.type);
                if (!RendererComponent) {
                  console.warn('❌ Desktop: No renderer found for type:', comp.type);
                  return null;
                }

                const defaultSize = getComponentDefaultSize(comp.type);
                const originalWidth = comp.width || defaultSize.width;
                const originalHeight = comp.height || defaultSize.height;

                return (
                  <div
                    key={comp.id}
                    className="component-container"
                    style={{
                      position: 'absolute',
                      left: comp.x || 0,
                      top: comp.y || 0,
                      width: `${originalWidth}px`,
                      height: `${originalHeight}px`,
                      zIndex: 2
                    }}
                  >
                    <RendererComponent
                      {...comp.props}
                      comp={{ ...comp, width: originalWidth, height: originalHeight }}
                      mode="live"
                      isEditor={false}
                      pageId={pageId}
                    />
                  </div>
                );
              })
            )
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
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
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
      padding: '60px 40px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '20px'
    }}>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>{message}</p>
    </div>
  </div>
);

const RenderedPage = ({ pageData, pageId, subdomain }: PageProps & { subdomain?: string }) => {
  if (!pageData) {
    return <ErrorPage message="요청하신 페이지가 존재하지 않습니다." subdomain={subdomain} />;
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
    const host = req.headers.host || '';
    let subdomain = pageId as string;
    
    if (host.includes('.localhost')) {
      subdomain = host.split('.')[0];
    } else if (host.includes('.')) {
      const parts = host.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
      }
    }

    // 테스트용 mock 데이터
    if (subdomain === 'test123' || subdomain === 'demo' || subdomain === 'test') {
      const mockPageData = {
        pageId: subdomain,
        components: [
          {
            id: 'test-button-1',
            type: 'button',
            x: 50,
            y: 50,
            width: 150,
            height: 50,
            props: {
              text: '테스트 버튼',
              bg: '#3B4EFF',
              color: '#fff'
            }
          }
        ]
      };

      return {
        props: {
          pageData: mockPageData,
          pageId: subdomain,
          subdomain,
        },
      };
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'SubdomainNextJS/1.0',
    };

    if (req.headers['x-forwarded-for']) {
      headers['X-Forwarded-For'] = req.headers['x-forwarded-for'] as string;
    }

    const res = await fetch(`${API_BASE_URL}/generator/subdomain/${subdomain}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        props: {
          pageData: null,
          pageId: subdomain,
          subdomain,
          error: 'PAGE_NOT_FOUND'
        },
      };
    }

    const pageData = await res.json();

    if (!Array.isArray(pageData.components)) {
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