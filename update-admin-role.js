// 계정 1@1을 ADMIN으로 업데이트하는 스크립트
const API_BASE_URL = 'http://localhost:3000'; // 개발 환경
// const API_BASE_URL = 'http://your-production-domain.com'; // 프로덕션 환경

async function updateUserRole(email, role) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/update-role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        role: role
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 권한 업데이트 성공:', result);
      return result;
    } else {
      const error = await response.text();
      console.error('❌ 권한 업데이트 실패:', error);
      throw new Error(error);
    }
  } catch (error) {
    console.error('❌ API 호출 오류:', error.message);
    throw error;
  }
}

// 계정 1@1을 ADMIN으로 업데이트
async function makeUserAdmin() {
  try {
    console.log('🔄 계정 1@1을 ADMIN으로 업데이트 중...');
    await updateUserRole('1@1', 'ADMIN');
    console.log('✅ 계정 1@1이 ADMIN으로 설정되었습니다!');
  } catch (error) {
    console.error('❌ 업데이트 실패:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  makeUserAdmin();
}

module.exports = { updateUserRole, makeUserAdmin }; 