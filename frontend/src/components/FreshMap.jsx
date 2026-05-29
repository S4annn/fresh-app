import { useEffect, useRef, Component } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation, AlertTriangle } from 'lucide-react'
import { formatDistance, calculateDistanceKm } from '../utils/geo'
import '../styles/freshMap.css'

// Fix Leaflet default icon issue dengan CDN yang stabil
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom icon user — pakai DivIcon agar tidak ada masalah btoa/encoding
const userIcon = new L.DivIcon({
  html: `<div style="
    width:20px;height:20px;
    background:#2563eb;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 2px 10px rgba(37,99,235,0.6);
    position:relative;
  ">
    <div style="
      position:absolute;
      top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:6px;height:6px;
      background:white;
      border-radius:50%;
    "></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
  className: '',
})

// Custom icon listing — pin merah
const listingIcon = new L.DivIcon({
  html: `<div style="
    width:28px;height:36px;
    position:relative;
    display:flex;
    align-items:center;
    justify-content:center;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 24 32">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#ef4444"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  </div>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
  className: '',
})

/**
 * Error Boundary untuk Map
 */
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('FreshMap error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          height: this.props.height || 300,
          background: '#f9fafb',
          border: '1.5px dashed #e5e7eb',
          borderRadius: 12,
          color: '#6b7280',
          fontSize: 14,
        }}>
          <AlertTriangle size={28} strokeWidth={1.5} color="#f59e0b" />
          <span style={{ fontWeight: 600 }}>Peta gagal dimuat</span>
          <span style={{ fontSize: 12 }}>Coba refresh halaman</span>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * Component untuk mengatur view map secara dinamis
 */
function MapViewController({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom(), { animate: true })
    }
  }, [center?.[0], center?.[1], zoom])

  // Invalidate size saat mount untuk fix container resize
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(timer)
  }, [map])

  return null
}

/**
 * FreshMap Component
 * Komponen reusable untuk menampilkan peta dengan marker
 *
 * @param {Object} props.userLocation - {latitude, longitude, location_name}
 * @param {Array}  props.listings     - Array listing dengan {latitude, longitude, title, ...}
 * @param {number} props.radiusKm     - Radius area dalam kilometer (default 10)
 * @param {number} props.height       - Tinggi map dalam pixel (default 400)
 * @param {Function} props.onMarkerClick - Callback saat marker diklik
 * @param {boolean} props.showRadius  - Tampilkan radius circle (default true)
 */
export default function FreshMap({
  userLocation = null,
  listings = [],
  radiusKm = 10,
  height = 400,
  onMarkerClick = null,
  showRadius = true,
}) {
  const mapRef = useRef(null)

  // Default center: Jakarta
  const defaultCenter = [-6.2088, 106.8456]
  const center = userLocation?.latitude && userLocation?.longitude
    ? [parseFloat(userLocation.latitude), parseFloat(userLocation.longitude)]
    : defaultCenter

  const zoom = userLocation ? 13 : 11

  // Filter listings yang punya koordinat valid
  const validListings = listings.filter(
    (item) => item.latitude && item.longitude &&
      !isNaN(parseFloat(item.latitude)) && !isNaN(parseFloat(item.longitude))
  )

  return (
    <MapErrorBoundary height={height}>
      <div className="fresh-map-wrapper" style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          className="fresh-map"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewController center={center} zoom={zoom} />

          {/* User Location Marker */}
          {userLocation?.latitude && userLocation?.longitude && (
            <>
              <Marker
                position={[parseFloat(userLocation.latitude), parseFloat(userLocation.longitude)]}
                icon={userIcon}
              >
                <Popup>
                  <div className="fresh-map-popup">
                    <div className="fresh-map-popup__header">
                      <Navigation size={15} strokeWidth={2.5} />
                      <strong>Lokasi Anda</strong>
                    </div>
                    {userLocation.location_name && (
                      <div className="fresh-map-popup__body">
                        <div className="fresh-map-popup__location">
                          {userLocation.location_name}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Radius Circle */}
              {showRadius && radiusKm > 0 && (
                <Circle
                  center={[parseFloat(userLocation.latitude), parseFloat(userLocation.longitude)]}
                  radius={radiusKm * 1000}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.07,
                    weight: 1.5,
                    dashArray: '6 4',
                  }}
                />
              )}
            </>
          )}

          {/* Listing Markers */}
          {validListings.map((listing, index) => {
            const lat = parseFloat(listing.latitude)
            const lng = parseFloat(listing.longitude)
            const distance = userLocation?.latitude && userLocation?.longitude
              ? calculateDistanceKm(
                  parseFloat(userLocation.latitude),
                  parseFloat(userLocation.longitude),
                  lat, lng
                )
              : null

            return (
              <Marker
                key={listing.id || index}
                position={[lat, lng]}
                icon={listingIcon}
                eventHandlers={{
                  click: () => onMarkerClick && onMarkerClick(listing),
                }}
              >
                <Popup>
                  <div className="fresh-map-popup">
                    <div className="fresh-map-popup__header">
                      <MapPin size={15} strokeWidth={2.5} />
                      <strong>{listing.title || listing.name || listing.food_name || listing.product_name || 'Item'}</strong>
                    </div>
                    <div className="fresh-map-popup__body">
                      {listing.location_name && (
                        <div className="fresh-map-popup__location">
                          {listing.location_name}
                        </div>
                      )}
                      {distance !== null && (
                        <div className="fresh-map-popup__distance">
                          📍 {formatDistance(distance)} dari Anda
                        </div>
                      )}
                      {listing.description && (
                        <div className="fresh-map-popup__desc">
                          {listing.description}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>

        {/* Map Legend */}
        <div className="fresh-map-legend">
          {userLocation && (
            <div className="fresh-map-legend__item">
              <div className="fresh-map-legend__icon" style={{ background: '#2563eb' }} />
              <span>Lokasi Anda</span>
            </div>
          )}
          {validListings.length > 0 && (
            <div className="fresh-map-legend__item">
              <div className="fresh-map-legend__icon" style={{ background: '#ef4444' }} />
              <span>{validListings.length} item</span>
            </div>
          )}
        </div>
      </div>
    </MapErrorBoundary>
  )
}
