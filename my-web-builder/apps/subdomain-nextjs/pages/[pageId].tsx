import { getRendererByType } from '@my-project/ui';
import React from 'react';
import { GetServerSideProps } from 'next';

const DynamicPageRenderer = ({ components }: { components: ComponentData[] }) => {
  if (!components || components.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: 16,
        color: '#6c757d',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <div>페이지를 찾을 수 없습니다</div>
        </div>
      </div>
    );
  }

  const calculateCanvasSize = () => {
    let maxX = 1920;
    let maxY = 1080;
    components.forEach(comp => {
      maxX = Math.max(maxX, comp.x + (comp.width || 200));
      maxY = Math.max(maxY, comp.y + (comp.height || 100) + 100);
    });
    return { width: maxX, height: maxY };
  };

  const canvasSize = calculateCanvasSize();

  return (
    <div style={{
      position: 'relative',
      width: `${canvasSize.width}px`,
      height: `${canvasSize.height}px`,
      background: '#ffffff',
      margin: '0 auto',
      minHeight: '100vh',
      overflow: 'visible'
    }}>
      {components.map(comp => {
        try {
          const RendererComponent = getRendererByType(comp.type);
          
          if (!RendererComponent) {
            return (
              <div
                key={comp.id}
                style={{
                  position: 'absolute',
                  left: comp.x,
                  top: comp.y,
                  padding: '8px 12px',
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: 4,
                  fontSize: 14,
                  color: '#6c757d'
                }}
              >
                {comp.props?.text || comp.type}
              </div>
            );
          }

          return (
            <div
              key={comp.id}
              style={{
                position: 'absolute',
                left: comp.x,
                top: comp.y,
                width: comp.width || 'auto',
                height: comp.height || 'auto'
              }}
            >
              <RendererComponent comp={comp} isEditor={false} onUpdate={() => {}} />
            </div>
          );
        } catch (error) {
          console.error('Error rendering component:', comp.type, error);
          return (
            <div
              key={comp.id}
              style={{
                position: 'absolute',
                left: comp.x,
                top: comp.y,
                padding: '8px 12px',
                background: '#ffe6e6',
                border: '1px solid #ff9999',
                borderRadius: 4,
                fontSize: 14,
                color: '#cc0000'
              }}
            >
              Error: {comp.type}
            </div>
          );
        }
      })}
    </div>
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
  } | null;
  pageId: string;
}

const RenderedPage = ({ pageData, pageId }: PageProps) => {
  if (!pageData) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div>페이지를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return <DynamicPageRenderer components={pageData.components} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { pageId } = context.params!;
  
  try {
    // 서버에서 백엔드 API 호출
    const res = await fetch(`http://localhost:3000/generator/subdomain/${pageId}`);
    
    if (!res.ok) {
      return {
        notFound: true
      };
    }
    
    const pageData = await res.json();
    
    return {
      props: {
        pageData,
        pageId: pageId as string
      }
    };
  } catch (error) {
    console.error('Failed to fetch page data:', error);
    return {
      notFound: true
    };
  }
};



export default RenderedPage;