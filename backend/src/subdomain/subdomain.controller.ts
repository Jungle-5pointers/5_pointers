import { Controller, Get, Param, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { SubdomainService } from './subdomain.service';

@Controller()
export class SubdomainController {
  constructor(private readonly subdomainService: SubdomainService) {}

  @Get('/')
  async handleSubdomainRoot(@Req() req: Request, @Res() res: Response) {
    const subdomain = (req as any).subdomain;
    
    console.log('Subdomain root request:', subdomain);
    console.log('Host:', req.get('host'));
    
    // API 서브도메인이나 메인 도메인은 일반 API 응답
    if (!subdomain || subdomain === 'www' || subdomain === 'api') {
      return res.json({ 
        message: 'PageCube API Server',
        subdomain: subdomain || 'main',
        timestamp: new Date().toISOString(),
        host: req.get('host')
      });
    }
    
    try {
      // 서브도메인에 해당하는 페이지 정보 조회
      const pageData = await this.subdomainService.getPageBySubdomain(subdomain);
      
      if (!pageData) {
        return res.status(404).json({
          error: 'Page not found',
          subdomain: subdomain,
          message: `No page found for subdomain: ${subdomain}`
        });
      }
      
      // 페이지 HTML 생성 및 반환
      const html = await this.subdomainService.generatePageHtml(pageData);
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
      
    } catch (error) {
      console.error('Subdomain handling error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        subdomain: subdomain,
        message: error.message
      });
    }
  }

  @Get('/:pageId')
  async handleSubdomainPage(
    @Param('pageId') pageId: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const subdomain = (req as any).subdomain;
    
    console.log('Subdomain page request:', { subdomain, pageId });
    
    // API 경로는 다른 컨트롤러에서 처리하도록 제외
    if (!subdomain || subdomain === 'www' || subdomain === 'api') {
      throw new HttpException('Invalid subdomain access', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const pageData = await this.subdomainService.getPageBySubdomainAndId(subdomain, pageId);
      
      if (!pageData) {
        return res.status(404).json({
          error: 'Page not found',
          subdomain: subdomain,
          pageId: pageId
        });
      }
      
      const html = await this.subdomainService.generatePageHtml(pageData);
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
      
    } catch (error) {
      console.error('Subdomain page handling error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        subdomain: subdomain,
        pageId: pageId,
        message: error.message
      });
    }
  }
}
