const express = require('express');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

// MySQL 연결 설정
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'jungle'
};

// 배포된 사이트들이 저장될 디렉토리
const deployedSitesPath = path.join(__dirname, 'deployed-sites');

// 디렉토리가 없으면 생성
if (!fs.existsSync(deployedSitesPath)) {
  fs.mkdirSync(deployedSitesPath, { recursive: true });
}

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
    // submissions 테이블에서 도메인으로 데이터 검색
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT data FROM submissions WHERE JSON_EXTRACT(data, "$.domain") = ? ORDER BY created_at DESC LIMIT 1',
      [subdomain]
    );
    await connection.end();
    
    if (rows.length > 0) {
      const data = rows[0].data;
      const html = data.html || generateHTMLFromComponents(data.components || []);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.status(404).send(`
        <h1>404 - Site Not Found</h1>
        <p>서브도메인 "${subdomain}"에 배포된 사이트가 없습니다.</p>
      `);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('<h1>500 - Server Error</h1>');
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

app.listen(PORT, () => {
  console.log(`🌐 Wildcard subdomain server running on http://localhost:${PORT}`);
  console.log(`📁 Deployed sites directory: ${deployedSitesPath}`);
});