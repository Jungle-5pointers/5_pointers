import React from 'react';

function getDdayDetail(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const ddayStr = diffDays >= 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  return {
    ddayStr,
    diffDays,
    diffHours: Math.abs(diffHours),
    diffMinutes: Math.abs(diffMinutes),
    diffSeconds: Math.abs(diffSeconds)
  };
}

function DdayRenderer({ comp, isEditor }) {
  const title = comp.props.title || comp.defaultProps?.title || 'D-Day';
  const targetDate = comp.props.targetDate || comp.defaultProps?.targetDate || '2024-12-31';
  const { ddayStr, diffHours, diffMinutes, diffSeconds } = getDdayDetail(targetDate);
  return (
    <div style={{
      padding: 16,
      borderRadius: 8,
      background: '#fffbe6',
      border: '1px solid #ffe58f',
      textAlign: 'center',
      minWidth: 120
    }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: '#faad14' }}>{ddayStr}</div>
      <div style={{ fontSize: 16, color: '#faad14', fontWeight: 700 }}>
        {`${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`}
      </div>
      <div style={{ fontSize: 12, color: '#888' }}>{targetDate}</div>
    </div>
  );
}

export default DdayRenderer; 