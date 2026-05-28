import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const donationIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function getLat(item) 
{
  return Number(
    item.donor_latitude ??
      item.donorLatitude ??
      item.user_latitude ??
      item.latitude ??
      item.pickup_latitude
  )
}

function getLng(item) 
{
  return Number(
    item.donor_longitude ??
      item.donorLongitude ??
      item.user_longitude ??
      item.longitude ??
      item.pickup_longitude
  )
}

export default function DonationMap({ items = [] }) 
{
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userLat = Number(user.latitude)
  const userLng = Number(user.longitude)
  const validItems = items.filter((item) => {
    const lat = getLat(item)
    const lng = getLng(item)
    return !Number.isNaN(lat) && !Number.isNaN(lng)
  })
  const center =
    !Number.isNaN(userLat) && !Number.isNaN(userLng)
      ? [userLat, userLng]
      : validItems.length > 0
      ? [getLat(validItems[0]), getLng(validItems[0])]
      : [-1.6101, 103.6131]
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="donation-map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {!Number.isNaN(userLat) && !Number.isNaN(userLng) && (
        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Popup>
            <strong>Lokasi Saya</strong>
            <br />
            {user.address || '-'}
          </Popup>
        </Marker>
      )}
      {validItems.map((item) => (
        <Marker
          key={item.id}
          position={[getLat(item), getLng(item)]}
          icon={donationIcon}
        >
          <Popup>
            <strong>{item.food_name}</strong>
            <br />
            Donatur: {item.donor_name || '-'}
            <br />
            Lokasi: {item.pickup_location || '-'}
            <br />
            Jarak: {item.donation_distance || '-'} km
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}