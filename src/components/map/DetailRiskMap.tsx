import { MapContainer, TileLayer, CircleMarker, Tooltip, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { RiskZone } from '../../types/risk';
import type { PumpStation } from '../../types/map';
import { RISK_COLORS, RISK_LABELS } from '../../utils/riskStyle';

const dangerIcon = divIcon({
  html: `
    <div style="pointer-events:none;position:relative;width:20px;height:20px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(239,68,68,0.9);border:2.5px solid rgba(255,255,255,0.95);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 0 3px rgba(239,68,68,0.28),0 2px 8px rgba(239,68,68,0.4);
        color:white;font-size:12px;font-weight:900;line-height:1;
        text-shadow:0 1px 2px rgba(0,0,0,0.25);
      ">⚠</div>
    </div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface DetailRiskMapProps {
  riskZones: RiskZone[];
  pumpStations?: PumpStation[];
  center: [number, number];
  zoom?: number;
  height?: string;
  highlightZoneId?: string;
}

const pumpIcon = divIcon({
  html: `<div style="background:#2563EB;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px #2563EB,0 2px 6px rgba(37,99,235,0.4)"></div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function riskRadius(score: number, isHighlight: boolean): number {
  const base = 8 + (score / 100) * 18;
  return isHighlight ? base + 4 : base;
}

export default function DetailRiskMap({
  riskZones,
  pumpStations = [],
  center,
  zoom = 13,
  height = '400px',
  highlightZoneId,
}: DetailRiskMapProps) {
  return (
    <div
      className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {riskZones.map((zone) => {
          const isHighlight = zone.id === highlightZoneId;
          return (
            <CircleMarker
              key={zone.id}
              center={[zone.latitude, zone.longitude]}
              radius={riskRadius(zone.riskScore, isHighlight)}
              pathOptions={{
                color: RISK_COLORS[zone.riskLevel],
                fillColor: RISK_COLORS[zone.riskLevel],
                fillOpacity: isHighlight ? 0.55 : 0.3,
                weight: isHighlight ? 3 : 2,
              }}
            >
              <Tooltip sticky permanent={isHighlight}>
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                  <p style={{ fontWeight: 700 }}>{zone.name}</p>
                  <p style={{ color: '#64748b' }}>{zone.district} · {RISK_LABELS[zone.riskLevel]}</p>
                  <p>위험점수: <strong>{zone.riskScore}점</strong></p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* DANGER 전용 경고 아이콘 */}
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

        {pumpStations.map((ps) => (
          <Marker key={ps.id} position={[ps.latitude, ps.longitude]} icon={pumpIcon}>
            <Popup>
              <div style={{ fontSize: '12px', lineHeight: '1.7' }}>
                <p style={{ fontWeight: 700, color: '#2563EB' }}>{ps.name}</p>
                <p>{ps.district} · {ps.riverName}</p>
                <p>용량: {ps.capacity.toLocaleString()} m³/hr</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Small legend */}
      <div className="absolute bottom-4 left-3 z-[1000] bg-white/95 rounded-lg border border-slate-200 shadow-md p-2.5">
        <div className="space-y-1">
          {[
            { color: '#EF4444', label: '위험' },
            { color: '#F97316', label: '경계' },
            { color: '#EAB308', label: '주의' },
            { color: '#22C55E', label: '안전' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
