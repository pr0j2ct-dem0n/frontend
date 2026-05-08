import { MapContainer, TileLayer, CircleMarker, Tooltip, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { RiskZone } from '../../types/risk';
import { RISK_COLORS, RISK_LABELS } from '../../utils/riskStyle';

interface SeoulRiskMapProps {
  riskZones: RiskZone[];
}

const SEOUL_CENTER: [number, number] = [37.5665, 126.9780];

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

export default function SeoulRiskMap({ riskZones }: SeoulRiskMapProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-full min-h-[400px] relative">

      {/* ── 범례 ── */}
      <div className="absolute bottom-6 left-3 z-[1000] bg-white/96 backdrop-blur-sm rounded-lg border border-slate-200 shadow-md p-3 min-w-[120px]">
        <p className="text-slate-600 text-[11px] font-semibold mb-2">위험도 범례</p>
        <div className="space-y-1.5">
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

        {riskZones.map((zone) => (
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

        {riskZones
          .filter((z) => z.riskLevel === 'DANGER')
          .map((zone) => (
            <Marker
              key={`danger-icon-${zone.id}`}
              position={[zone.latitude, zone.longitude]}
              icon={dangerIcon}
              zIndexOffset={500}
            />
          ))}
      </MapContainer>
    </div>
  );
}
