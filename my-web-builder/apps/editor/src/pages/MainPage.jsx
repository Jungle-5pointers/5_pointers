import React from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-blue-200/30">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            PAGE CUBE
          </h1>
          <p className="text-slate-600 text-lg font-medium leading-relaxed">
            당신만의 특별한 웹사이트를<br/>
            <span className="text-blue-600 font-semibold">몇 분 만에</span> 완성하세요
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            className="w-full py-4 px-6 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-300 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
          
          <button
            className="w-full py-4 px-6 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-300 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
          
          <button
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border-0"
            onClick={() => navigate('/login')}
          >
            🚀 지금 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;