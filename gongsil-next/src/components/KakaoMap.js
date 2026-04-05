'use client';
import { useEffect, useRef } from 'react';

export default function KakaoMap({ properties }) {
    const mapRef = useRef(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=435d3602201a49ea712e5f5a36fe6efc&libraries=clusterer,services&autoload=false";
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.kakao.maps.load(() => {
                if (!mapRef.current) return;
                
                const container = mapRef.current;
                const options = {
                    center: new window.kakao.maps.LatLng(37.498095, 127.027610), // 강남역 기본
                    level: 5
                };
                
                const map = new window.kakao.maps.Map(container, options);

                // 클러스터러 추가
                const clusterer = new window.kakao.maps.MarkerClusterer({
                    map: map,
                    averageCenter: true,
                    minLevel: 4,
                    styles: [{
                        width: '40px', height: '40px',
                        background: 'rgba(26, 66, 130, 0.9)',
                        color: '#fff',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        lineHeight: '40px',
                        borderRadius: '50%',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                    }]
                });

                if (properties && properties.length > 0) {
                    const markers = properties.filter(p => p.lat && p.lng).map(prop => {
                        return new window.kakao.maps.Marker({
                            position: new window.kakao.maps.LatLng(prop.lat, prop.lng),
                            title: prop.title
                        });
                    });
                    clusterer.addMarkers(markers);
                }
            });
        };

        return () => { document.head.removeChild(script); };
    }, [properties]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
            <button className="map-btn" onClick={() => alert('실시간 재검색 기능은 추후 연동됩니다.')}>
                현위치에서 재검색
            </button>
            <div id="property-list-overlay" style={{ display: 'block', position: 'absolute', top: '15px', left: '15px', width: '280px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 99999, maxHeight: 'calc(100% - 30px)', overflowY: 'auto' }}>
                <div style={{ padding: '12px 15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 999999, borderRadius: '10px 10px 0 0' }}>
                    <h3 style={{ margin:0, fontSize: '15px', color: '#508bf5', display: 'flex', alignItems: 'center' }}>
                        우리동네공실 
                    </h3>
                </div>
                <div style={{ padding: '15px' }}>
                    {properties?.slice(0, 5).map(p => (
                        <div key={p.id} style={{ borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'10px' }}>
                            <strong style={{fontSize:'14px', color:'#222'}}>{p.title}</strong>
                            <div style={{fontSize:'13px', color:'#e53e3e', fontWeight:'bold', marginTop:'4px'}}>{p.deposit && p.rent ? `보 ${p.deposit} / 월 ${p.rent}` : p.price}</div>
                        </div>
                    ))}
                    <div style={{textAlign:'center', fontSize:'12px', color:'#999'}}>...총 {properties?.length || 0}개 매물</div>
                </div>
            </div>
        </div>
    );
}
