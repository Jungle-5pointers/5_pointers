import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeployDto } from './dto/deploy.dto';
import { Pages, PageStatus } from '../users/entities/pages.entity';

// 컴포넌트를 행으로 그룹핑하는 공유 함수
function groupComponentsIntoRows(components: any[]): any[][] {
  if (!components || components.length === 0) {
    return [];
  }

  // Y 좌표 기준으로 정렬
  const sortedComponents = [...components].sort((a, b) => (a.y || 0) - (b.y || 0));
  
  const rows: any[][] = [];
  
  for (const component of sortedComponents) {
    const compTop = component.y || 0;
    const compBottom = compTop + (component.height || 50);
    
    // 현재 컴포넌트와 수직으로 겹치는 기존 행 찾기
    let targetRow = null;
    
    for (const row of rows) {
      // 현재 행의 모든 컴포넌트와 겹치는지 확인
      const hasOverlap = row.some(existingComp => {
        const existingTop = existingComp.y || 0;
        const existingBottom = existingTop + (existingComp.height || 50);
        
        // 수직 겹침 확인: Math.max(top1, top2) < Math.min(bottom1, bottom2)
        return Math.max(compTop, existingTop) < Math.min(compBottom, existingBottom);
      });
      
      if (hasOverlap) {
        targetRow = row;
        break;
      }
    }
    
    if (targetRow) {
      // 기존 행에 추가
      targetRow.push(component);
    } else {
      // 새로운 행 생성
      rows.push([component]);
    }
  }
  
  // 행 내부 정렬은 order 속성이 담당하므로 제거
  return rows;
}

@Injectable()
export class GeneratorService {
  constructor(
    @InjectRepository(Pages)
    private pagesRepository: Repository<Pages>,
  ) {}

  /**
   * 노코드 에디터에서 생성한 컴포넌트들을 HTML로 변환하여 서브도메인에 배포
   * @param deployDto - 배포 요청 데이터 (projectId, userId, components)
   * @returns 배포된 사이트의 URL
   */
  async deploy(deployDto: DeployDto): Promise<{ url: string }> {
    const { projectId, userId, components } = deployDto;
    
    // 1. projectId 유효성 확인
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    // 2. 서브도메인 생성 - 사용자가 입력한 도메인을 우선 사용
    const userDomain = deployDto.domain?.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const subdomain = userDomain || `${userId}-${projectId}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    // 3. pages 테이블에 레코드가 없으면 생성, 있으면 서브도메인과 상태 업데이트
    let page = await this.pagesRepository.findOne({ where: { id: projectId } });
    if (!page) {
      page = this.pagesRepository.create({
        id: projectId,
        subdomain: subdomain,
        title: 'Deployed Page',
        status: PageStatus.DEPLOYED,
        userId: parseInt(userId.replace(/\D/g, '')) || 1
      });
      await this.pagesRepository.save(page);
    } else {
      // 기존 페이지가 있으면 서브도메인 업데이트 및 DEPLOYED 상태로 설정
      page.subdomain = subdomain;
      page.status = PageStatus.DEPLOYED;
      await this.pagesRepository.save(page);
    }
    
    // 4. 최종 배포 URL 생성 (프로덕션에서는 실제 서브도메인 사용)
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.DB_HOST !== 'localhost' || 
                        process.env.API_BASE_URL?.includes('pagecube.net');
    const url = isProduction
      ? `https://${subdomain}.pagecube.net` 
      : `http://localhost:3001/${subdomain}`;
    
    // 5. 컴포넌트 데이터를 pages 테이블의 content 컬럼에 저장
    page.content = { components };
    await this.pagesRepository.save(page);
    
    return { url };
  }

