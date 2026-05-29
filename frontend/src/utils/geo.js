/**
 * Geo Utility Functions
 * Fungsi-fungsi untuk menangani geolocation, geocoding, dan kalkulasi jarak
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'
const STORAGE_KEY = 'fresh_user_location'

/**
 * Mendapatkan lokasi user dari browser Geolocation API
 * @param {Object} options - Opsi geolocation
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export async function getUserLocation(options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
    ...options,
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser Anda tidak mendukung geolocation'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        let message = 'Gagal mendapatkan lokasi'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Izin lokasi ditolak. Aktifkan izin lokasi di browser Anda.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Lokasi tidak tersedia. Pastikan GPS aktif.'
            break
          case error.TIMEOUT:
            message = 'Waktu habis. Coba lagi.'
            break
        }
        reject(new Error(message))
      },
      defaultOptions
    )
  })
}

/**
 * Reverse geocoding: koordinat → alamat
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>}
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?` +
        new URLSearchParams({
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: '1',
          'accept-language': 'id',
        }),
      {
        headers: {
          'User-Agent': 'FRESH-FoodWasteApp/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Gagal melakukan reverse geocoding')
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    return {
      location_name: data.display_name || `${latitude}, ${longitude}`,
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon),
      address: data.address || {},
      raw: data,
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    // Fallback: tampilkan koordinat
    return {
      location_name: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      latitude,
      longitude,
      address: {},
      raw: null,
    }
  }
}

/**
 * Forward geocoding: alamat → koordinat
 * @param {string} query - Query pencarian lokasi
 * @param {Object} options - Opsi pencarian
 * @returns {Promise<Array>}
 */
export async function searchLocation(query, options = {}) {
  if (!query || query.trim().length < 3) {
    return []
  }

  try {
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: options.limit || 5,
      'accept-language': 'id',
    }

    // Filter negara jika diperlukan
    if (options.countryCode) {
      params.countrycodes = options.countryCode
    }

    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?${new URLSearchParams(params)}`,
      {
        headers: {
          'User-Agent': 'FRESH-FoodWasteApp/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Gagal mencari lokasi')
    }

    const data = await response.json()

    return data.map((item) => ({
      location_name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: item.address || {},
      raw: item,
    }))
  } catch (error) {
    console.error('Search location error:', error)
    return []
  }
}

/**
 * Menghitung jarak antara dua koordinat menggunakan Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Jarak dalam kilometer
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius bumi dalam km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

function toRad(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Format jarak menjadi string yang mudah dibaca
 * @param {number} distanceKm - Jarak dalam kilometer
 * @returns {string}
 */
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`
  }
  return `${Math.round(distanceKm)} km`
}

/**
 * Filter listing berdasarkan radius dari lokasi user
 * @param {Array} listings - Array listing dengan latitude & longitude
 * @param {Object} userLocation - {latitude, longitude}
 * @param {number} radiusKm - Radius dalam kilometer
 * @returns {Array}
 */
export function filterNearbyListings(listings, userLocation, radiusKm = 10) {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return listings
  }

  return listings.filter((listing) => {
    if (!listing.latitude || !listing.longitude) return false

    const distance = calculateDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      listing.latitude,
      listing.longitude
    )

    return distance <= radiusKm
  })
}

/**
 * Urutkan listing dari yang terdekat
 * @param {Array} listings - Array listing dengan latitude & longitude
 * @param {Object} userLocation - {latitude, longitude}
 * @returns {Array}
 */
export function sortByNearest(listings, userLocation) {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return listings
  }

  return [...listings].sort((a, b) => {
    if (!a.latitude || !a.longitude) return 1
    if (!b.latitude || !b.longitude) return -1

    const distanceA = calculateDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      a.latitude,
      a.longitude
    )

    const distanceB = calculateDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      b.latitude,
      b.longitude
    )

    return distanceA - distanceB
  })
}

/**
 * Simpan lokasi user ke localStorage
 * @param {Object} location - {latitude, longitude, location_name}
 */
export function saveUserLocation(location) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location))
  } catch (error) {
    console.error('Failed to save user location:', error)
  }
}

/**
 * Load lokasi user dari localStorage
 * @returns {Object|null}
 */
export function loadUserLocation() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to load user location:', error)
    return null
  }
}

/**
 * Hapus lokasi user dari localStorage
 */
export function clearUserLocation() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear user location:', error)
  }
}

/**
 * Validasi koordinat
 * @param {number} latitude
 * @param {number} longitude
 * @returns {boolean}
 */
export function isValidCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude)
  const lon = parseFloat(longitude)

  if (isNaN(lat) || isNaN(lon)) return false
  if (lat < -90 || lat > 90) return false
  if (lon < -180 || lon > 180) return false

  return true
}

/**
 * Debounce function untuk mengurangi frekuensi API calls
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait = 500) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
