import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { loadUserLocation } from '../utils/geo'

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ResizeMap() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 300)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

const userIcon = new L.DivIcon({
  html: `<div style="
    width:18px;height:18px;
    background:#2563eb;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 8px rgba(37,99,235,0.5);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: '',
})

const donationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

function getLat(item) {
  return Number(item.donor_latitude ?? item.donorLatitude ?? item.user_latitude ?? item.latitude ?? item.pickup_latitude)
}
function getLng(item) {
  return Number(item.donor_longitude ?? item.donorLongitude ?? item.user_longitude ?? item.longitude ?? item.pickup_longitude)
}

export default function DonationMap({ items = [] }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const savedLoc = loadUserLocation()
  const userLat = Number(user.latitude) || (savedLoc ? savedLoc.latitude : null)
  const userLng = Number(user.longitude) || (savedLoc ? savedLoc.longitude : null)
  const hasUserLocation = userLat && userLng && !isNaN(userLat) && !isNaN(userLng)

  const validItems = items.filter((item) => {
    const lat = getLat(item)
    const lng = getLng(item)
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
  })

  const center = hasUserLocation
    ? [userLat, userLng]
    : validItems.length > 0
    ? [getLat(validItems[0]), getLng(validItems[0])]
    : [-6.2088, 106.8456]

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="donation-map">
      <ResizeMap />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hasUserLocation && (
        <>
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ color: '#2563eb' }}>📍 Lokasi Saya</strong>
                <br />
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  {user.location_name || user.address || 'Lokasi Anda'}
                </span>
              </div>
            </Popup>
          </Marker>
          <Circle
            center={[userLat, userLng]}
            radius={10000}
            pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.06, weight: 1.5 }}
          />
        </>
      )}

      {validItems.map((item) => (
        <Marker key={item.id} position={[getLat(item), getLng(item)]} icon={donationIcon}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <strong style={{ fontSize: 14 }}>{item.food_name}</strong>
              <hr style={{ margin: '6px 0', borderColor: '#e5e7eb' }} />
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                <div>👤 {item.donor_name || '-'}</div>
                <div>📦 {item.remaining_quantity} {item.unit}</div>
                <div>📍 {item.pickup_location || '-'}</div>
                {item.donation_distance != null && (
                  <div style={{ color: '#16a34a', fontWeight: 600 }}>
                    🗺️ {item.donation_distance} km dari Anda
                  </div>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
