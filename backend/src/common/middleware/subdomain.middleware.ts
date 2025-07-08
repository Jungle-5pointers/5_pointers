import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.get('host') || '';
    console.log('=== Subdomain Middleware ===');
    console.log('Host:', host);
    console.log('Original URL:', req.originalUrl);
    
    // 포트 제거 후 서브도메인 추출
    const hostnameWithoutPort = host.split(':')[0];
    const parts = hostnameWithoutPort.split('.');
    
    // 서브도메인 감지
    let subdomain = '';
    if (parts.length >= 3) {
      // example.com의 경우: ['subdomain', 'example', 'com']
      subdomain = parts[0];
    } else if (parts.length === 2 && parts[1] === 'localhost') {
      // localhost의 경우: ['subdomain', 'localhost']
      subdomain = parts[0];
    }
    
    // 요청 객체에 서브도메인 정보 추가
    (req as any).subdomain = subdomain;
    
    console.log('Detected subdomain:', subdomain);
    console.log('========================');
    
    next();
  }
}