  /**
   * 특정 페이지의 배포 이력 조회
   * @param pageId - 조회할 페이지 ID
   * @returns 배포 정보 배열
   */
  async getDeployments(pageId: string) {
    // pages 테이블에서 해당 페이지의 배포 정보 조회
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, status: PageStatus.DEPLOYED }
    });
    
    // 배포 기록이 없으면 빈 배열 반환
    if (!page) {
      return { deployments: [] };
    }
    
    // 배포 정보 반환
    return { 
      deployments: [{
        deployedUrl: (process.env.NODE_ENV === 'production' || 
                     process.env.DB_HOST !== 'localhost' || 
                     process.env.API_BASE_URL?.includes('pagecube.net'))
          ? `https://${page.subdomain}.pagecube.net` 
          : `http://localhost:3001/${page.subdomain}`,
        deployedAt: page.updatedAt,
        subdomain: page.subdomain,
        projectId: page.id,
        components: page.content?.components || []
      }] 
    };
  }

  /**
   * 특정 페이지의 배포된 컴포넌트 데이터 조회 (서브도메인 렌더링용)
   * @param pageId - 조회할 페이지 ID
   * @returns 페이지의 컴포넌트 데이터
   */
  async getPageData(pageId: string) {
    // pages 테이블에서 해당 페이지의 배포 정보 조회
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, status: PageStatus.DEPLOYED }
    });
    
    // 배포 기록이 없으면 null 반환
    if (!page) {
      return null;
    }
    
    // 배포된 컴포넌트 데이터 반환
    return { 
      components: page.content?.components || []
    };
  }

  /**
   * 서브도메인으로 페이지 데이터 조회 (pages 테이블 기반)
   * @param subdomain - 조회할 서브도메인
   * @returns 페이지 컴포넌트 데이터
   */
  async getPageBySubdomain(subdomain: string) {
    try {
      // pages 테이블에서 subdomain으로 직접 조회
      const page = await this.pagesRepository.findOne({
        where: { subdomain, status: PageStatus.DEPLOYED }
      });
      
      if (!page) {
        throw new NotFoundException(`Subdomain "${subdomain}" not found`);
      }
      
      // content 컬럼에서 컴포넌트 데이터와 페이지 ID 반환
      return {
        components: page.content?.components || [],
        pageId: page.id
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 컴포넌트 배열을 정적 HTML로 변환 (order 속성 적용)
   * @param components - 컴포넌트 배열
   * @returns HTML 문자열
   */
  async generateStaticHTML(components: any[]): Promise<string> {
    // 반응형 레이아웃을 위한 행 그룹핑
    const rows = groupComponentsIntoRows(components);
    
    // 데스크톱 절대 위치 HTML 생성
    const desktopHTML = components.map(comp => {
      const style = `position: absolute; left: ${comp.x}px; top: ${comp.y}px;`;
      return this.renderComponentHTML(comp, style);
    }).join('');
    
    // 모바일 반응형 HTML 생성
    const mobileHTML = rows.map(row => {
      const rowComponents = row.map(comp => {
        const componentStyle = `order: ${Math.floor((comp.x || 0) / 10)}; max-width: 100%; box-sizing: border-box;`;
        return `<div class="component" style="${componentStyle}">${this.renderComponentHTML(comp, '')}</div>`;
      }).join('');
      return `<div class="row-wrapper">${rowComponents}</div>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>배포된 사이트</title>
        <style>
/* 위치 보존 반응형 시스템 - 최종 CSS */

/* 페이지 전체 컨테이너 */
.page-container {
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  padding: 24px; /* 데스크톱 기본 패딩 */
}

/* 데스크톱 절대 위치 모드 */
.page-container.desktop {
  position: relative;
  min-height: 100vh;
}

/* 데스크톱 절대 위치 래퍼 */
.desktop-absolute-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 행 래퍼 - 기본은 가로 정렬 */
.row-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  flex-direction: row; /* 명시적으로 가로 정렬 */
}

/* 개별 컴포넌트 공통 스타일 */
.component {
  max-width: 100%;
  box-sizing: border-box;
}

/* 모바일 미디어 쿼리 - 768px 이하에서 적용 */
@media (max-width: 768px) {
  .page-container {
    padding: 16px; /* 모바일에서 더 작은 패딩 */
  }
  
  .row-wrapper {
    flex-direction: column; /* 모바일에서 세로 정렬로 변경 */
    gap: 12px; /* 모바일에서 더 작은 간격 */
  }
  
  .desktop-absolute-wrapper {
    display: none; /* 모바일에서 데스크톱 레이아웃 숨김 */
  }
}

/* 데스크톱에서 모바일 레이아웃 숨김 */
@media (min-width: 769px) {
  .row-wrapper {
    display: none;
  }
}

body {
  margin: 0;
  font-family: Inter, sans-serif;
  background: #f9fafb;
}
        </style>
      </head>
      <body>
        <div class="page-container">
          <!-- 데스크톱 절대 위치 레이아웃 -->
          <div class="desktop-absolute-wrapper">
            ${desktopHTML}
          </div>
          
          <!-- 모바일 반응형 레이아웃 -->
          ${mobileHTML}
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * 개별 컴포넌트를 HTML로 렌더링
   */
  private renderComponentHTML(comp: any, additionalStyle: string = ''): string {
    const baseStyle = `color: ${comp.props?.color || '#000'}; font-size: ${comp.props?.fontSize || 16}px; ${additionalStyle}`;
    
    switch (comp.type) {
      case 'button':
        return `<button style="${baseStyle} background: ${comp.props?.bg || '#007bff'}; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">${comp.props?.text || 'Button'}</button>`;
      case 'text':
        return `<div style="${baseStyle}">${comp.props?.text || 'Text'}</div>`;
      case 'link':
        return `<a href="${comp.props?.url || '#'}" style="${baseStyle} text-decoration: underline;">${comp.props?.text || 'Link'}</a>`;
      case 'attend':
        return `<button style="${baseStyle} background: ${comp.props?.bg || '#28a745'}; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">${comp.props?.text || 'Attend'}</button>`;
      case 'image':
        return `<img src="${comp.props?.src || ''}" style="${baseStyle} width: ${comp.width || 200}px; height: ${comp.height || 150}px;" alt="${comp.props?.alt || ''}" />`;
      default:
        return `<div style="${baseStyle}">${comp.props?.text || ''}</div>`;
    }
  }
}