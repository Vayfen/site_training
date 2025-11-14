import { useEffect, useState } from 'react';
import { routesService } from '../services/routes.service';
import { Route } from '../types';
import { Map, Plus, Heart, TrendingUp, Mountain } from 'lucide-react';

const RoutesPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

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

  const handleGenerateRoute = async () => {
    setGenerating(true);
    try {
      await routesService.generateRoute({
        distance_km: 10,
        route_type: 'road',
        elevation_preference: 'moderate',
        loop: true,
      });
      await loadRoutes();
      setShowGenerateModal(false);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
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

      {/* Generate modal (simplified) */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Générer un itinéraire</h2>
            <p className="text-gray-600 mb-6">
              L'IA va générer un itinéraire personnalisé pour vous
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="btn btn-secondary flex-1"
                disabled={generating}
              >
                Annuler
              </button>
              <button
                onClick={handleGenerateRoute}
                className="btn btn-primary flex-1"
                disabled={generating}
              >
                {generating ? 'Génération...' : 'Générer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
