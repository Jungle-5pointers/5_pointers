import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { DeployDto } from './dto/deploy.dto';

/**
 * 노코드 에디터 배포 관리 API 컸트롤러
 * - 컴포넌트를 HTML로 변환하여 서브도메인에 배포
 * - 배포 이력 조회 기능 제공
 */
@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  /**
   * 노코드 에디터 프로젝트를 서브도메인에 배포
   * POST /generator/deploy
   * @param deployDto - 배포 요청 데이터 (projectId, userId, components)
   * @returns 배포된 사이트 URL
   */
  @Post('deploy')
  async deploy(@Body() deployDto: DeployDto) {
    return this.generatorService.deploy(deployDto);
  }

  /**
   * 특정 페이지의 배포 이력 조회
   * GET /generator/deployments/:pageId
   * @param pageId - 조회할 페이지 ID
   * @returns 배포 정보 목록
   */
  @Get('deployments/:pageId')
  async getDeployments(@Param('pageId') pageId: string) {
    return this.generatorService.getDeployments(pageId);
  }

  /**
   * 페이지 데이터 조회 (Next.js 렌더링용)
   * GET /generator/page/:pageId
   * @param pageId - 조회할 페이지 ID
   * @returns 페이지 컴포넌트 데이터
   */
  @Get('page/:pageId')
  async getPageData(@Param('pageId') pageId: string) {
    return this.generatorService.getPageData(pageId);
  }

  /**
   * 서브도메인으로 페이지 데이터 조회
   * GET /generator/subdomain/:subdomain
   * @param subdomain - 조회할 서브도메인
   * @returns 페이지 컴포넌트 데이터
   */
  @Get('subdomain/:subdomain')
  async getPageBySubdomain(@Param('subdomain') subdomain: string) {
    try {
      return await this.generatorService.getPageBySubdomain(subdomain);
    } catch (error) {
      console.error('Controller error:', error);
      return { error: error.message, subdomain };
    }
  }

  /**
   * 테스트 API
   */
  @Get('test/:subdomain')
  async testSubdomain(@Param('subdomain') subdomain: string) {
    return { message: 'Test successful', subdomain, timestamp: new Date() };
  }
}