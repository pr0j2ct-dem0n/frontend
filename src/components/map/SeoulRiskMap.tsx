import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { RiskZone } from '../../types/risk';
import type { PumpStation } from '../../types/map';
import type { SewageTreatmentFacility } from '../../types/sewageTreatment';
import { RISK_COLORS, RISK_LABELS } from '../../utils/riskStyle';

interface SeoulRiskMapProps {
  riskZones: RiskZone[];
  pumpStations: PumpStation[];
  sewageFacilities: SewageTreatmentFacility[];
}

const SEOUL_CENTER: [number, number] = [37.5665, 126.9780];

/* ── 아이콘 정의 ── */
const pumpIcon = divIcon({
  html: `<div style="background:#2563EB;width:14px;height:14px;border-radius:50%;border:2.5px solid white;box-shadow:0 0 0 2px #2563EB,0 2px 8px rgba(37,99,235,0.45)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/** 공공하수처리시설 마커 — 청록색 사각형 */
const sewageIcon = divIcon({
  html: `<div style="
    background:#0D9488;
    width:14px;height:14px;
    border-radius:3px;
    border:2.5px solid white;
    box-shadow:0 0 0 2px #0D9488,0 2px 8px rgba(13,148,136,0.45);
  "></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/** 점검중 시설 마커 — 회색 사각형 */
const sewageIconMaintenance = divIcon({
  html: `<div style="
    background:#94a3b8;
    width:14px;height:14px;
    border-radius:3px;
    border:2.5px solid white;
    box-shadow:0 0 0 2px #94a3b8,0 2px 6px rgba(148,163,184,0.45);
  "></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/** DANGER 위험구간 전용 경고 아이콘 마커 */
const dangerIcon = divIcon({
  html: `
    <div style="pointer-events:none;position:relative;width:22px;height:22px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(239,68,68,0.9);
        border:2.5px solid rgba(255,255,255,0.95);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 0 3px rgba(239,68,68,0.28),0 2px 8px rgba(239,68,68,0.4);
        color:white;font-size:13px;font-weight:900;line-height:1;
        text-shadow:0 1px 2px rgba(0,0,0,0.25);
      ">⚠</div>
    </div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function riskRadius(score: number): number {
  return 8 + (score / 100) * 20;
}

type LayerKey = 'riskZones' | 'pumpStations' | 'sewageFacilities';

const LAYER_BUTTONS: { key: LayerKey; label: string; color: string }[] = [
  { key: 'riskZones',        label: '위험구간',        color: '#EF4444' },
  { key: 'pumpStations',     label: '빗물펌프장',      color: '#2563EB' },
  { key: 'sewageFacilities', label: '공공하수처리시설', color: '#0D9488' },
];

export default function SeoulRiskMap({ riskZones, pumpStations, sewageFacilities }: SeoulRiskMapProps) {
  const [activeLayers, setActiveLayers] = useState<Record<LayerKey, boolean>>({
    riskZones:        true,
    pumpStations:     true,
    sewageFacilities: false,
  });

  const toggleLayer = (layer: LayerKey) =>
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-full min-h-[400px] relative">

      {/* ── 레이어 토글 버튼 ── */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-wrap gap-1.5 justify-end max-w-[300px]">
        {LAYER_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            onClick={() => toggleLayer(btn.key)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all shadow-sm whitespace-nowrap
              ${activeLayers[btn.key]
                ? 'bg-white border-slate-300 text-slate-700 shadow-md'
                : 'bg-white/80 border-slate-200 text-slate-400'}`}
          >
            <span
              className={`w-2 h-2 flex-shrink-0 ${btn.key === 'sewageFacilities' ? 'rounded-sm' : 'rounded-full'}`}
              style={{ backgroundColor: activeLayers[btn.key] ? btn.color : '#94a3b8' }}
            />
            {btn.label}
          </button>
        ))}
      </div>

      {/* ── 범례 ── */}
      <div className="absolute bottom-6 left-3 z-[1000] bg-white/96 backdrop-blur-sm rounded-lg border border-slate-200 shadow-md p-3 min-w-[120px]">
        <p className="text-slate-600 text-[11px] font-semibold mb-2">위험도 범례</p>
        <div className="space-y-1.5">
          {/* DANGER — 아이콘 포함 */}
          <div className="flex items-center gap-2">
            <span className="relative flex-shrink-0 w-4 h-4">
              <span className="absolute inset-0 rounded-full bg-red-500 opacity-30" />
              <span className="absolute inset-0 flex items-center justify-center text-red-600 font-black text-[10px] leading-none">⚠</span>
            </span>
            <span className="text-[11px] text-slate-600">위험</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#F97316' }} />
            <span className="text-[11px] text-slate-600">경계</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#EAB308' }} />
            <span className="text-[11px] text-slate-600">주의</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#22C55E' }} />
            <span className="text-[11px] text-slate-600">안전</span>
          </div>
          {/* 구분선 */}
          <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 bg-blue-500" />
              <span className="text-[11px] text-slate-600">펌프장</span>
            </div>
            {activeLayers.sewageFacilities && (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0 bg-teal-600" />
                <span className="text-[11px] text-slate-600">하수처리시설</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 지도 본체 ── */}
      <MapContainer
        center={SEOUL_CENTER}
        zoom={12}
        style={{ height: '100%', minHeight: '400px', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* ── 위험구간 CircleMarker ── */}
        {activeLayers.riskZones &&
          riskZones.map((zone) => (
            <CircleMarker
              key={zone.id}
              center={[zone.latitude, zone.longitude]}
              radius={riskRadius(zone.riskScore)}
              pathOptions={{
                color: RISK_COLORS[zone.riskLevel],
                fillColor: RISK_COLORS[zone.riskLevel],
                fillOpacity: zone.riskLevel === 'DANGER' ? 0.25 : 0.35,
                weight: zone.riskLevel === 'DANGER' ? 2.5 : 2,
              }}
            >
              <Tooltip sticky>
                <div style={{ fontSize: '12px', lineHeight: '1.65' }}>
                  <p style={{ fontWeight: 700, marginBottom: '2px' }}>{zone.name}</p>
                  <p style={{ color: '#64748b' }}>{zone.district} · 위험도: {RISK_LABELS[zone.riskLevel]}</p>
                  <p>위험점수: <strong>{zone.riskScore}점</strong></p>
                  <p>강우량: {zone.metrics.rainfallMm}mm</p>
                  <p>하수 수위: {zone.metrics.sewerLevelM}m</p>
                  <p>용량: {zone.metrics.sewerCapacityRate}%</p>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

        {/* ── DANGER 전용 경고 아이콘 ── */}
        {activeLayers.riskZones &&
          riskZones
            .filter((z) => z.riskLevel === 'DANGER')
            .map((zone) => (
              <Marker
                key={`danger-icon-${zone.id}`}
                position={[zone.latitude, zone.longitude]}
                icon={dangerIcon}
                zIndexOffset={500}
              />
            ))}

        {/* ── 빗물펌프장 마커 ── */}
        {activeLayers.pumpStations &&
          pumpStations.map((ps) => (
            <Marker key={ps.id} position={[ps.latitude, ps.longitude]} icon={pumpIcon}>
              <Popup>
                <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
                  <p style={{ fontWeight: 700, color: '#2563EB', marginBottom: '2px' }}>{ps.name}</p>
                  <p>{ps.district} · {ps.riverName}</p>
                  <p>용량: {ps.capacity.toLocaleString()} m³/hr</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* ── 공공하수처리시설 마커 ── */}
        {activeLayers.sewageFacilities &&
          sewageFacilities.map((facility) => (
            <Marker
              key={facility.id}
              position={[facility.latitude, facility.longitude]}
              icon={facility.operationStatus === '운영중' ? sewageIcon : sewageIconMaintenance}
            >
              <Popup>
                <div style={{ fontSize: '12px', lineHeight: '1.8', minWidth: '200px' }}>
                  <p style={{ fontWeight: 700, color: '#0D9488', marginBottom: '4px' }}>{facility.name}</p>
                  <p style={{ color: '#64748b', marginBottom: '4px' }}>{facility.address}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>처리용량: <strong>{facility.capacityM3PerDay.toLocaleString()}㎥/일</strong></span>
                    <span>처리방식: {facility.treatmentMethod}</span>
                    <span>
                      운영상태:{' '}
                      <strong style={{ color: facility.operationStatus === '운영중' ? '#0D9488' : '#94a3b8' }}>
                        {facility.operationStatus}
                      </strong>
                    </span>
                  </div>
                  <p style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '11px' }}>
                    출처: 공공데이터포털 · 한국환경공단
                  </p>
                </div>
              </Popup>
              <Tooltip sticky>
                <span style={{ fontSize: '11px' }}>
                  {facility.name} — {facility.capacityM3PerDay.toLocaleString()}㎥/일
                </span>
              </Tooltip>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
