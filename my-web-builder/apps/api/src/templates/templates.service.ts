import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Templates } from '../users/entities/templates.entity';
import { Pages } from '../users/entities/pages.entity';
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
  async getPublicTemplates(category?: string) {
    const query = this.templatesRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.author', 'author')
      .where('template.isPublic = :isPublic', { isPublic: true })
      .orderBy('template.createdAt', 'DESC');

    if (category) {
      query.andWhere('template.category = :category', { category });
    }

    return query.getMany();
  }

  // 페이지를 템플릿으로 저장
  async createTemplateFromPage(
    pageId: string,
    name: string,
    category: string,
    authorId: number,
    tags?: string[],
    thumbnail_url?: string
  ) {
    // 소스 페이지 조회
    const sourcePage = await this.pagesRepository.findOne({
      where: { id: pageId }
    });

    if (!sourcePage) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }
    
    console.log('원본 페이지 데이터:', {
      id: sourcePage.id,
      title: sourcePage.title,
      contentType: typeof sourcePage.content,
      contentLength: Array.isArray(sourcePage.content) ? sourcePage.content.length : 'not array',
      content: sourcePage.content
    });

    // 작성자 조회
    const author = await this.usersRepository.findOne({
      where: { id: authorId }
    });

    if (!author) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 페이지의 컴포넌트 데이터를 가져와서 템플릿으로 저장
    const template = this.templatesRepository.create({
      name,
      category,
      thumbnail_url,
      content: sourcePage.content || [], // 페이지의 컴포넌트 배열
      tags: tags || [],
      author,
      authorId
    });

    return this.templatesRepository.save(template);
  }

  // 컴포넌트 배열로 템플릿 생성
  async createTemplateFromComponents(
    components: any[],
    name: string,
    category: string,
    authorId: number,
    tags?: string[],
    thumbnail_url?: string
  ) {
    // 작성자 조회
    const author = await this.usersRepository.findOne({
      where: { id: authorId }
    });

    if (!author) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    console.log('템플릿 생성 - 컴포넌트 개수:', components.length);
    console.log('컴포넌트 데이터:', components);

    // 컴포넌트 배열로 템플릿 생성
    const template = this.templatesRepository.create({
      name,
      category,
      thumbnail_url,
      content: components || [], // 에디터에서 전달받은 컴포넌트 배열
      tags: tags || [],
      author,
      authorId
    });

    return this.templatesRepository.save(template);
  }

  // 템플릿으로 새 페이지 생성
  async createPageFromTemplate(
    templateId: string,
    userId: number,
    title?: string,
    subdomain?: string
  ) {
    // 템플릿 조회
    const template = await this.templatesRepository.findOne({
      where: { id: templateId, isPublic: true }
    });

    if (!template) {
      throw new NotFoundException('템플릿을 찾을 수 없습니다.');
    }

    // 사용자 조회
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 컴포넌트 ID 재발급
    const newContent = this.regenerateComponentIds(template.content);

    // 새 페이지 생성
    const newPage = this.pagesRepository.create({
      title: title || template.name,
      subdomain: subdomain || this.generateRandomSubdomain(),
      content: newContent,
      owner: user,
      userId,
      status: 'DRAFT'
    });

    const savedPage = await this.pagesRepository.save(newPage);

    // 템플릿 사용 횟수 증가
    await this.templatesRepository.increment(
      { id: templateId },
      'usageCount',
      1
    );

    return savedPage;
  }

  // 컴포넌트 ID 재발급
  private regenerateComponentIds(components: any[]): any[] {
    if (!Array.isArray(components)) return [];

    return components.map(comp => ({
      ...comp,
      id: this.generateRandomId()
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