import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeployDto } from './dto/deploy.dto';
import { Pages, PageStatus } from '../users/entities/pages.entity';

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
    const userDomain = deployDto.domain
      ?.toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    const requestedSubdomain =
      userDomain ||
      `${userId}-${projectId}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // 3. userId 변환 및 기존 페이지 확인
    const numericUserId = parseInt(userId.replace(/\D/g, '')) || 1;
    let subdomain = requestedSubdomain;
    
    let page;
    try {
      // 4. 서브도메인 소유권 확인 및 프로젝트 페이지 확인
      const existingPageBySubdomain = await this.pagesRepository.findOne({
        where: { subdomain: requestedSubdomain, status: PageStatus.DEPLOYED }
      });
      
      // 서브도메인이 이미 사용 중인 경우 소유권 확인
      if (existingPageBySubdomain) {
        if (existingPageBySubdomain.userId !== numericUserId) {
          // 다른 사용자가 사용 중인 서브도메인인 경우 - 에러 발생
          throw new Error(`서브도메인 '${requestedSubdomain}'는 이미 사용 중입니다. 다른 서브도메인을 선택해주세요.`);
        }
        // 동일한 사용자가 소유한 서브도메인인 경우 - 해당 페이지를 재사용 (ID 변경 안함)
        page = existingPageBySubdomain;
        page.status = PageStatus.DEPLOYED;
        page.title = 'Deployed Page'; // 제목 업데이트
        await this.pagesRepository.save(page);
      } else {
        // 서브도메인이 사용되지 않는 경우 - 새 페이지 생성
        page = await this.pagesRepository.findOne({ where: { id: projectId } });
        
        if (!page) {
          // 완전히 새로운 페이지 생성 - owner 관계도 설정
          const user = await this.pagesRepository.manager.getRepository('Users').findOne({
            where: { id: numericUserId }
          });
          
          if (!user) {
            throw new Error('User not found');
          }
          
          page = this.pagesRepository.create({
            id: projectId,
            owner: user,
            subdomain: subdomain,
            title: 'Deployed Page',
            status: PageStatus.DEPLOYED,
            userId: numericUserId,
          });
          await this.pagesRepository.save(page);
        } else {
          // 기존 프로젝트의 서브도메인 변경
          page.subdomain = subdomain;
          page.status = PageStatus.DEPLOYED;
          await this.pagesRepository.save(page);
        }
      }
    } catch (dbError) {
      if (dbError.message.includes('서브도메인')) {
        throw dbError; // 서브도메인 중복 에러는 그대로 전달
      }
      throw new Error(`데이터베이스 저장 실패: ${dbError.message}`);
    }

    // 5. 최종 배포 URL 생성 (프로덕션에서는 실제 서브도메인 사용)
    const isProduction = process.env.NODE_ENV === 'production';
    const url = isProduction
      ? `http://${subdomain}.ddukddak.org`
      : `http://${subdomain}.localhost:3001`;


    try {
      // 6. 컴포넌트 데이터를 pages 테이블의 content 컬럼에 저장하고 배포 시간 업데이트
      page.content = { components };
      page.deployedAt = new Date(); // 배포 시간 업데이트
      page.status = PageStatus.DEPLOYED; // 상태 명시적으로 설정
      
      console.log('🚀 배포 저장 전 페이지 상태:', {
        id: page.id,
        status: page.status,
        subdomain: page.subdomain,
        deployedAt: page.deployedAt
      });
      
      const savedPage = await this.pagesRepository.save(page);
      
      console.log('✅ 배포 저장 후 페이지 상태:', {
        id: savedPage.id,
        status: savedPage.status,
        subdomain: savedPage.subdomain,
        deployedAt: savedPage.deployedAt
      });
      
      return { url };
    } catch (saveError) {
      console.error('❌ 배포 저장 실패:', saveError);
      throw new Error(`컴포넌트 저장 실패: ${saveError.message}`);
    }
  }

  /**
   * 특정 페이지의 배포 이력 조회
   * @param pageId - 조회할 페이지 ID
   * @returns 배포 정보 배열
   */
  async getDeployments(pageId: string) {
    // pages 테이블에서 해당 페이지의 배포 정보 조회
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, status: PageStatus.DEPLOYED },
    });

    // 배포 기록이 없으면 빈 배열 반환
    if (!page) {
      return { deployments: [] };
    }

    // 배포 정보 반환
    return {
      deployments: [
        {
          deployedUrl:
            process.env.NODE_ENV === 'production'
              ? `http://${page.subdomain}.ddukddak.org`
              : `http://localhost:3001/${page.subdomain}`,
          deployedAt: page.updatedAt,
          subdomain: page.subdomain,
          projectId: page.id,
          components: page.content?.components || [],
        },
      ],
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
      where: { id: pageId, status: PageStatus.DEPLOYED },
    });

    // 배포 기록이 없으면 null 반환
    if (!page) {
      return null;
    }

    // 배포된 컴포넌트 데이터 반환
    return {
      components: page.content?.components || [],
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
        where: { subdomain, status: PageStatus.DEPLOYED },
      });

      if (!page) {
        throw new NotFoundException(`Subdomain "${subdomain}" not found`);
      }

      // content 컬럼에서 컴포넌트 데이터와 페이지 ID 반환
      return {
        components: page.content?.components || [],
        pageId: page.id,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 컴포넌트 배열을 정적 HTML로 변환
   * @param components - 컴포넌트 배열
   * @returns HTML 문자열
   */
  async generateStaticHTML(components: any[]): Promise<string> {
    const componentHTML = components
      .map((comp) => {
        const baseStyle = `position: absolute; left: ${comp.x}px; top: ${comp.y}px;`;
        
        switch (comp.type) {
          case 'button':
            return this.renderButton(comp, baseStyle);
          case 'text':
            return this.renderText(comp, baseStyle);
          case 'link':
            return this.renderLink(comp, baseStyle);
          case 'attend':
            return this.renderAttend(comp, baseStyle);
          case 'image':
            return this.renderImage(comp, baseStyle);
          case 'dday':
            return this.renderDday(comp, baseStyle);
          default:
            return this.renderText(comp, baseStyle);
        }
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>배포된 사이트</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Inter, sans-serif; 
            position: relative; 
            min-height: 100vh; 
            background: #f9fafb;
          }
          .watermark {
            position: fixed;
            bottom: 10px;
            right: 10px;
            font-size: 12px;
            color: #888;
            background: rgba(255,255,255,0.8);
            padding: 5px 10px;
            border-radius: 4px;
          }
          .hover-effect:hover {
            opacity: 0.7;
            transform: scale(1.05);
          }
          .hover-effect:active {
            transform: scale(0.95);
          }
          .hover-effect {
            transition: all 0.2s ease;
          }
        </style>
      </head>
      <body>
        ${componentHTML}
        <div class="watermark">Powered by DdukDdak</div>
      </body>
      </html>
    `;
  }

  /**
   * 버튼 렌더러
   */
  private renderButton(comp: any, baseStyle: string): string {
    const buttonStyle = `
      ${baseStyle}
      width: ${comp.props?.width || comp.width || 'auto'};
      height: ${comp.props?.height || comp.height || 'auto'};
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${comp.props?.bg || comp.props?.backgroundColor || '#3B4EFF'};
      color: ${comp.props?.color || '#fff'};
      font-size: ${comp.props?.fontSize || 18}px;
      font-family: ${comp.props?.fontFamily || 'Inter, sans-serif'};
      border-radius: 6px;
      cursor: pointer;
      border: none;
      outline: none;
      user-select: none;
      padding: 8px 12px;
      box-sizing: border-box;
    `;
    return `<button style="${buttonStyle}" class="hover-effect">${comp.props?.text || comp.props?.buttonText || '버튼'}</button>`;
  }

  /**
   * 텍스트 렌더러
   */
  private renderText(comp: any, baseStyle: string): string {
    const textStyle = `
      ${baseStyle}
      color: ${comp.props?.color || '#000'};
      font-size: ${comp.props?.fontSize || 16}px;
      font-weight: ${comp.props?.fontWeight || 'normal'};
      font-family: ${comp.props?.fontFamily || 'Inter, sans-serif'};
      width: ${comp.props?.width || comp.width || 'auto'};
      height: ${comp.props?.height || comp.height || 'auto'};
      text-align: ${comp.props?.textAlign || 'left'};
      line-height: ${comp.props?.lineHeight || '1.5'};
      white-space: pre-wrap;
    `;
    return `<div style="${textStyle}">${comp.props?.text || ''}</div>`;
  }

  /**
   * 링크 렌더러
   */
  private renderLink(comp: any, baseStyle: string): string {
    const linkStyle = `
      ${baseStyle}
      width: ${comp.props?.width || comp.width || 'auto'};
      height: ${comp.props?.height || comp.height || 'auto'};
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: underline;
      cursor: pointer;
      color: ${comp.props?.color || '#0066cc'};
      font-size: ${comp.props?.fontSize || 16}px;
      font-family: ${comp.props?.fontFamily || 'Inter, sans-serif'};
    `;
    return `<a href="${comp.props?.url || '#'}" style="${linkStyle}" target="${comp.props?.target || '_self'}" class="hover-effect">${comp.props?.text || 'Link'}</a>`;
  }

  /**
   * 참석 버튼 렌더러
   */
  private renderAttend(comp: any, baseStyle: string): string {
    const attendStyle = `
      ${baseStyle}
      width: ${comp.props?.width || comp.width || 300}px;
      height: ${comp.props?.height || comp.height || 200}px;
      background: ${comp.props?.backgroundColor || '#f8f9fa'};
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      box-sizing: border-box;
      font-family: Inter, sans-serif;
    `;
    
    const buttonStyle = `
      display: block;
      width: 100%;
      padding: 12px;
      background: ${comp.props?.buttonColor || '#28a745'};
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 10px;
    `;

    return `
      <div style="${attendStyle}">
        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #333;">${comp.props?.title || '참석 여부'}</h3>
        <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">${comp.props?.description || '참석하시는 분들은 버튼을 눌러주세요'}</p>
        <button style="${buttonStyle}" class="hover-effect">${comp.props?.buttonText || '참석'}</button>
      </div>
    `;
  }

  /**
   * 이미지 렌더러
   */
  private renderImage(comp: any, baseStyle: string): string {
    const imgStyle = `
      ${baseStyle}
      width: ${comp.props?.width || comp.width || 'auto'};
      height: ${comp.props?.height || comp.height || 'auto'};
      object-fit: ${comp.props?.objectFit || 'cover'};
      border-radius: ${comp.props?.borderRadius || '0'};
    `;

    // 👇 이미지 URL 처리 로직 추가
    let imageSrc = comp.props?.src || '';

    // 상대 경로인 경우 절대 URL로 변환
    if (imageSrc.startsWith('/uploads/')) {
      const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://ddukddak.org'
      : 'http://localhost:3000';
      imageSrc = `${baseUrl}${imageSrc}`;
    }
    return `<img src="${comp.props?.src || ''}" style="${imgStyle}" alt="${comp.props?.alt || ''}" />`;
  }

  /**
   * D-day 렌더러
   */
  private renderDday(comp: any, baseStyle: string): string {
    const ddayStyle = `
      ${baseStyle}
      width: ${comp.props?.width || comp.width || 400}px;
      height: ${comp.props?.height || comp.height || 150}px;
      background: ${comp.props?.backgroundColor || '#f8fafc'};
      background-image: url('${comp.props?.backgroundImage || ''}');
      background-size: cover;
      background-position: center;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    `;

    const overlayStyle = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const textStyle = `
      color: white;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    `;

    // D-day 계산
    const targetDate = new Date(comp.props?.targetDate || '2024-12-31');
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let ddayText = '';
    if (diffDays > 0) {
      ddayText = `D-${diffDays}`;
    } else if (diffDays === 0) {
      ddayText = 'D-Day';
    } else {
      ddayText = `D+${Math.abs(diffDays)}`;
    }

    return `
      <div style="${ddayStyle}">
        <div style="${overlayStyle}">
          <div style="${textStyle}">
            ${ddayText}<br>
            <span style="font-size: 16px; font-weight: normal;">${targetDate.toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </div>
    `;
  }
}
