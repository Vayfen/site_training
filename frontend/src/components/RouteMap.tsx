import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Route } from '../types';

// Fix for default marker icons in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RouteMapProps {
  route: Route;
  height?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({ route, height = '400px' }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(
        [route.start_lat || 45.764043, route.start_lng || 4.835659],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    // Add marker for start location
    if (route.start_lat && route.start_lng) {
      const marker = L.marker([route.start_lat, route.start_lng]).addTo(mapRef.current);
      marker.bindPopup(`
        <div class="text-sm">
          <strong>${route.name}</strong><br/>
          ${route.start_location || 'Point de départ'}<br/>
          ${route.distance_km.toFixed(1)} km
        </div>
      `);
    }

    // Draw route if route_data exists
    if (route.route_data && Array.isArray(route.route_data) && route.route_data.length > 0) {
      const latLngs = route.route_data.map((point: any) => {
        if (Array.isArray(point)) {
          return [point[0], point[1]] as L.LatLngExpression;
        } else if (point.lat && point.lng) {
          return [point.lat, point.lng] as L.LatLngExpression;
        }
        return null;
      }).filter((p): p is L.LatLngExpression => p !== null);

      if (latLngs.length > 0) {
        const polyline = L.polyline(latLngs, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.7
        }).addTo(mapRef.current);

        // Fit map to polyline bounds
        mapRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }
    } else if (route.start_lat && route.start_lng) {
      // If no route data, just center on start location
      mapRef.current.setView([route.start_lat, route.start_lng], 13);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [route]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden shadow-lg border border-gray-200"
    />
  );
};
