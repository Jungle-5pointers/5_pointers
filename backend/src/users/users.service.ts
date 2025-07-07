import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users, AuthProvider } from './entities/users.entity';
import { Pages, PageStatus } from './entities/pages.entity';
import { Submissions } from './entities/submissions.entity';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(Pages)
    private pagesRepository: Repository<Pages>,
    @InjectRepository(Submissions)
    private submissionsRepository: Repository<Submissions>,
  ) {}

  async findByEmail(email: string): Promise<Users | undefined> {
    return this.usersRepository.findOne({ where: { email }, select: ['id', 'email', 'nickname', 'provider', 'provider_id', 'password', 'role'] });
  }

  async findBySocial(provider: AuthProvider, providerId: string): Promise<Users | undefined> {
    return this.usersRepository.findOne({ where: { provider, provider_id: providerId } });
  }

  async createLocalUser(email: string, password: string): Promise<Users> {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, password: hashed, provider: AuthProvider.LOCAL, role: 'USER' });
    return this.usersRepository.save(user);
  }

  async createSocialUser(provider: AuthProvider, providerId: string, email?: string): Promise<Users> {
    const user = this.usersRepository.create({ provider, provider_id: providerId, email, role: 'USER' });
    return this.usersRepository.save(user);
  }

  // 내 페이지 목록 조회
  async getMyPages(userId: number): Promise<Pages[]> {
    // 소유한 페이지들 가져오기
    const ownedPages = await this.pagesRepository.find({ 
      where: { owner: { id: userId } },
      order: { updatedAt: 'DESC' }
    });

    // 초대받은 페이지들 가져오기
    const pageMembersRepository = this.pagesRepository.manager.getRepository('PageMembers');
    const memberPages = await pageMembersRepository.find({
      where: { 
        user: { id: userId },
        status: 'ACCEPTED'
      },
      relations: ['page'],
      order: { createdAt: 'DESC' }
    });

    // 초대받은 페이지들의 정보 가져오기
    const invitedPages = await Promise.all(
      memberPages.map(async (member) => {
        const page = await this.pagesRepository.findOne({
          where: { id: member.page.id }
        });
        return page;
      })
    );

    // 소유한 페이지와 초대받은 페이지 합치기
    const allPages = [...ownedPages, ...invitedPages];
    
    // 최신 업데이트 순으로 정렬
    return allPages.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  // 페이지 단일 조회
  async getPage(userId: number, pageId: string): Promise<Pages> {
    // 먼저 페이지 소유자인지 확인
    let page = await this.pagesRepository.findOne({
      where: { id: pageId, owner: { id: userId } }
    });
    
    // 페이지 소유자가 아니면 멤버 권한 확인
    if (!page) {
      console.log(`페이지 소유자가 아님, 멤버 권한 확인 중...`);
      
      // PageMembers 테이블에서 권한 확인
      const pageMembersRepository = this.pagesRepository.manager.getRepository('PageMembers');
      const member = await pageMembersRepository.findOne({
        where: { 
          page: { id: pageId },
          user: { id: userId },
          status: 'ACCEPTED'
        }
      });
      
      if (!member) {
        console.error(`페이지 접근 권한 없음: 페이지 ${pageId}, 사용자 ${userId}`);
        throw new Error('Page not found');
      }
      
      // 멤버인 경우 페이지 정보 가져오기
      page = await this.pagesRepository.findOne({
        where: { id: pageId }
      });
      
      if (!page) {
        console.error(`페이지를 찾을 수 없음: ${pageId}`);
        throw new Error('Page not found');
      }
    }
    
    return page;
  }

  // 페이지 제목 수정
  async updatePageTitle(userId: number, pageId: string, title: string): Promise<Pages> {
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, owner: { id: userId } }
    });
    
    if (!page) {
      throw new Error('Page not found');
    }
    
    page.title = title;
    return this.pagesRepository.save(page);
  }

  // 페이지 컨텐츠 업데이트 (자동저장용)
  async updatePageContent(userId: number, pageId: string, content: any[]): Promise<Pages> {
    console.log(`DB 업데이트 시도: 페이지 ${pageId}, 사용자 ${userId}, 컴포넌트 ${content.length}개`);
    
    // 먼저 페이지 소유자인지 확인
    let page = await this.pagesRepository.findOne({
      where: { id: pageId, owner: { id: userId } }
    });
    
    // 페이지 소유자가 아니면 멤버 권한 확인
    if (!page) {
      console.log(`페이지 소유자가 아님, 멤버 권한 확인 중...`);
      
      // PageMembers 테이블에서 권한 확인
      const pageMembersRepository = this.pagesRepository.manager.getRepository('PageMembers');
      const member = await pageMembersRepository.findOne({
        where: { 
          page: { id: pageId },
          user: { id: userId },
          status: 'ACCEPTED'
        }
      });
      
      if (!member) {
        console.error(`페이지 접근 권한 없음: 페이지 ${pageId}, 사용자 ${userId}`);
        throw new Error('Page not found');
      }
      
      // 멤버인 경우 페이지 정보 가져오기
      page = await this.pagesRepository.findOne({
        where: { id: pageId }
      });
      
      if (!page) {
        console.error(`페이지를 찾을 수 없음: ${pageId}`);
        throw new Error('Page not found');
      }
    }
    
    console.log(`기존 컨텐츠: ${page.content?.length || 0}개 컴포넌트`);
    page.content = content;
    const savedPage = await this.pagesRepository.save(page);
    console.log(`DB 저장 완료: ${savedPage.content?.length || 0}개 컴포넌트`);
    
    return savedPage;
  }

  // 페이지 삭제
  async deletePage(userId: number, pageId: string): Promise<{ message: string }> {
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, owner: { id: userId } }
    });
    
    if (!page) {
      throw new Error('Page not found');
    }
    
    await this.pagesRepository.remove(page);
    return { message: 'Page deleted successfully' };
  }

  // 페이지 생성 리팩토링
  async createPage(userId: number, body: { subdomain?: string; title?: string; templateId?: string }): Promise<Pages> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    
    let content = null;
    
    // templateId가 있으면 템플릿에서 content 가져오기
    if (body.templateId) {
      const templatesRepository = this.pagesRepository.manager.getRepository('Templates');
      const template = await templatesRepository.findOne({ where: { id: body.templateId } });
      if (template && template.content) {
        // 컴포넌트 ID 재발급
        content = this.regenerateComponentIds(template.content);
      }
    }
    
    const page = this.pagesRepository.create({
      owner: user,
      userId: userId,
      subdomain: body.subdomain || `page-${Date.now()}`,
      title: body.title || 'Untitled',
      content: content,
      status: PageStatus.DRAFT
    });
    
    return this.pagesRepository.save(page);
  }

  // 컴포넌트 ID 재발급 함수
  private regenerateComponentIds(components: any[]): any[] {
    return components.map(comp => ({
      ...comp,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 8)}`
    }));
  }

  async deployPage(pageId: string, components: any[], domain: string): Promise<any> {
    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) throw new Error('Page not found');
    
    // HTML 생성
    const html = this.generateHTML(components);
    
    // 파일 시스템에 HTML 저장
    const deployDir = path.join(process.cwd(), 'deployed-sites', domain);
    
    if (!fs.existsSync(deployDir)) {
      fs.mkdirSync(deployDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(deployDir, 'index.html'), html);
    
    // submissions 테이블에 배포 데이터 저장
    const submissionsRepository = this.pagesRepository.manager.getRepository('Submissions');
    const submission = submissionsRepository.create({
      page: page,
      pageId: pageId,
      component_id: 'deploy_' + Date.now(),
      data: { html, components, deployedAt: new Date(), domain }
    });
    
    return submissionsRepository.save(submission);
  }

  async getDeployedSite(identifier: string): Promise<any> {
    const submissionsRepository = this.pagesRepository.manager.getRepository('Submissions');
    
    // 먼저 도메인으로 검색
    let submission = await submissionsRepository.findOne({ 
      where: { data: { domain: identifier } },
      order: { createdAt: 'DESC' }
    });
    
    // 도메인으로 찾지 못하면 pageId로 검색
    if (!submission) {
      submission = await submissionsRepository.findOne({ 
        where: { pageId: identifier },
        order: { createdAt: 'DESC' }
      });
    }
    
    if (!submission) {
      throw new Error('Deployed site not found');
    }
    
    return {
      pageId: submission.pageId,
      components: submission.data.components || [],
      deployedAt: submission.data.deployedAt,
      domain: submission.data.domain
    };
  }

  generateHTML(components: any[]): string {
    const componentHTML = components.map(comp => {
      const style = `position: absolute; left: ${comp.x}px; top: ${comp.y}px; color: ${comp.props.color}; font-size: ${comp.props.fontSize}px;`;
      
      switch (comp.type) {
        case 'button':
          return `<button style="${style} background: ${comp.props.bg}; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">${comp.props.text}</button>`;
        case 'text':
          return `<div style="${style}">${comp.props.text}</div>`;
        case 'link':
          return `<a href="${comp.props.url}" style="${style} text-decoration: underline;">${comp.props.text}</a>`;
        case 'attend':
          return `<button style="${style} background: ${comp.props.bg}; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">${comp.props.text}</button>`;
        case 'comment':
          return this.generateCommentHTML(comp);
        case 'slido':
          return this.generateSlidoHTML(comp);
        default:
          return `<div style="${style}">${comp.props.text}</div>`;
      }
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Deployed Site</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Inter, sans-serif; position: relative; min-height: 100vh; }
        </style>
      </head>
      <body>
        ${componentHTML}
      </body>
      </html>
    `;
  }

  // 댓글 조회
  async getComments(pageId: string, componentId: string): Promise<any[]> {
    const comments = await this.submissionsRepository.find({
      where: { 
        pageId: pageId,
        component_id: componentId
      },
      order: { createdAt: 'DESC' }
    });

    return comments.map(comment => ({
      id: comment.id,
      author: comment.data.author,
      content: comment.data.content,
      createdAt: comment.createdAt
    }));
  }

  // 댓글 작성
  async createComment(pageId: string, componentId: string, commentData: { author: string; content: string; password: string }): Promise<any> {
    const hashedPassword = await bcrypt.hash(commentData.password, 10);
    
    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) throw new Error('Page not found');

    const submission = this.submissionsRepository.create({
      page: page,
      pageId: pageId,
      component_id: componentId,
      data: {
        author: commentData.author,
        content: commentData.content,
        password: hashedPassword
      }
    });

    const saved = await this.submissionsRepository.save(submission);
    return {
      id: saved.id,
      author: saved.data.author,
      content: saved.data.content,
      createdAt: saved.createdAt
    };
  }

  // 댓글 삭제
  async deleteComment(pageId: string, componentId: string, commentId: string, password: string): Promise<any> {
    const comment = await this.submissionsRepository.findOne({
      where: {
        id: parseInt(commentId),
        pageId: pageId,
        component_id: componentId
      }
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    const isPasswordValid = await bcrypt.compare(password, comment.data.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    await this.submissionsRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

  // Slido 의견 조회
  async getSlido(pageId: string, componentId: string): Promise<any[]> {
    const opinions = await this.submissionsRepository.find({
      where: { 
        pageId: pageId,
        component_id: componentId
      },
      order: { createdAt: 'DESC' }
    });

    return opinions.map(opinion => ({
      id: opinion.id,
      content: opinion.data.content,
      createdAt: opinion.createdAt
    }));
  }

  // Slido 의견 작성
  async createSlido(pageId: string, componentId: string, slidoData: { content: string }): Promise<any> {
    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) throw new Error('Page not found');

    const submission = this.submissionsRepository.create({
      page: page,
      pageId: pageId,
      component_id: componentId,
      data: {
        content: slidoData.content
      }
    });

    const saved = await this.submissionsRepository.save(submission);
    return {
      id: saved.id,
      content: saved.data.content,
      createdAt: saved.createdAt
    };
  }

  // 페이지 콘텐츠 조회 (roomId 기반)
  async getPageContentByRoom(roomId: string): Promise<any> {
    const page = await this.pagesRepository.findOne({ where: { id: roomId } });
    if (!page) {
      throw new Error('Page not found');
    }
    return { content: page.content || [] };
  }

  // 페이지 콘텐츠 저장 (roomId 기반)
  async savePageContentByRoom(roomId: string, content: any): Promise<any> {
    const page = await this.pagesRepository.findOne({ where: { id: roomId } });
    if (!page) {
      throw new Error('Page not found');
    }
    
    page.content = content;
    await this.pagesRepository.save(page);
    
    return { message: 'Content saved successfully', content };
  }

  generateCommentHTML(comp: any): string {
    const style = `position: absolute; left: ${comp.x}px; top: ${comp.y}px;`;
    const title = comp.props.title || '축하 메세지를 남겨주세요';
    const placeholder = comp.props.placeholder || '댓글을 남겨주세요';
    
    return `
      <div id="comment-${comp.id}" style="${style} width: 400px; padding: 24px; background: ${comp.props.backgroundColor || '#ffffff'}; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1f2937;">${title}</h3>
        
        <form id="comment-form-${comp.id}" style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <input type="text" placeholder="이름" required style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
            <input type="password" placeholder="비밀번호" required style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
          </div>
          <textarea placeholder="${placeholder}" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: none; box-sizing: border-box;" rows="3"></textarea>
          <button type="submit" style="margin-top: 12px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">댓글 작성</button>
        </form>
        
        <div id="comments-list-${comp.id}" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="text-align: center; color: #6b7280; padding: 32px;">첫 번째 댓글을 남겨보세요!</div>
        </div>
      </div>
      
      <script>
        (function() {
          const form = document.getElementById('comment-form-${comp.id}');
          const commentsList = document.getElementById('comments-list-${comp.id}');
          
          // 댓글 로드
          function loadComments() {
            fetch('http://localhost:3000/users/pages/${comp.pageId}/comments/${comp.id}')
              .then(res => res.json())
              .then(comments => {
                if (comments.length === 0) {
                  commentsList.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 32px;">첫 번째 댓글을 남겨보세요!</div>';
                } else {
                  commentsList.innerHTML = comments.map(comment => 
                    \`<div style="position: relative; padding: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;">
                      <button onclick="deleteComment('${comp.id}', '\${comment.id}')" style="position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 16px;">×</button>
                      <div style="padding-right: 32px;">
                        <div style="font-weight: 500; color: #1f2937; margin-bottom: 4px;">\${comment.author}</div>
                        <div style="color: #4b5563; font-size: 14px; line-height: 1.5;">\${comment.content}</div>
                        <div style="color: #9ca3af; font-size: 12px; margin-top: 8px;">\${new Date(comment.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>\`
                  ).join('');
                }
              })
              .catch(err => console.error('댓글 로드 실패:', err));
          }
          
          // 댓글 삭제
          window.deleteComment = function(componentId, commentId) {
            const password = prompt('비밀번호를 입력하세요:');
            if (!password) return;
            
            fetch(\`http://localhost:3000/users/pages/${comp.pageId}/comments/\${componentId}/\${commentId}\`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password })
            })
            .then(res => {
              if (res.ok) {
                loadComments();
              } else {
                alert('비밀번호가 일치하지 않습니다.');
              }
            })
            .catch(err => {
              console.error('댓글 삭제 실패:', err);
              alert('댓글 삭제에 실패했습니다.');
            });
          };
          
          // 댓글 작성
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            const inputs = form.querySelectorAll('input, textarea');
            const author = inputs[0].value;
            const password = inputs[1].value;
            const content = inputs[2].value;
            
            if (!author || !password || !content) {
              alert('모든 필드를 입력해주세요.');
              return;
            }
            
            fetch('http://localhost:3000/users/pages/${comp.pageId}/comments/${comp.id}', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ author, content, password })
            })
            .then(res => {
              if (res.ok) {
                form.reset();
                loadComments();
              } else {
                alert('댓글 작성에 실패했습니다.');
              }
            })
            .catch(err => {
              console.error('댓글 작성 실패:', err);
              alert('댓글 작성에 실패했습니다.');
            });
          });
          
          // 초기 로드
          loadComments();
        })();
      </script>
    `;
  }

  /**
   * Page 컴포넌트에서 새 페이지 생성
   */
  async createPageFromComponent(createDto: {
    parentPageId: string;
    componentId: string;
    pageName?: string;
  }) {
    console.log('📄 새 페이지 생성 시작:', createDto);
    
    try {
      // 1. 새 페이지 생성
      const newPage = this.pagesRepository.create({
        title: createDto.pageName || "새 페이지",
        subdomain: 'page-' + Date.now(),
        content: {
          components: [],
          pageConnections: [],
          metadata: {
            totalComponents: 0,
            pageComponentCount: 0,
            lastModified: new Date().toISOString(),
            version: '1.0'
          }
        },
        status: PageStatus.DRAFT,
        userId: 1 // 기본 사용자 ID
      });
      
      const savedPage = await this.pagesRepository.save(newPage);
      console.log('✅ 새 페이지 생성 완료:', savedPage.id, savedPage.title);
      
      // 2. 부모 페이지의 연결 정보 업데이트
      await this.addPageConnection(createDto.parentPageId, {
        componentId: createDto.componentId,
        linkedPageId: savedPage.id,
        linkType: 'internal'
      });
      
      return { 
        success: true, 
        page: {
          id: savedPage.id,
          title: savedPage.title,
          subdomain: savedPage.subdomain,
          status: savedPage.status
        }
      };
      
    } catch (error) {
      console.error('❌ 페이지 생성 실패:', error);
      throw new Error('페이지 생성 실패: ' + error.message);
    }
  }

  /**
   * 부모 페이지에 연결 정보 추가
   */
  async addPageConnection(pageId: string, connectionData: any) {
    try {
      const page = await this.pagesRepository.findOne({ where: { id: pageId } });
      if (!page) {
        throw new Error('부모 페이지를 찾을 수 없습니다.');
      }
      
      const content = page.content || { components: [], pageConnections: [], metadata: {} };
      
      // pageConnections 배열에 새 연결 추가
      const newConnection = {
        id: 'conn-' + Date.now(),
        componentId: connectionData.componentId,
        linkedPageId: connectionData.linkedPageId,
        linkType: connectionData.linkType,
        order: content.pageConnections?.length || 0,
        createdAt: new Date().toISOString()
      };

      content.pageConnections = content.pageConnections || [];
      content.pageConnections.push(newConnection);
      
      // metadata 업데이트
      content.metadata = {
        ...content.metadata,
        pageComponentCount: content.pageConnections.length,
        lastModified: new Date().toISOString()
      };

      // 부모 페이지 업데이트
      await this.pagesRepository.update(pageId, { content });
      console.log('✅ 부모 페이지 연결 정보 업데이트 완료');
      
    } catch (error) {
      console.error('❌ 페이지 연결 정보 업데이트 실패:', error);
      throw error;
    }
  }
}

  generateSlidoHTML(comp: any): string {
    const style = `position: absolute; left: ${comp.x}px; top: ${comp.y}px;`;
    const question = comp.props.question || '여러분의 의견을 들려주세요';
    const placeholder = comp.props.placeholder || '의견을 입력하세요...';
    const backgroundColor = comp.props.backgroundColor || '#ffffff';
    
    return `
      <div id="slido-${comp.id}" style="${style} width: 400px; min-height: 300px; padding: 24px; background: ${backgroundColor}; border: 1px solid #e5e7eb; border-radius: 12px; font-family: Inter, sans-serif;">
        <!-- 제목 -->
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1f2937; text-align: center;">
          ${question}
        </div>
        
        <!-- LIVE 표시기 -->
        <div style="position: absolute; top: 12px; right: 12px; display: flex; align-items: center; gap: 6px; font-size: 10px; color: #6c757d;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #28a745; animation: pulse 2s infinite;"></div>
          LIVE
        </div>
        
        <!-- 의견 입력 폼 -->
        <form id="slido-form-${comp.id}" style="margin-bottom: 20px; display: flex; gap: 8px;">
          <input 
            type="text" 
            id="slido-input-${comp.id}"
            placeholder="${placeholder}" 
            required 
            style="flex: 1; padding: 12px 16px; border: 2px solid #e9ecef; border-radius: 25px; font-size: 14px; outline: none; transition: border-color 0.2s;"
            onfocus="this.style.borderColor='#007bff'"
            onblur="this.style.borderColor='#e9ecef'"
          />
          <button 
            type="submit" 
            style="padding: 12px 20px; border-radius: 25px; border: none; background-color: #007bff; color: #ffffff; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; min-width: 60px;"
            onmouseover="this.style.backgroundColor='#0056b3'"
            onmouseout="this.style.backgroundColor='#007bff'"
          >
            제출
          </button>
        </form>
        
        <!-- 의견 목록 -->
        <div id="slido-opinions-${comp.id}" style="max-height: 300px; overflow-y: auto;">
          <div style="text-align: center; color: #6b7280; padding: 40px 20px; font-size: 14px;">
            <div style="font-size: 32px; margin-bottom: 12px;">💭</div>
            <div>첫 번째 의견을 남겨보세요!</div>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .opinion-item {
          padding: 12px 16px;
          margin: 8px 0;
          background-color: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          font-size: 14px;
          line-height: 1.4;
          color: #495057;
          word-break: break-word;
          animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      </style>
      
      <script>
        (function() {
          const form = document.getElementById('slido-form-${comp.id}');
          const input = document.getElementById('slido-input-${comp.id}');
          const opinionsList = document.getElementById('slido-opinions-${comp.id}');
          let isSubmitting = false;
          
          // 의견 목록 로드
          function loadOpinions() {
            fetch('http://localhost:3000/users/pages/${comp.pageId}/slido/${comp.id}')
              .then(res => res.json())
              .then(opinions => {
                if (opinions.length === 0) {
                  opinionsList.innerHTML = \`
                    <div style="text-align: center; color: #6b7280; padding: 40px 20px; font-size: 14px;">
                      <div style="font-size: 32px; margin-bottom: 12px;">💭</div>
                      <div>첫 번째 의견을 남겨보세요!</div>
                    </div>
                  \`;
                } else {
                  opinionsList.innerHTML = opinions.map(opinion => \`
                    <div class="opinion-item">
                      \${opinion.content}
                      <div style="font-size: 11px; color: #9ca3af; margin-top: 6px; text-align: right;">
                        \${new Date(opinion.createdAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  \`).join('');
                }
              })
              .catch(err => console.error('의견 로드 실패:', err));
          }
          
          // 의견 제출
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (isSubmitting || !input.value.trim()) return;
            
            isSubmitting = true;
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = '...';
            submitButton.disabled = true;
            
            fetch('http://localhost:3000/users/pages/${comp.pageId}/slido/${comp.id}', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: input.value.trim() })
            })
            .then(res => {
              if (res.ok) {
                input.value = '';
                loadOpinions();
              } else {
                alert('의견 제출에 실패했습니다.');
              }
            })
            .catch(err => {
              console.error('의견 제출 실패:', err);
              alert('의견 제출에 실패했습니다.');
            })
            .finally(() => {
              isSubmitting = false;
              submitButton.textContent = '제출';
              submitButton.disabled = false;
            });
          });
          
          // 실시간 업데이트 (3초마다)
          setInterval(loadOpinions, 3000);
          
          // 초기 로드
          loadOpinions();
        })();
      </script>
    `;
  }
}
