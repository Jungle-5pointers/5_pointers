import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Templates } from '../users/entities/templates.entity';
import { Pages, PageStatus } from '../users/entities/pages.entity';
import { Users } from '../users/entities/users.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Templates)
    private templatesRepository: Repository<Templates>,
    @InjectRepository(Pages)
    private pagesRepository: Repository<Pages>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  // 공개 템플릿 목록 조회
  async getPublicTemplates(category?: string, editingMode?: string) {
    try {
      console.log(`[Templates] 템플릿 조회 시작 - category: ${category}`);
      
      const query = this.templatesRepository
        .createQueryBuilder('template')
        .leftJoinAndSelect('template.author', 'author')
        .where('template.isPublic = :isPublic', { isPublic: true })
        .orderBy('template.createdAt', 'DESC');

      if (category && category !== 'all') {
        query.andWhere('template.category = :category', { category });
      }

      if (editingMode && editingMode !== 'all') {
        query.andWhere('template.editingMode = :editingMode', { editingMode });
      }

      const templates = await query.getMany();
      console.log(`[Templates] 템플릿 ${templates.length}개 조회 성공`);
      
      return templates;
    } catch (error) {
      console.error('[Templates] 템플릿 조회 실패:', {
        error: error.message,
        stack: error.stack,
        category,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // 페이지를 템플릿으로 저장
  async createTemplateFromPage(
    pageId: string,
    name: string,
    category: string,
    authorId: number,
    editingMode: 'desktop' | 'mobile' = 'desktop',
    tags?: string[],
    thumbnail_url?: string,
  ) {
    // 소스 페이지 조회
    const sourcePage = await this.pagesRepository.findOne({
      where: { id: pageId },
    });

    if (!sourcePage) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }

    // console.log('원본 페이지 데이터:', {
    //   id: sourcePage.id,
    //   title: sourcePage.title,
    //   contentType: typeof sourcePage.content,
    //   contentLength: Array.isArray(sourcePage.content) ? sourcePage.content.length : 'not array',
    //   content: sourcePage.content
    // });

    // 작성자 조회
    const author = await this.usersRepository.findOne({
      where: { id: authorId },
    });

    if (!author) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 페이지의 컴포넌트 데이터를 가져와서 템플릿으로 저장
    // content 구조를 일관되게 {components: [], canvasSettings: {}} 형태로 저장
    let templateContent;
    if (typeof sourcePage.content === 'object' && !Array.isArray(sourcePage.content)) {
      // 이미 새로운 구조인 경우
      templateContent = sourcePage.content;
    } else {
      // 기존 배열 구조인 경우 새로운 구조로 변환
      templateContent = {
        components: Array.isArray(sourcePage.content) ? sourcePage.content : [],
        canvasSettings: { canvasHeight: 1080 }
      };
    }

    const template = this.templatesRepository.create({
      name,
      category,
      thumbnail_url,
      content: templateContent,
      tags: tags || [],
      editingMode,
      author,
      authorId,
    });

    return this.templatesRepository.save(template);
  }

  // 컴포넌트 배열로 템플릿 생성
  async createTemplateFromComponents(
    components: any[],
    name: string,
    category: string,
    authorId: number,
    editingMode: 'desktop' | 'mobile' = 'desktop',
    tags?: string[],
    thumbnail_url?: string,
    canvasSettings?: any,
  ) {
    try {
      console.log(`[Templates] 컴포넌트로 템플릿 생성 시작 - authorId: ${authorId}, name: ${name}, category: ${category}`);

      // 작성자 조회
      const author = await this.usersRepository.findOne({
        where: { id: authorId },
      });

      if (!author) {
        console.error('[Templates] 사용자를 찾을 수 없습니다:', {
          authorId,
          timestamp: new Date().toISOString()
        });
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      console.log(`[Templates] 사용자 조회 성공 - userId: ${author.id}, email: ${author.email}`);

      // 컴포넌트 배열로 템플릿 생성
      const template = this.templatesRepository.create({
        name,
        category,
        thumbnail_url,
        content: {
          components: components || [],
          canvasSettings: canvasSettings || { canvasHeight: 1080 }
        },
        tags: tags || [],
        editingMode,
        author,
        authorId,
      });

      console.log(`[Templates] 템플릿 엔티티 생성 완료 - 컴포넌트 수: ${components?.length || 0}`);

      const savedTemplate = await this.templatesRepository.save(template);
      console.log(`[Templates] 템플릿 저장 성공 - templateId: ${savedTemplate.id}`);
      
      return savedTemplate;
    } catch (error) {
      console.error('[Templates] 템플릿 생성 실패:', {
        error: error.message,
        stack: error.stack,
        authorId,
        name,
        category,
        componentsCount: components?.length || 0,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // 템플릿으로 새 페이지 생성
  async createPageFromTemplate(
    templateId: string,
    userId: number,
    title?: string,
    subdomain?: string,
  ) {
    // 템플릿 조회
    const template = await this.templatesRepository.findOne({
      where: { id: templateId, isPublic: true },
    });

    if (!template) {
      throw new NotFoundException('템플릿을 찾을 수 없습니다.');
    }

    // 사용자 조회
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 컴포넌트 ID 재발급 및 캔버스 설정 복원
    let newContent;
    if (typeof template.content === 'object' && !Array.isArray(template.content)) {
      newContent = {
        components: this.regenerateComponentIds(template.content.components || []),
        canvasSettings: template.content.canvasSettings || { canvasHeight: 1080 }
      };
    } else {
      newContent = {
        components: this.regenerateComponentIds(Array.isArray(template.content) ? template.content : []),
        canvasSettings: { canvasHeight: 1080 }
      };
    }

    // 새 페이지 생성
    const newPage = this.pagesRepository.create({
      title: title || template.name,
      subdomain: subdomain || this.generateRandomSubdomain(),
      content: newContent,
      owner: user,
      userId,
      status: PageStatus.DRAFT,
    });

    const savedPage = await this.pagesRepository.save(newPage);

    // 템플릿 사용 횟수 증가
    await this.templatesRepository.increment(
      { id: templateId },
      'usageCount',
      1,
    );

    return savedPage;
  }

  // 컴포넌트 ID 재발급
  private regenerateComponentIds(components: any[]): any[] {
    if (!Array.isArray(components)) return [];

    return components.map((comp) => ({
      ...comp,
      id: this.generateRandomId(),
    }));
  }

  // 랜덤 ID 생성
  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  // 랜덤 서브도메인 생성
  private generateRandomSubdomain(): string {
    return 'tmpl-' + Math.random().toString(36).substring(2, 10);
  }


}
