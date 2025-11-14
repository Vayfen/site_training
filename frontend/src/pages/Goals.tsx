import { useEffect, useState } from 'react';
import { goalsService } from '../services/goals.service';
import { Goal } from '../types';
import { Plus, Target, Calendar, MapPin, Trophy, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    race_type: '10k',
    target_date: '',
    target_time_seconds: '',
    race_name: '',
    race_location: '',
    distance_km: 10,
    elevation_gain_m: 0,
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await goalsService.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const goalData: any = {
        name: formData.name,
        race_type: formData.race_type,
        target_date: new Date(formData.target_date).toISOString(),
        distance_km: formData.distance_km,
        elevation_gain_m: formData.elevation_gain_m,
        priority: formData.priority,
      };

      if (formData.target_time_seconds) {
        goalData.target_time_seconds = parseInt(formData.target_time_seconds) * 60;
      }

      if (formData.race_name) {
        goalData.race_name = formData.race_name;
      }

      if (formData.race_location) {
        goalData.race_location = formData.race_location;
      }

      await goalsService.createGoal(goalData);
      await loadGoals();
      setShowCreateModal(false);

      // Reset form
      setFormData({
        name: '',
        race_type: '10k',
        target_date: '',
        target_time_seconds: '',
        race_name: '',
        race_location: '',
        distance_km: 10,
        elevation_gain_m: 0,
        priority: 'medium',
      });
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const raceTypes = [
    { value: '5k', label: '5km', distance: 5 },
    { value: '10k', label: '10km', distance: 10 },
    { value: 'half_marathon', label: 'Semi-marathon', distance: 21.1 },
    { value: 'marathon', label: 'Marathon', distance: 42.2 },
    { value: 'trail_short', label: 'Trail court (<25km)', distance: 20 },
    { value: 'trail_medium', label: 'Trail moyen (25-50km)', distance: 35 },
    { value: 'trail_long', label: 'Trail long (50-80km)', distance: 65 },
    { value: 'ultra', label: 'Ultra (>80km)', distance: 100 },
  ];

  const raceTypeLabels: Record<string, string> = {
    '5k': '5km',
    '10k': '10km',
    'half_marathon': 'Semi-marathon',
    'marathon': 'Marathon',
    'trail_short': 'Trail court (<25km)',
    'trail_medium': 'Trail moyen (25-50km)',
    'trail_long': 'Trail long (50-80km)',
    'ultra': 'Ultra (>80km)',
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800',
  };

  const handleRaceTypeChange = (raceType: string) => {
    const selectedType = raceTypes.find(t => t.value === raceType);
    setFormData({
      ...formData,
      race_type: raceType,
      distance_km: selectedType?.distance || 10,
    });
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes objectifs</h1>
          <p className="text-gray-600 mt-2">Gérez vos objectifs de course</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nouvel objectif
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card text-center py-12">
          <Target size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Aucun objectif</h2>
          <p className="text-gray-600 mb-6">
            Créez votre premier objectif pour commencer votre entraînement
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            Créer un objectif
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{goal.name}</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      priorityColors[goal.priority]
                    }`}
                  >
                    {goal.priority === 'high' ? 'Priorité haute' : goal.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                  </span>
                </div>
                {!goal.is_completed && goal.is_active && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Trophy size={18} className="text-gray-400" />
                  <span>{raceTypeLabels[goal.race_type] || goal.race_type}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Target size={18} className="text-gray-400" />
                  <span>{goal.distance_km}km</span>
                  {goal.elevation_gain_m > 0 && (
                    <span className="text-sm text-gray-500">+{goal.elevation_gain_m}m D+</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar size={18} className="text-gray-400" />
                  <span>{format(new Date(goal.target_date), 'dd MMMM yyyy', { locale: fr })}</span>
                </div>

                {goal.race_location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-sm">{goal.race_location}</span>
                  </div>
                )}
              </div>

              {goal.days_until_race !== undefined && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {goal.days_until_race > 0
                        ? `Dans ${goal.days_until_race} jours`
                        : goal.days_until_race === 0
                        ? "Aujourd'hui !"
                        : 'Terminé'}
                    </span>
                    {goal.has_training_plan && goal.training_completion_rate !== null && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">
                          {Math.round(goal.training_completion_rate)}%
                        </div>
                        <div className="text-xs text-gray-500">Plan complété</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!goal.has_training_plan && goal.is_active && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="btn btn-primary w-full text-sm">
                    Générer un plan d'entraînement
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Créer un nouvel objectif</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-6">
              {/* Nom de l'objectif */}
              <div>
                <label className="label">Nom de l'objectif *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Ex: Marathon de Paris 2025"
                  required
                />
              </div>

              {/* Type de course */}
              <div>
                <label className="label">Type de course *</label>
                <select
                  value={formData.race_type}
                  onChange={(e) => handleRaceTypeChange(e.target.value)}
                  className="input"
                  required
                >
                  {raceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance et Dénivelé */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Distance (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance_km}
                    onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Dénivelé positif (m)</label>
                  <input
                    type="number"
                    value={formData.elevation_gain_m}
                    onChange={(e) => setFormData({ ...formData, elevation_gain_m: parseInt(e.target.value) })}
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Date et Temps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date de l'objectif *</label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="label">Temps visé (minutes)</label>
                  <input
                    type="number"
                    value={formData.target_time_seconds}
                    onChange={(e) => setFormData({ ...formData, target_time_seconds: e.target.value })}
                    className="input"
                    placeholder="Ex: 240 (pour 4h)"
                  />
                </div>
              </div>

              {/* Nom et Lieu de la course */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nom de la course</label>
                  <input
                    type="text"
                    value={formData.race_name}
                    onChange={(e) => setFormData({ ...formData, race_name: e.target.value })}
                    className="input"
                    placeholder="Ex: Marathon de Paris"
                  />
                </div>
                <div>
                  <label className="label">Lieu</label>
                  <input
                    type="text"
                    value={formData.race_location}
                    onChange={(e) => setFormData({ ...formData, race_location: e.target.value })}
                    className="input"
                    placeholder="Ex: Paris, France"
                  />
                </div>
              </div>

              {/* Priorité */}
              <div>
                <label className="label">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="input"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                  disabled={creating}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={creating}
                >
                  {creating ? 'Création...' : 'Créer l\'objectif'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
