const axios = require('axios');

// Template creation script for Elegant Wedding Invitation
async function createElegantWeddingTemplate() {
  const API_BASE_URL = 'http://localhost:3000';
  
  // You'll need to get an admin token first
  const adminToken = 'YOUR_ADMIN_TOKEN_HERE';

  // Define the wedding template components
  const weddingComponents = [
    // Header Section - Wedding Invitation Title
    {
      id: 'wedding-header-1',
      type: 'weddingInvite',
      x: 0,
      y: 0,
      width: 375,
      height: 200,
      props: {
        title: 'Wedding Invitation',
        subtitle: '결혼합니다',
        description: '두 사람이 하나가 되는 소중한 날',
        titleFontFamily: '"Playfair Display", serif',
        titleFontSize: 28,
        subtitleFontSize: 24,
        descriptionFontSize: 16,
        backgroundColor: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fef3c7 100%)',
        textColor: '#be185d',
        textAlign: 'center'
      }
    },

    // Groom Profile
    {
      id: 'groom-profile-1',
      type: 'text',
      x: 20,
      y: 220,
      width: 160,
      height: 180,
      props: {
        text: '신랑\n김민수\n\n김철수 · 이영희의 장남\n1990년 3월 15일생',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: '"Noto Sans KR", sans-serif',
        color: '#1f2937',
        backgroundColor: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '16px',
        padding: '16px'
      }
    },

    // Bride Profile  
    {
      id: 'bride-profile-1',
      type: 'text',
      x: 195,
      y: 220,
      width: 160,
      height: 180,
      props: {
        text: '신부\n박지영\n\n박영수 · 김미경의 장녀\n1992년 7월 22일생',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: '"Noto Sans KR", sans-serif',
        color: '#1f2937',
        backgroundColor: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
        borderRadius: '16px',
        padding: '16px'
      }
    },

    // Wedding Day Title
    {
      id: 'wedding-day-title-1',
      type: 'text',
      x: 0,
      y: 420,
      width: 375,
      height: 60,
      props: {
        text: 'Wedding Day\n결혼식 안내',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: '"Playfair Display", serif',
        color: '#be185d'
      }
    },

    // Wedding Date & Time
    {
      id: 'wedding-datetime-1',
      type: 'dday',
      x: 20,
      y: 500,
      width: 335,
      height: 100,
      props: {
        targetDate: '2024-04-20',
        title: '2024년 4월 20일 토요일',
        subtitle: '오후 2시 30분',
        backgroundColor: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        titleColor: '#1f2937',
        subtitleColor: '#6b7280',
        fontSize: 18,
        borderRadius: '16px'
      }
    },

    // Wedding Venue
    {
      id: 'wedding-venue-1',
      type: 'mapInfo',
      x: 20,
      y: 620,
      width: 335,
      height: 120,
      props: {
        venueName: '웨딩홀 그랜드볼룸',
        address: '서울특별시 강남구 테헤란로 123',
        details: '지하철 2호선 강남역 3번 출구 도보 5분\n주차 가능 (발렛파킹 서비스)',
        backgroundColor: 'linear-gradient(135deg, #fef3c7 0%, #fdf2f8 100%)',
        titleColor: '#1f2937',
        addressColor: '#6b7280',
        borderRadius: '16px'
      }
    },

    // Wedding Message
    {
      id: 'wedding-message-1',
      type: 'text',
      x: 20,
      y: 760,
      width: 335,
      height: 140,
      props: {
        text: '"두 사람이 만나 사랑으로 하나가 되는\n소중한 순간을 함께 축복해 주세요"\n\n바쁘신 중에도 참석해 주시어\n저희의 새로운 시작을 축복해 주시면\n더없는 기쁨이겠습니다.',
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        fontFamily: '"Noto Sans KR", sans-serif',
        color: '#374151',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '16px',
        padding: '20px',
        lineHeight: '1.6'
      }
    },

    // Groom Contact
    {
      id: 'groom-contact-1',
      type: 'weddingContact',
      x: 20,
      y: 920,
      width: 160,
      height: 100,
      props: {
        title: '신랑측 연락처',
        groomName: '김민수',
        groomPhone: '010-1234-5678',
        fatherName: '아버지',
        fatherPhone: '010-9876-5432',
        backgroundColor: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        textColor: '#1f2937',
        borderRadius: '16px'
      }
    },

    // Bride Contact
    {
      id: 'bride-contact-1',
      type: 'weddingContact',
      x: 195,
      y: 920,
      width: 160,
      height: 100,
      props: {
        title: '신부측 연락처',
        brideName: '박지영',
        bridePhone: '010-8765-4321',
        fatherName: '아버지',
        fatherPhone: '010-2468-1357',
        backgroundColor: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
        textColor: '#1f2937',
        borderRadius: '16px'
      }
    },

    // Footer with Names
    {
      id: 'wedding-footer-1',
      type: 'text',
      x: 0,
      y: 1040,
      width: 375,
      height: 80,
      props: {
        text: '김민수 ♥ 박지영\nForever & Always',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: '"Playfair Display", serif',
        color: '#be185d',
        backgroundColor: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fef3c7 100%)'
      }
    },

    // RSVP Button
    {
      id: 'rsvp-button-1',
      type: 'attend',
      x: 87.5,
      y: 1140,
      width: 200,
      height: 50,
      props: {
        eventTitle: '김민수 ♥ 박지영 결혼식',
        buttonText: '참석 여부 알려주기',
        backgroundColor: '#be185d',
        textColor: '#ffffff',
        borderRadius: '25px',
        fontSize: 16,
        fontWeight: '600'
      }
    },

    // Guest Comment Section
    {
      id: 'guest-comments-1',
      type: 'comment',
      x: 20,
      y: 1210,
      width: 335,
      height: 200,
      props: {
        title: '축하 메시지',
        placeholder: '축하 메시지를 남겨주세요...',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderRadius: '16px'
      }
    },

    // Wedding Gift Info
    {
      id: 'wedding-gift-1',
      type: 'bankAccount',
      x: 20,
      y: 1430,
      width: 335,
      height: 120,
      props: {
        title: '축의금 안내',
        groomAccount: {
          name: '김민수',
          bank: '신한은행',
          account: '110-123-456789'
        },
        brideAccount: {
          name: '박지영', 
          bank: '국민은행',
          account: '123-456-789012'
        },
        backgroundColor: '#f9fafb',
        borderRadius: '16px'
      }
    }
  ];

  try {
    const response = await axios.post(
      `${API_BASE_URL}/templates/from-components`,
      {
        components: weddingComponents,
        name: 'Elegant Wedding Invitation',
        category: 'wedding',
        tags: ['wedding', 'invitation', 'elegant', 'romantic', 'pink', 'modern']
      },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ 웨딩 템플릿이 성공적으로 생성되었습니다!');
    console.log('Template ID:', response.data.id);
    console.log('Template Name:', response.data.name);
    console.log('Category:', response.data.category);
    console.log('Components Count:', response.data.content.length);

    return response.data;
  } catch (error) {
    console.error('❌ 템플릿 생성 실패:', error.response?.data || error.message);
    throw error;
  }
}

// 실행
if (require.main === module) {
  createElegantWeddingTemplate()
    .then(template => {
      console.log('Template created successfully:', template.id);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error creating template:', error);
      process.exit(1);
    });
}

module.exports = { createElegantWeddingTemplate };