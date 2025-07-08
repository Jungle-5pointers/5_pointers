const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 백엔드 API URL 설정 (AWS Elastic Beanstalk 엔드포인트)
const API_BASE_URL = process.env.API_BASE_URL || 'https://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/api';

// 배포된 사이트들이 저장될 디렉토리
const deployedSitesPath = path.join(__dirname, 'deployed-sites');

// 디렉토리가 없으면 생성
if (!fs.existsSync(deployedSitesPath)) {
  fs.mkdirSync(deployedSitesPath, { recursive: true });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'PageCube Subdomain Server',
    version: '1.0.0',
    port: PORT,
    api_base_url: API_BASE_URL
  });
});

// 서브도메인 처리 미들웨어
app.use(async (req, res, next) => {
  const host = req.get('host');
  const subdomain = host.split('.')[0];
  
  // localhost:3001 직접 접근시 기본 페이지
  if (host === `localhost:${PORT}` || subdomain === 'localhost') {
    return res.send(`
      <h1>Wildcard Subdomain Server</h1>
      <p>서브도메인으로 접근하세요: http://[subdomain].localhost:${PORT}</p>
    `);
  }
  
  try {
    // 백엔드 API를 통해 서브도메인 데이터 가져오기
    const response = await axios.get(`${API_BASE_URL}/generator/subdomain/${subdomain}`);
    
    if (response.data && response.data.components) {
      const html = generateHTMLFromComponents(response.data.components);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.status(404).send(`
        <h1>404 - Site Not Found</h1>
        <p>서브도메인 "${subdomain}"에 배포된 사이트가 없습니다.</p>
      `);
    }
  } catch (error) {
    console.error('API error:', error);
    if (error.response && error.response.status === 404) {
      res.status(404).send(`
        <h1>404 - Site Not Found</h1>
        <p>서브도메인 "${subdomain}"에 배포된 사이트가 없습니다.</p>
      `);
    } else {
      res.status(500).send('<h1>500 - Server Error</h1>');
    }
  }
});

// 컴포넌트에서 HTML 생성 함수
function generateHTMLFromComponents(components) {
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
      case 'image':
        return `<img src="${comp.props.src}" style="${style} width: ${comp.props.width}px; height: ${comp.props.height}px;" alt="${comp.props.alt || ''}" />`;
      default:
        return `<div style="${style}">${comp.props.text || ''}</div>`;
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

app.listen(PORT, () => {
  console.log(`🌐 Wildcard subdomain server running on http://localhost:${PORT}`);
  console.log(`📁 Deployed sites directory: ${deployedSitesPath}`);
});