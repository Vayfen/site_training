import { useEffect, useState } from 'react';
import { routesService } from '../services/routes.service';
import { Route } from '../types';
import { Map, Plus, Heart, Mountain, X, MapPin } from 'lucide-react';

const RoutesPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    distance_km: 10,
    route_type: 'road',
    start_location: '',
    start_lat: '',
    start_lng: '',
    elevation_preference: 'moderate',
    loop: true,
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await routesService.getRoutes();
      setRoutes(data);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (routeId: number) => {
    try {
      await routesService.toggleFavorite(routeId);
      await loadRoutes();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleGenerateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const requestData: any = {
        distance_km: formData.distance_km,
        route_type: formData.route_type,
        elevation_preference: formData.elevation_preference,
        loop: formData.loop,
      };

      // Add location if provided
      if (formData.start_location) {
        requestData.start_location = formData.start_location;
      }

      // Add GPS coordinates if provided
      if (formData.start_lat && formData.start_lng) {
        requestData.start_lat = parseFloat(formData.start_lat);
        requestData.start_lng = parseFloat(formData.start_lng);
      }

      await routesService.generateRoute(requestData);
      await loadRoutes();
      setShowGenerateModal(false);

      // Reset form
      setFormData({
        distance_km: 10,
        route_type: 'road',
        start_location: '',
        start_lat: '',
        start_lng: '',
        elevation_preference: 'moderate',
        loop: true,
      });
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  // Fonction pour obtenir la position actuelle
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            start_lat: position.coords.latitude.toFixed(6),
            start_lng: position.coords.longitude.toFixed(6),
            start_location: 'Ma position actuelle',
          });
        },
        (error) => {
          alert('Erreur lors de la récupération de la position: ' + error.message);
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
    }
  };

  const routeTypeLabels: Record<string, string> = {
    road: 'Route',
    trail: 'Trail',
    mixed: 'Mixte',
  };

  const difficultyStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mes itinéraires</h1>
          <p className="text-gray-600">Parcours générés et sauvegardés</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Générer un itinéraire
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="card text-center py-12">
          <Map size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Aucun itinéraire</h2>
          <p className="text-gray-600 mb-6">
            Générez votre premier itinéraire avec l'IA
          </p>
          <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary">
            Générer un itinéraire
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div key={route.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold flex-1">{route.name}</h3>
                <button
                  onClick={() => handleToggleFavorite(route.id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Heart
                    size={20}
                    className={route.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                  />
                </button>
              </div>

              {route.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {route.description}
                </p>
              )}

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="font-medium">
                    {routeTypeLabels[route.route_type] || route.route_type}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Distance</span>
                  <span className="font-medium">{route.distance_km.toFixed(1)} km</span>
                </div>

                {route.elevation_gain_m > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Mountain size={14} />
                      Dénivelé
                    </span>
                    <span className="font-medium">+{route.elevation_gain_m}m</span>
                  </div>
                )}

                {route.start_location && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin size={14} />
                      Départ
                    </span>
                    <span className="font-medium text-sm">{route.start_location}</span>
                  </div>
                )}

                {route.start_lat && route.start_lng && (
                  <div className="text-xs text-gray-500 text-center py-2 bg-gray-50 rounded">
                    📍 {route.start_lat.toFixed(4)}°, {route.start_lng.toFixed(4)}°
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Difficulté</span>
                  <span className="text-yellow-500">{difficultyStars(route.difficulty_rating)}</span>
                </div>

                {route.scenic_rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Paysage</span>
                    <span className="text-yellow-500">{difficultyStars(route.scenic_rating)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Utilisé {route.times_used} fois
                </div>
                {route.generated_by_ai && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    IA
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Route Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Générer un itinéraire</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleGenerateRoute} className="p-6 space-y-6">
              {/* Distance et Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Distance (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="200"
                    value={formData.distance_km}
                    onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Type de parcours *</label>
                  <select
                    value={formData.route_type}
                    onChange={(e) => setFormData({ ...formData, route_type: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="road">Route</option>
                    <option value="trail">Trail</option>
                    <option value="mixed">Mixte</option>
                  </select>
                </div>
              </div>

              {/* Lieu et Format */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Dénivelé</label>
                  <select
                    value={formData.elevation_preference}
                    onChange={(e) => setFormData({ ...formData, elevation_preference: e.target.value })}
                    className="input"
                  >
                    <option value="flat">Plat</option>
                    <option value="moderate">Modéré</option>
                    <option value="hilly">Vallonné</option>
                  </select>
                </div>
                <div>
                  <label className="label">Format</label>
                  <select
                    value={formData.loop ? 'loop' : 'out_back'}
                    onChange={(e) => setFormData({ ...formData, loop: e.target.value === 'loop' })}
                    className="input"
                  >
                    <option value="loop">Boucle</option>
                    <option value="out_back">Aller-retour</option>
                  </select>
                </div>
              </div>

              {/* Lieu de départ */}
              <div>
                <label className="label">Lieu de départ (optionnel)</label>
                <input
                  type="text"
                  value={formData.start_location}
                  onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                  className="input"
                  placeholder="Ex: Parc de la Tête d'Or, Lyon"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Nom du lieu ou adresse approximative
                </p>
              </div>

              {/* Coordonnées GPS */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="label mb-0">Coordonnées GPS (précises)</label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="text-sm btn btn-secondary py-1 px-3"
                  >
                    📍 Ma position
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.start_lat}
                      onChange={(e) => setFormData({ ...formData, start_lat: e.target.value })}
                      className="input"
                      placeholder="Ex: 45.764043"
                    />
                  </div>
                  <div>
                    <label className="label">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.start_lng}
                      onChange={(e) => setFormData({ ...formData, start_lng: e.target.value })}
                      className="input"
                      placeholder="Ex: 4.835659"
                    />
                  </div>
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
                  <strong>💡 Astuce :</strong> Pour obtenir des coordonnées précises :
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Utilisez Google Maps : clic droit sur un point → coordonnées</li>
                    <li>Cliquez sur "Ma position" pour utiliser votre localisation actuelle</li>
                    <li>L'itinéraire démarrera à ~2-3 km de ce point si vous précisez les coordonnées</li>
                  </ul>
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">📋 Résumé de l'itinéraire</h3>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Distance :</strong> {formData.distance_km} km</li>
                  <li>• <strong>Type :</strong> {routeTypeLabels[formData.route_type]}</li>
                  <li>• <strong>Dénivelé :</strong> {formData.elevation_preference === 'flat' ? 'Plat' : formData.elevation_preference === 'moderate' ? 'Modéré' : 'Vallonné'}</li>
                  <li>• <strong>Format :</strong> {formData.loop ? 'Boucle' : 'Aller-retour'}</li>
                  {formData.start_location && (
                    <li>• <strong>Départ :</strong> {formData.start_location}</li>
                  )}
                  {formData.start_lat && formData.start_lng && (
                    <li>• <strong>GPS :</strong> {formData.start_lat}°, {formData.start_lng}°</li>
                  )}
                </ul>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="btn btn-secondary flex-1"
                  disabled={generating}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={generating}
                >
                  {generating ? '⏳ Génération en cours...' : '🚀 Générer l\'itinéraire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
