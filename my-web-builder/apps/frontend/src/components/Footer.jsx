import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 회사/서비스 정보 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/ddukddak-logo.png"
                alt="DDUKDDAK"
                className="h-8 w-auto object-contain"
                style={{ maxWidth: '100px' }}
              />
              {/* <h3 className="text-xl font-bold">DDUKDDAK</h3> */}
            </div>
            <p className="text-gray-300 max-w-md">
              사랑하는 사람들과 함께하는 특별한 순간을 더 특별하게 만들어보세요.
            </p>
            <p className="text-gray-300 mb-4 max-w-md">
              누구나 쉽게 사용할 수 있는 웹페이지 빌더입니다.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/Jungle-5pointers/5_pointers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="mailto:quf417@gmail.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-semibold mb-4">서비스</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  대시보드
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/drafts"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  임시 저장
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/deployed"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  배포된 페이지
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} DDUKDDAK. All rights reserved.
            </div>
          </div>

          {/* 개발자 정보 */}
          <div className="text-center mt-4 pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              Made by{' '}
              <span className="text-pink-200">
                Byeol Kim | Jaemin Seok | Youngjun Lee | Junbae Ji | Sechang Lee
              </span>
            </p>
            <p className="text-gray-600 text-xs mt-1">
              from KRAFTON JUNGLE 8th
            </p>
            <p className="text-gray-600 text-xs mt-1">
              React • TypeScript • Node.js • NestJS • MySQL • AWS • Vite •
              Tailwind CSS • Y.js • WebSocket
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
