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

const productIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('user')) || {}
  } catch { return {} }
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

export default function MarketplaceMap({ items = [] }) {
  const user = getUserFromStorage()
  // Coba dari user profile dulu, fallback ke localStorage geo
  const savedLoc = loadUserLocation()
  const userLat = Number(user.latitude) || (savedLoc ? savedLoc.latitude : null)
  const userLng = Number(user.longitude) || (savedLoc ? savedLoc.longitude : null)
  const hasUserLocation = userLat && userLng && !isNaN(userLat) && !isNaN(userLng)
  const defaultPosition = [-6.2088, 106.8456] // Jakarta
  const userPosition = hasUserLocation ? [userLat, userLng] : defaultPosition

  const validItems = items.filter((item) => {
    const lat = Number(item.seller_latitude)
    const lng = Number(item.seller_longitude)
    return item.seller_latitude != null && item.seller_longitude != null &&
      !isNaN(lat) && !isNaN(lng)
  })

  return (
    <MapContainer center={userPosition} zoom={13} scrollWheelZoom={true} className="marketplace-map">
      <ResizeMap />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hasUserLocation && (
        <>
          <Marker position={userPosition} icon={userIcon}>
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
            center={userPosition}
            radius={10000}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.06, weight: 1.5 }}
          />
        </>
      )}

      {validItems.map((item) => {
        const lat = Number(item.seller_latitude)
        const lng = Number(item.seller_longitude)
        return (
          <Marker key={item.id} position={[lat, lng]} icon={productIcon}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong style={{ fontSize: 14 }}>{item.seller_name || 'Toko'}</strong>
                <hr style={{ margin: '6px 0', borderColor: '#e5e7eb' }} />
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                  <div>🛒 {item.product_name}</div>
                  <div>💰 {formatRupiah(item.price)}</div>
                  <div>📦 Stok: {item.stock} {item.unit || ''}</div>
                  {item.distance != null && (
                    <div style={{ color: '#2563eb', fontWeight: 600 }}>
                      📍 {item.distance} km dari Anda
                    </div>
                  )}
                  <div style={{ color: '#9ca3af' }}>Exp: {item.expiry_date || '-'}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
