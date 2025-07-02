import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';

function DateEditor({ value, onChange, label = "날짜", min, max }) {
  // value는 yyyy-MM-dd 문자열
  const selectedDate = value ? new Date(value) : null;

  // min/max는 yyyy-MM-dd 문자열일 수 있음
  const minDate = min ? new Date(min) : undefined;
  const maxDate = max ? new Date(max) : undefined;

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block',
        fontSize: 13,
        color: '#333',
        fontWeight: 500,
        marginBottom: 6
      }}>
        {label}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={date => onChange(date ? date.toISOString().slice(0, 10) : '')}
        dateFormat="yyyy-MM-dd"
        minDate={minDate}
        maxDate={maxDate}
        placeholderText="날짜를 선택하세요"
        className="custom-datepicker-input"
        calendarClassName="korean-calendar"
        popperPlacement="bottom"
        showPopperArrow={false}
        locale={ko}
        renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8 }}>
            <button type="button" onClick={decreaseMonth} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>{'<'}</button>
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              {date.getFullYear()}년 {date.getMonth() + 1}월
            </span>
            <button type="button" onClick={increaseMonth} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>{'>'}</button>
          </div>
        )}
        dayClassName={date => {
          const day = date.getDay();
          if (day === 0) return 'sunday';
          if (day === 6) return 'saturday';
          return '';
        }}
        weekDayClassName={i => {
          if (i === 0) return 'sunday';
          if (i === 6) return 'saturday';
          return '';
        }}
      />
      <style>{`
        .custom-datepicker-input {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
          background: #fff;
        }
        .custom-datepicker-input:focus {
          border-color: #0066FF;
        }
        .korean-calendar .react-datepicker__day.sunday,
        .korean-calendar .react-datepicker__day-name.sunday {
          color: #e74c3c;
        }
        .korean-calendar .react-datepicker__day.saturday,
        .korean-calendar .react-datepicker__day-name.saturday {
          color: #2986e2;
        }
        .korean-calendar .react-datepicker__day-name {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default DateEditor; 