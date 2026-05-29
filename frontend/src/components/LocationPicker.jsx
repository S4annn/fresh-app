import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2, Navigation, X, Search } from 'lucide-react'
import { searchLocation, getUserLocation, reverseGeocode, debounce } from '../utils/geo'
import { useFeedback } from './feedback/feedbackContext'
import '../styles/locationPicker.css'

/**
 * LocationPicker Component
 * Komponen reusable untuk memilih lokasi dengan autocomplete dan GPS
 * 
 * @param {Object} props
 * @param {Object} props.value - {location_name, latitude, longitude}
 * @param {Function} props.onChange - Callback saat lokasi berubah
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.countryCode - Filter negara (contoh: 'id' untuk Indonesia)
 * @param {boolean} props.required - Apakah field wajib diisi
 * @param {string} props.label - Label untuk input
 */
export default function LocationPicker({
  value = null,
  onChange,
  placeholder = 'Cari lokasi atau gunakan lokasi saat ini',
  countryCode = 'id',
  required = false,
  label = 'Lokasi',
}) {
  const feedback = useFeedback()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Set query dari value yang ada
  useEffect(() => {
    if (value && value.location_name) {
      setQuery(value.location_name)
    }
  }, [value])

  // Close suggestions saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length < 3) {
        setSuggestions([])
        setLoading(false)
        return
      }

      try {
        const results = await searchLocation(searchQuery, {
          countryCode,
          limit: 5,
        })
        setSuggestions(results)
      } catch (error) {
        console.error('Search error:', error)
        // Jangan tampilkan error ke user untuk search — cukup kosongkan suggestions
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 700)
  ).current

  function handleInputChange(e) {
    const newQuery = e.target.value
    setQuery(newQuery)
    setShowSuggestions(true)

    if (newQuery.trim().length >= 3) {
      setLoading(true)
      debouncedSearch(newQuery)
    } else {
      setSuggestions([])
      setLoading(false)
    }
  }

  function handleSelectSuggestion(location) {
    setQuery(location.location_name)
    setShowSuggestions(false)
    setSuggestions([])

    if (onChange) {
      onChange({
        location_name: location.location_name,
        latitude: location.latitude,
        longitude: location.longitude,
        raw: location.raw,
      })
    }
  }

  async function handleUseCurrentLocation() {
    setLocating(true)
    feedback.info('Mengambil lokasi Anda...', { duration: 3000 })

    try {
      // Ambil koordinat dari GPS
      const coords = await getUserLocation()

      // Reverse geocoding untuk mendapatkan nama lokasi
      const locationData = await reverseGeocode(coords.latitude, coords.longitude)

      setQuery(locationData.location_name)
      setShowSuggestions(false)

      if (onChange) {
        onChange({
          location_name: locationData.location_name,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          raw: locationData.raw,
        })
      }

      feedback.success('Lokasi berhasil diambil!')
    } catch (error) {
      console.error('Get location error:', error)
      feedback.error(error.message || 'Gagal mengambil lokasi')
    } finally {
      setLocating(false)
    }
  }

  function handleClear() {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    if (onChange) {
      onChange(null)
    }
    inputRef.current?.focus()
  }

  return (
    <div className="location-picker" ref={containerRef}>
      {label && (
        <label className="location-picker__label">
          {label}
          {required && <span className="location-picker__required">*</span>}
        </label>
      )}

      <div className="location-picker__input-wrapper">
        <span className="location-picker__icon">
          <Search size={18} strokeWidth={2} />
        </span>

        <input
          ref={inputRef}
          type="text"
          className="location-picker__input"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            className="location-picker__clear-btn"
            onClick={handleClear}
            title="Hapus"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        )}

        <button
          type="button"
          className="location-picker__gps-btn"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          title="Gunakan lokasi saat ini"
        >
          {locating ? (
            <Loader2 size={18} strokeWidth={2.5} className="spinning" />
          ) : (
            <Navigation size={18} strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="location-picker__suggestions">
          {loading && (
            <div className="location-picker__suggestion-item location-picker__suggestion-item--loading">
              <Loader2 size={16} strokeWidth={2.5} className="spinning" />
              <span>Mencari lokasi...</span>
            </div>
          )}

          {!loading && suggestions.length === 0 && query.trim().length >= 3 && (
            <div className="location-picker__suggestion-item location-picker__suggestion-item--empty">
              <MapPin size={16} strokeWidth={2} />
              <span>Lokasi tidak ditemukan</span>
            </div>
          )}

          {!loading &&
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="location-picker__suggestion-item"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <MapPin size={16} strokeWidth={2} />
                <div className="location-picker__suggestion-text">
                  <div className="location-picker__suggestion-name">
                    {suggestion.location_name}
                  </div>
                  {suggestion.address && (
                    <div className="location-picker__suggestion-detail">
                      {[
                        suggestion.address.city,
                        suggestion.address.state,
                        suggestion.address.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}

      {/* Selected Location Info */}
      {value && value.latitude && value.longitude && (
        <div className="location-picker__selected-info">
          <MapPin size={14} strokeWidth={2} />
          <span>
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  )
}
