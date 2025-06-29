import React, { useEffect, useRef } from 'react';

function MapView({ lat = 37.5665, lng = 126.9780, zoom = 3, width = 400, height = 300 }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (window.naver && window.naver.maps && mapRef.current) {
      if (!mapRef.current._naver_map_instance) {
        const map = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(lat, lng),
          zoom: zoom,
        });
        mapRef.current._naver_map_instance = map;
        markerRef.current = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(lat, lng),
          map: map,
        });
      }
    }
  }, [lat, lng, zoom]);

  return (
    <div>
      <div
        ref={mapRef}
        style={{ width: width, height: height, borderRadius: 8, border: '1px solid #ccc' }}
      />
    </div>
  );
}

export default MapView; 