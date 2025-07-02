import React from 'react';

// SVG 아이콘 (더 심플하게)
const PhoneIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle'}}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="#888"/>
  </svg>
);

const SmsIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle'}}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#888" strokeWidth="2" fill="none"/>
    <polyline points="22,6 12,13 2,6" stroke="#888" strokeWidth="2" fill="none"/>
  </svg>
);

function PersonRow({ name, phone1, phone2, phone3, role, deceased }) {
  if (!name && !phone1 && !phone2 && !phone3) return null;
  
  const fullPhone = [phone1, phone2, phone3].filter(Boolean).join('-');
  const displayName = deceased ? `(故) ${name}` : name;
  
  return (
    <div style={{ marginBottom: 16, textAlign: 'center' }}>
      {role && <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>{role}</div>}
      {name && <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 8 }}>{displayName}</div>}
      {fullPhone && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <a href={`tel:${fullPhone}`} draggable={false}>{PhoneIcon}</a>
          <a href={`sms:${fullPhone}`} draggable={false}>{SmsIcon}</a>
        </div>
      )}
    </div>
  );
}

function WeddingContactRenderer({ comp }) {
  const p = comp.props;
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '12px',
      padding: '20px',
      color: '#333',
      fontFamily: 'inherit',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      minWidth: '250px',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* 상단 신랑/신부 */}
      <div style={{ display: 'flex', marginBottom: 24 }}>
        {p.brideFirst ? (
          <>
            {/* 신부 먼저 */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>신부</div>
              <PersonRow name={p.brideName} phone1={p.bridePhone1} phone2={p.bridePhone2} phone3={p.bridePhone3} />
            </div>
            {/* 신랑 */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>신랑</div>
              <PersonRow name={p.groomName} phone1={p.groomPhone1} phone2={p.groomPhone2} phone3={p.groomPhone3} />
            </div>
          </>
        ) : (
          <>
            {/* 신랑 */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>신랑</div>
              <PersonRow name={p.groomName} phone1={p.groomPhone1} phone2={p.groomPhone2} phone3={p.groomPhone3} />
            </div>
            {/* 신부 */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>신부</div>
              <PersonRow name={p.brideName} phone1={p.bridePhone1} phone2={p.bridePhone2} phone3={p.bridePhone3} />
            </div>
          </>
        )}
      </div>

      {/* 혼주 (아버지/어머니) */}
      <div style={{ display: 'flex' }}>
        {p.brideFirst ? (
          <>
            {/* 신부 측 먼저 */}
            <div style={{ flex: 1 }}>
              <PersonRow 
                role="아버지" 
                name={p.brideFatherName} 
                phone1={p.brideFatherPhone1} 
                phone2={p.brideFatherPhone2} 
                phone3={p.brideFatherPhone3}
                deceased={p.brideFatherDeceased}
              />
              <PersonRow 
                role="어머니" 
                name={p.brideMotherName} 
                phone1={p.brideMotherPhone1} 
                phone2={p.brideMotherPhone2} 
                phone3={p.brideMotherPhone3}
                deceased={p.brideMotherDeceased}
              />
            </div>
            {/* 신랑 측 */}
            <div style={{ flex: 1 }}>
              <PersonRow 
                role="아버지" 
                name={p.groomFatherName} 
                phone1={p.groomFatherPhone1} 
                phone2={p.groomFatherPhone2} 
                phone3={p.groomFatherPhone3}
                deceased={p.groomFatherDeceased}
              />
              <PersonRow 
                role="어머니" 
                name={p.groomMotherName} 
                phone1={p.groomMotherPhone1} 
                phone2={p.groomMotherPhone2} 
                phone3={p.groomMotherPhone3}
                deceased={p.groomMotherDeceased}
              />
            </div>
          </>
        ) : (
          <>
            {/* 신랑 측 */}
            <div style={{ flex: 1 }}>
              <PersonRow 
                role="아버지" 
                name={p.groomFatherName} 
                phone1={p.groomFatherPhone1} 
                phone2={p.groomFatherPhone2} 
                phone3={p.groomFatherPhone3}
                deceased={p.groomFatherDeceased}
              />
              <PersonRow 
                role="어머니" 
                name={p.groomMotherName} 
                phone1={p.groomMotherPhone1} 
                phone2={p.groomMotherPhone2} 
                phone3={p.groomMotherPhone3}
                deceased={p.groomMotherDeceased}
              />
            </div>
            {/* 신부 측 */}
            <div style={{ flex: 1 }}>
              <PersonRow 
                role="아버지" 
                name={p.brideFatherName} 
                phone1={p.brideFatherPhone1} 
                phone2={p.brideFatherPhone2} 
                phone3={p.brideFatherPhone3}
                deceased={p.brideFatherDeceased}
              />
              <PersonRow 
                role="어머니" 
                name={p.brideMotherName} 
                phone1={p.brideMotherPhone1} 
                phone2={p.brideMotherPhone2} 
                phone3={p.brideMotherPhone3}
                deceased={p.brideMotherDeceased}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WeddingContactRenderer; 