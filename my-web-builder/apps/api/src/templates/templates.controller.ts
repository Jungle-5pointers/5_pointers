import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TemplateAdminGuard } from '../common/guards/template-admin.guard';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // 템플릿 목록 조회 (공개 템플릿만)
  @Get()
  async getTemplates(@Query('category') category?: string) {
    return this.templatesService.getPublicTemplates(category);
  }

  // 페이지를 템플릿으로 저장 (관리자만)
  @Post('from-page')
  @UseGuards(JwtAuthGuard, TemplateAdminGuard)
  async createTemplateFromPage(
    @Request() req,
    @Body() body: {
      pageId: string;
      name: string;
      category: string;
      tags?: string[];
      thumbnail_url?: string;
    }
  ) {
    return this.templatesService.createTemplateFromPage(
      body.pageId,
      body.name,
      body.category,
      req.user.id,
      body.tags,
      body.thumbnail_url
    );
  }

  // 컴포넌트 배열로 템플릿 생성 (관리자만)
  @Post('from-components')
  @UseGuards(JwtAuthGuard, TemplateAdminGuard)
  async createTemplateFromComponents(
    @Request() req,
    @Body() body: {
      components: any[];
      name: string;
      category: string;
      tags?: string[];
      thumbnail_url?: string;
    }
  ) {
    return this.templatesService.createTemplateFromComponents(
      body.components,
      body.name,
      body.category,
      req.user.id,
      body.tags,
      body.thumbnail_url
    );
  }

  // 템플릿으로 새 페이지 생성
  @Post(':templateId/create-page')
  @UseGuards(JwtAuthGuard)
  async createPageFromTemplate(
    @Request() req,
    @Param('templateId') templateId: string,
    @Body() body: { title?: string; subdomain: string }
  ) {
    return this.templatesService.createPageFromTemplate(
      templateId,
      req.user.id,
      body.title,
      body.subdomain
    );
  }
}