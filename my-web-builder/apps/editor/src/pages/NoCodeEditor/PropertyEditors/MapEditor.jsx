import React from 'react';

function MapEditor({ value, onChange }) {
  const { lat, lng, zoom, width, height } = value;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...value,
      [name]: Number(value)
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label>Latitude<br/>
          <input type="number" name="lat" value={lat} onChange={handleChange} step="0.0001" />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Longitude<br/>
          <input type="number" name="lng" value={lng} onChange={handleChange} step="0.0001" />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Zoom<br/>
          <input type="number" name="zoom" value={zoom} onChange={handleChange} min={1} max={20} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Width<br/>
          <input type="number" name="width" value={width} onChange={handleChange} min={100} max={1200} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Height<br/>
          <input type="number" name="height" value={height} onChange={handleChange} min={100} max={1000} />
        </label>
      </div>
    </div>
  );
}

export default MapEditor; 