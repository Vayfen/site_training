import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { trainingService } from '../services/training.service';
import { goalsService } from '../services/goals.service';
import { TrainingPlan, Goal } from '../types';
import { Calendar, Target, TrendingUp, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TrainingPlans = () => {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [availableGoals, setAvailableGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, goalsData] = await Promise.all([
        trainingService.getTrainingPlans(),
        goalsService.getGoals(true),
      ]);

      setPlans(plansData);

      // Filter goals that don't have a plan yet
      const goalsWithoutPlan = goalsData.filter(g => !g.has_training_plan);
      setAvailableGoals(goalsWithoutPlan);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (goalId: number) => {
    setGenerating(true);
    try {
      await trainingService.generateTrainingPlan({ goal_id: goalId });
      await loadData();
      setSelectedGoal(null);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur lors de la génération du plan');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plans d'entraînement</h1>
        <p className="text-gray-600">Vos plans générés par l'IA</p>
      </div>

      {/* Generate new plan section */}
      {availableGoals.length > 0 && (
        <div className="card mb-8 bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
          <div className="flex items-start gap-4">
            <div className="bg-primary-600 p-3 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Générer un nouveau plan</h2>
              <p className="text-gray-700 mb-4">
                Créez un plan d'entraînement personnalisé avec l'IA pour l'un de vos objectifs
              </p>

              <div className="flex gap-4">
                <select
                  value={selectedGoal || ''}
                  onChange={(e) => setSelectedGoal(Number(e.target.value))}
                  className="input flex-1"
                >
                  <option value="">Sélectionnez un objectif</option>
                  {availableGoals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name} - {goal.distance_km}km
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => selectedGoal && handleGeneratePlan(selectedGoal)}
                  disabled={!selectedGoal || generating}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  {generating ? 'Génération...' : 'Générer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing plans */}
      {plans.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Aucun plan d'entraînement</h2>
          <p className="text-gray-600 mb-6">
            {availableGoals.length > 0
              ? 'Générez votre premier plan ci-dessus'
              : 'Créez un objectif pour commencer'}
          </p>
          {availableGoals.length === 0 && (
            <Link to="/goals" className="btn btn-primary">
              Créer un objectif
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => (
            <div key={plan.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    {plan.generated_by_ai && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        <Sparkles size={14} />
                        IA
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-gray-600">{plan.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="font-semibold">{plan.duration_weeks} semaines</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Target className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Séances</p>
                    <p className="font-semibold">
                      {plan.completed_workouts || 0}/{plan.total_workouts || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <TrendingUp className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progression</p>
                    <p className="font-semibold">{Math.round(plan.completion_rate || 0)}%</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Du {format(new Date(plan.start_date), 'dd MMM', { locale: fr })} au{' '}
                  {format(new Date(plan.end_date), 'dd MMM yyyy', { locale: fr })}
                </div>

                <Link
                  to={`/workouts?plan_id=${plan.id}`}
                  className="btn btn-primary"
                >
                  Voir les séances
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingPlans;
