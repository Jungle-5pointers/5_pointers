import React, { useState } from 'react';
import ButtonRenderer from './pages/NoCodeEditor/ComponentRenderers/ButtonRenderer';

function FontTest() {
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  
  const testComp = {
    id: 'test-button',
    type: 'button',
    props: {
      text: 'Test Button',
      fontSize: 24,
      fontFamily: fontFamily,
      color: '#fff',
      bg: '#3B4EFF'
    }
  };

  const fonts = [
    'Arial, sans-serif',
    '"Times New Roman", Times, serif',
    '"Courier New", Courier, monospace',
    'Georgia, serif',
    'Impact, Charcoal, sans-serif'
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Font Test</h2>
      <div style={{ marginBottom: 20 }}>
        <label>Select Font: </label>
        <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
          {fonts.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>
      
      <div style={{ 
        width: 200, 
        height: 60, 
        border: '1px solid #ccc', 
        marginBottom: 20 
      }}>
        <ButtonRenderer comp={testComp} isEditor={false} />
      </div>
      
      <div>
        <strong>Current fontFamily:</strong> {fontFamily}
      </div>
      
      <div style={{ marginTop: 20 }}>
        <strong>Direct style test:</strong>
        <div style={{ 
          fontFamily: fontFamily, 
          fontSize: '24px', 
          padding: 10,
          border: '1px solid #ddd'
        }}>
          This text should change font
        </div>
      </div>
    </div>
  );
}

export default FontTest;
