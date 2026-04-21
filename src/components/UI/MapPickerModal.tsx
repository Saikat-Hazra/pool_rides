import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, Search, Crosshair, X } from 'lucide-react'

// Fix Leaflet's default icon path issues in Vite/React
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (label: string, lat: number, lng: number) => void
  title?: string
}

const DEFAULT_CENTER = L.latLng(12.9716, 77.5946) // Bengaluru

function MapController({ center }: { center: L.LatLng | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { animate: true })
    }
  }, [center, map])
  return null
}

function ClickMarker({ position, setPosition }: { position: L.LatLng | null; setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })
  return position ? <Marker position={position} /> : null
}

export default function MapPickerModal({ isOpen, onClose, onSelect, title = 'Select Location' }: MapPickerModalProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const [mapCenter, setMapCenter] = useState<L.LatLng | null>(null)
  const [query, setQuery] = useState('')
  const [label, setLabel] = useState('')

  // Request geolocation on open
  useEffect(() => {
    if (isOpen && !position) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = L.latLng(pos.coords.latitude, pos.coords.longitude)
            setMapCenter(loc)
            // We don't drop the pin automatically so the user can be precise
          },
          (err) => {
            console.warn('Geolocation denied or failed:', err)
            setMapCenter(DEFAULT_CENTER)
          }
        )
      } else {
        setMapCenter(DEFAULT_CENTER)
      }
    }
  }, [isOpen])

  // Reverse geocode when pin drops
  useEffect(() => {
    if (!position) return
    const fetchLabel = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`)
        const data = await res.json()
        if (data && data.display_name) {
          // Clean up the massive nominatim strings to something readable
          const clean = data.display_name.split(',').slice(0, 3).join(', ')
          setLabel(clean)
        }
      } catch (err) {
        console.error('Reverse geocode failed', err)
        setLabel(`${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`)
      }
    }
    fetchLabel()
  }, [position])

  if (!isOpen) return null

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query) return
    try {
      const searchQuery = query.toLowerCase().includes('bengaluru') || query.toLowerCase().includes('bangalore') 
        ? query 
        : `${query}, Bengaluru`;
        
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=5`)
      const data = await res.json()
      if (data && data.length > 0) {
        const loc = L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon))
        setMapCenter(loc)
        setPosition(loc) // Auto drop pin on search result
      }
    } catch (err) {
      console.error('Geocode search failed', err)
    }
  }

  function handleConfirm() {
    if (position && label) {
      onSelect(label, position.lat, position.lng)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-400" />
            {title}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800/60 flex gap-2">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for an area or landmark..."
              className="w-full pl-9 pr-4 py-2 border border-slate-800 rounded-lg text-sm bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </form>
          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => setMapCenter(L.latLng(pos.coords.latitude, pos.coords.longitude)))
              }
            }}
            className="p-2 border border-slate-800 rounded-lg bg-slate-900 text-slate-400 hover:bg-slate-800 flex-shrink-0 flex items-center justify-center transition-colors"
            title="My Location"
          >
            <Crosshair className="w-5 h-5" />
          </button>
        </div>

        {/* Map Area */}
        <div className="relative h-80 sm:h-96 w-full bg-slate-950 z-0">
          <MapContainer center={DEFAULT_CENTER} zoom={13} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapController center={mapCenter} />
            <ClickMarker position={position} setPosition={setPosition} />
          </MapContainer>
          
          {!position && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 text-white text-[10px] font-medium px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur pointer-events-none uppercase tracking-wider">
              Tap anywhere on the map to drop a pin
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0 w-full">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Selected Location Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Drop a pin first..."
                className="w-full text-sm font-medium border-0 border-b border-slate-800 bg-transparent text-white focus:ring-0 focus:border-teal-500 p-0 pb-1 placeholder-slate-700"
                disabled={!position}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!position || !label}
                className="btn-primary w-full sm:w-auto disabled:opacity-50"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
