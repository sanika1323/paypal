import 'leaflet/dist/leaflet.css'

import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet'
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet'

export interface MapPoint {
  id: string
  kind: 'emergency' | 'ngo' | 'supplier'
  name: string
  detail?: string
  lat: number
  lng: number
}

export interface MapRoute {
  id: string
  from: LatLngTuple
  to: LatLngTuple
  status: string
  label: string
}

const KIND_COLOR: Record<MapPoint['kind'], string> = { emergency: '#ef4444', ngo: '#22d3ee', supplier: '#8b5cf6' }
const ROUTE_COLOR: Record<string, string> = { PENDING: '#8a9cc0', DISPATCHED: '#3b82f6', IN_TRANSIT: '#22d3ee', DELAYED: '#f59e0b', DELIVERED: '#10b981', FAILED: '#ef4444' }

/**
 * Recorded locations only: emergencies, NGOs and suppliers that have coordinates, and a straight
 * supplier → NGO line per delivery. Lines show routing, not live vehicle positions (none are tracked).
 */
export function OperationsMap({ points, routes, height = 360 }: { points: MapPoint[]; routes: MapRoute[]; height?: number | string }) {
  const all: LatLngTuple[] = points.map((p) => [p.lat, p.lng])
  const bounds: LatLngBoundsExpression | undefined = all.length > 1 ? all : undefined
  const center: LatLngTuple = all[0] ?? [20.59, 78.96]

  return (
    <div className="ops-map" style={{ height }}>
      <MapContainer bounds={bounds} boundsOptions={{ padding: [40, 40] }} center={bounds ? undefined : center} zoom={bounds ? undefined : 9} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {routes.map((r) => (
          <Polyline key={r.id} positions={[r.from, r.to]} pathOptions={{ color: ROUTE_COLOR[r.status] ?? '#8a9cc0', weight: 2.5, opacity: 0.85, dashArray: r.status === 'DELIVERED' || r.status === 'FAILED' ? undefined : '6 8', className: r.status === 'DELIVERED' || r.status === 'FAILED' ? undefined : 'route-flow' }}>
            <Tooltip sticky>{r.label}</Tooltip>
          </Polyline>
        ))}
        {points.map((p) => (
          <CircleMarker key={`${p.kind}-${p.id}`} center={[p.lat, p.lng]} radius={p.kind === 'emergency' ? 12 : 7} pathOptions={{ color: KIND_COLOR[p.kind], fillColor: KIND_COLOR[p.kind], fillOpacity: 0.55, weight: 2, className: p.kind === 'emergency' ? 'map-pulse' : undefined }}>
            <Tooltip>
              <strong>{p.name}</strong>
              <br />
              {p.kind === 'ngo' ? 'NGO' : p.kind === 'supplier' ? 'Supplier' : 'Emergency'}
              {p.detail ? ` · ${p.detail}` : ''}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="ops-map__legend">
        <span><i style={{ background: KIND_COLOR.emergency }} />Emergency</span>
        <span><i style={{ background: KIND_COLOR.ngo }} />NGO</span>
        <span><i style={{ background: KIND_COLOR.supplier }} />Supplier</span>
      </div>
    </div>
  )
}
