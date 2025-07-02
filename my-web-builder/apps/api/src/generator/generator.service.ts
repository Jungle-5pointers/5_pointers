import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeployDto } from './dto/deploy.dto';
import { Pages } from '../users/entities/pages.entity';
import { Submissions } from '../users/entities/submissions.entity';

@Injectable()
export class GeneratorService {
  constructor(
    @InjectRepository(Pages)
    private pagesRepository: Repository<Pages>,
    @InjectRepository(Submissions)
    private submissionsRepository: Repository<Submissions>,
  ) {}

  /**
   * 노코드 에디터에서 생성한 컴포넌트들을 HTML로 변환하여 서브도메인에 배포
   * @param deployDto - 배포 요청 데이터 (projectId, userId, components)
   * @returns 배포된 사이트의 URL
   */
  async deploy(deployDto: DeployDto): Promise<{ url: string }> {
    const { projectId, userId, components, domain } = deployDto;
    
    console.log('Deploy method started with:', { projectId, userId, domain, componentsCount: components?.length });
    
    // 1. projectId 유효성 확인
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    // 2. 서브도메인 생성 - 사용자가 입력한 domain 사용 또는 기본값
    const subdomain = domain ? domain.toLowerCase().replace(/[^a-z0-9-]/g, '') : `${userId}-${projectId}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    // 3. 최종 배포 URL 생성 (정적 파일 없이 동적 렌더링)
    const url = `http://${subdomain}.localhost:3001`;
    
    // 4. 배포 정보를 데이터베이스에 저장 (정적 파일 없이 동적 렌더링)
    // submissions 테이블의 data 컬럼에 JSON 형태로 저장
    const deploymentData = {
      components,        // 배포된 컴포넌트 데이터 (SSR에서 사용)
      deployedUrl: url,  // 접근 가능한 URL
      deployedAt: new Date().toISOString(), // 배포 시간
      subdomain,         // 생성된 서브도메인
      domain: subdomain  // 서브도메인 서버에서 검색용
    };
    
    // 5. 기존 배포 기록이 있는지 확인 (component_id='deployment'로 구분)
    let submission = await this.submissionsRepository.findOne({ 
      where: { pageId: projectId, component_id: 'deployment' }
    });
    
    // 6. 배포 정보 저장 또는 업데이트
    if (submission) {
      console.log('Updating existing submission:', submission.id);
      // 기존 배포가 있으면 업데이트 (재배포)
      submission.data = deploymentData;
      await this.submissionsRepository.save(submission);
    } else {
      console.log('Creating new submission for projectId:', projectId);
      // 첫 배포면 새 레코드 생성
      submission = this.submissionsRepository.create({
        pageId: projectId, // 외래키로 pageId 직접 설정
        component_id: 'deployment', // 배포 데이터임을 구분하는 식별자
        data: deploymentData
      });
      await this.submissionsRepository.save(submission);
      console.log('New submission created with id:', submission.id);
    }
    
    return { url };
  }

  /**
   * 특정 페이지의 배포 이력 조회
   * @param pageId - 조회할 페이지 ID
   * @returns 배포 정보 배열
   */
  async getDeployments(pageId: string) {
    // submissions 테이블에서 해당 페이지의 배포 정보 조회
    const submission = await this.submissionsRepository.findOne({
      where: { pageId, component_id: 'deployment' }
    });
    
    // 배포 기록이 없으면 빈 배열 반환
    if (!submission) {
      return { deployments: [] };
    }
    
    // 배포 정보 반환 (data 컬럼에 저장된 JSON 데이터)
    return { deployments: [submission.data] };
  }

  /**
   * 페이지 데이터 조회 (Next.js 렌더링용)
   * @param pageId - 조회할 페이지 ID
   * @returns 페이지 컴포넌트 데이터
   */
  async getPageData(pageId: string) {
    // submissions 테이블에서 배포된 페이지 데이터 조회
    const submission = await this.submissionsRepository.findOne({
      where: { pageId, component_id: 'deployment' }
    });
    
    if (!submission) {
      throw new Error('Page not found');
    }
    
    // 컴포넌트 데이터 반환
    return {
      components: submission.data.components || []
    };
  }

  /**
   * 서브도메인으로 페이지 데이터 조회
   * @param subdomain - 조회할 서브도메인
   * @returns 페이지 컴포넌트 데이터
   */
  async getPageBySubdomain(subdomain: string) {
    try {
      console.log('Searching for subdomain:', subdomain);
      
      // submissions 테이블에서 subdomain으로 검색
      const submissions = await this.submissionsRepository.find({
        where: { component_id: 'deployment' }
      });
      
      console.log('Found submissions:', submissions.length);
      
      // data JSON에서 domain 필드로 찾기
      const targetSubmission = submissions.find(submission => {
        console.log('Checking submission:', {
          id: submission.id,
          component_id: submission.component_id,
          data: submission.data,
          domain: submission.data?.domain
        });
        console.log('Comparing:', submission.data?.domain, '===', subdomain);
        return submission.data && submission.data.domain === subdomain;
      });
      
      if (!targetSubmission) {
        console.log('No matching submission found for subdomain:', subdomain);
        throw new Error('Subdomain not found');
      }
      
      console.log('Found matching submission:', targetSubmission.data);
      
      return {
        components: targetSubmission.data.components || []
      };
    } catch (error) {
      console.error('Error in getPageBySubdomain:', error);
      throw error;
    }
  }
}