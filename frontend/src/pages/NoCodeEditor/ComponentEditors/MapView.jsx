import React, { useEffect, useRef } from 'react';

function KakaoMapView({ lat = 37.5665, lng = 126.9780, zoom = 2, width = 400, height = 300 }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    function renderMap() {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng || !mapRef.current) {
        setTimeout(renderMap, 100);
        return;
      }
      console.log('KakaoMapView 렌더링:', { lat, lng, zoom });
      let map = mapRef.current._kakao_map_instance;
      const center = new window.kakao.maps.LatLng(lat, lng);
      if (!map) {
        map = new window.kakao.maps.Map(mapRef.current, {
          center,
          level: zoom,
        });
        mapRef.current._kakao_map_instance = map;
        markerRef.current = new window.kakao.maps.Marker({
          position: center,
          map: map,
        });
        console.log('새 지도 생성됨');
      } else {
        map.setCenter(center);
        if (markerRef.current) {
          markerRef.current.setPosition(center);
        } else {
          markerRef.current = new window.kakao.maps.Marker({
            position: center,
            map: map,
          });
        }
        map.setLevel(zoom);
        console.log('지도 업데이트됨');
      }
    }
    renderMap();
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

export default KakaoMapView; 