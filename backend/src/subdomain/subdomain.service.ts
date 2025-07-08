import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pages } from '../users/entities/pages.entity';
import { Users } from '../users/entities/users.entity';

@Injectable()
export class SubdomainService {
  constructor(
    @InjectRepository(Pages)
    private pagesRepository: Repository<Pages>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async getPageBySubdomain(subdomain: string): Promise<any> {
    try {
      // 서브도메인으로 페이지 직접 찾기
      const page = await this.pagesRepository.findOne({
        where: { subdomain: subdomain },
        relations: ['owner']
      });

      if (!page) {
        return null;
      }

      return {
        user: page.owner,
        page,
        subdomain
      };
    } catch (error) {
      console.error('Error fetching page by subdomain:', error);
      throw error;
    }
  }

  async getPageBySubdomainAndId(subdomain: string, pageId: string): Promise<any> {
    try {
      // 서브도메인으로 사용자 찾기 후 특정 페이지 조회
      const page = await this.pagesRepository.findOne({
        where: { 
          id: pageId,
          subdomain: subdomain
        },
        relations: ['owner']
      });

      if (!page) {
        return null;
      }

      return {
        user: page.owner,
        page,
        subdomain,
        pageId
      };
    } catch (error) {
      console.error('Error fetching page by subdomain and ID:', error);
      throw error;
    }
  }

  async generatePageHtml(pageData: any): Promise<string> {
    const { user, page, subdomain } = pageData;
    
    // 페이지 데이터를 HTML로 변환
    const pageContent = page.content ? (typeof page.content === 'string' ? JSON.parse(page.content) : page.content) : {};
    
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title || `${user.nickname}'s Page`}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .title {
            font-size: 2.5em;
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 1.1em;
        }
        .content {
            line-height: 1.6;
            color: #444;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #888;
            font-size: 0.9em;
        }
        .component {
            margin: 20px 0;
            padding: 15px;
            border-left: 4px solid #007bff;
            background-color: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">${page.title || `Welcome to ${user.nickname}'s Page`}</h1>
            <p class="subtitle">Created by ${user.nickname}</p>
        </div>
        
        <div class="content">
            ${this.renderPageContent(pageContent)}
        </div>
        
        <div class="footer">
            <p>Powered by PageCube • ${subdomain}.pagecube.net</p>
            <p>Last updated: ${new Date(page.updatedAt).toLocaleDateString()}</p>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  private renderPageContent(content: any): string {
    if (!content || !content.components) {
      return '<p>This page is under construction.</p>';
    }

    let html = '';
    
    for (const component of content.components) {
      switch (component.type) {
        case 'text':
          html += `<div class="component">
            <p>${component.content || component.text || ''}</p>
          </div>`;
          break;
        case 'heading':
          const level = component.level || 2;
          html += `<h${level}>${component.content || component.text || ''}</h${level}>`;
          break;
        case 'image':
          if (component.src) {
            html += `<div class="component">
              <img src="${component.src}" alt="${component.alt || ''}" style="max-width: 100%; height: auto;">
            </div>`;
          }
          break;
        case 'link':
          html += `<div class="component">
            <a href="${component.href || '#'}" target="_blank">${component.text || component.content || 'Link'}</a>
          </div>`;
          break;
        default:
          html += `<div class="component">
            <p>${JSON.stringify(component)}</p>
          </div>`;
      }
    }

    return html || '<p>No content available.</p>';
  }
}
