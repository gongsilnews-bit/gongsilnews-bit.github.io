"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from '../lib/supabase';

export default function KakaoMap() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [properties, setProperties] = useState([]);
  const markersRef = useRef([]);

  useEffect(() => {
    // 1. Fetch properties from supabase when component mounts
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setProperties(data);
        }
      } catch(e) {
        console.error("Error fetching properties:", e);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    // 2. Initialize Kakao Map
    const initMap = () => {
      if (window.kakao && window.kakao.maps && mapRef.current) {
        window.kakao.maps.load(() => {
          const mapOption = {
            center: new window.kakao.maps.LatLng(37.498095, 127.027610), // Gangnam Station
            level: 4,
          };
          const newMap = new window.kakao.maps.Map(mapRef.current, mapOption);
          
          // Add basic map controls
          const zoomControl = new window.kakao.maps.ZoomControl();
          newMap.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
          
          setMap(newMap);
        });
      }
    };

    // Since the script is loaded via next/script in layout.js, we might need to check if it's ready.
    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      // Poll a few times if script is still loading
      const timer = setInterval(() => {
        if(window.kakao && window.kakao.maps) {
          clearInterval(timer);
          initMap();
        }
      }, 500);
      return () => clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    // 3. Draw markers when map is ready and properties are loaded
    if (!map || properties.length === 0) return;
    
    // Clear old markers first
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    properties.forEach((p) => {
      if(p.lat && p.lng) {
        const position = new window.kakao.maps.LatLng(p.lat, p.lng);
        const marker = new window.kakao.maps.Marker({
          position: position,
          map: map
        });
        
        // Add info window on click
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;color:#222;font-weight:bold;">${p.title}</div>`,
          removable: true
        });
        
        window.kakao.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      }
    });

  }, [map, properties]);

  const handleGetCurrentLocation = () => {
    if (!map) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const locPosition = new window.kakao.maps.LatLng(lat, lng);
          map.setCenter(locPosition);
        },
        () => alert("위치 정보를 가져올 수 없습니다.")
      );
    } else {
      alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '480px' }}>
      <div 
        id="map" 
        ref={mapRef} 
        style={{ width: '100%', height: '100%', minHeight: '480px', borderRadius: '8px' }}
      ></div>
      <button 
        className="map-btn" 
        onClick={handleGetCurrentLocation}
        style={{
          position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', 
          background: '#1a4282', color: '#fff', padding: '10px 20px', borderRadius: '20px', 
          fontSize: '13px', fontWeight: '700', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', 
          border: 'none', cursor: 'pointer', zIndex: 999
        }}
      >
        현위치에서 재검색
      </button>

      {/* Basic Property List Overlay to prevent complete empty feeling */}
      <div id="property-list-overlay" style={{ display: 'block', position: 'absolute', top: '15px', left: '15px', width: '280px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 999, maxHeight: 'calc(100% - 30px)', overflowY: 'auto' }}>
        <div style={{ padding: '12px 15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 9999, borderRadius: '10px 10px 0 0' }}>
            <h3 style={{ margin:0, fontSize: '15px', color: '#508bf5', display: 'flex', alignItems: 'center' }}>
                우리동네공실 
            </h3>
        </div>
        <div id="property-list-content" style={{ padding: '15px 10px' }}>
          {properties.length > 0 ? properties.slice(0, 5).map(p => (
            <div key={p.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '10px' }}>
              <div style={{fontSize: '14px', fontWeight: 'bold'}}>{p.title}</div>
              <div style={{fontSize: '13px', color: '#1a4282', fontWeight: '800'}}>매매 {p.price || '별도문의'}</div>
              <div style={{fontSize: '12px', color: '#888', marginTop: '2px'}}>{p.property_type}</div>
            </div>
          )) : (
            <div style={{fontSize: '13px', color: '#888', textAlign: 'center'}}>매물을 불러오는 중...</div>
          )}
        </div>
      </div>
    </div>
  );
}
