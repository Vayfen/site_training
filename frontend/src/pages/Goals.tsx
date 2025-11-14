import { useEffect, useState } from 'react';
import { goalsService } from '../services/goals.service';
import { Goal } from '../types';
import { Plus, Target, Calendar, MapPin, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    </div>
  );
};

export default Goals;
