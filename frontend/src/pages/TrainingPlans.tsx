import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingService } from '../services/training.service';
import { goalsService } from '../services/goals.service';
import { TrainingPlan, Goal } from '../types';
import { Calendar, Target, TrendingUp, Sparkles, Trash2, Play } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button, Card, Modal, Badge } from '../components/ui';

const TrainingPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [availableGoals, setAvailableGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<TrainingPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      const goalsWithoutPlan = goalsData.filter(g => !(g as any).has_training_plan);
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

  const handleDeleteClick = (plan: TrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    setDeleting(true);

    try {
      await trainingService.deleteTrainingPlan(planToDelete.id);
      await loadData();
      setShowDeleteModal(false);
      setPlanToDelete(null);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
          <Calendar className="w-10 h-10" />
          Plans d'Entraînement
        </h1>
        <p className="text-gray-300 mt-2">
          Plans personnalisés générés avec variété de séances
        </p>
      </div>

      {/* Generate new plan section */}
      {availableGoals.length > 0 && (
        <Card variant="gradient" className="border-blue-500/40">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg shadow-blue-600/40">
              <Sparkles className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                Générer un nouveau plan
                <Badge variant="purple" size="sm">IA</Badge>
              </h2>
              <p className="text-gray-300 mb-4">
                Créez un plan d'entraînement personnalisé avec 15+ types de séances variées
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

                <Button
                  onClick={() => selectedGoal && handleGeneratePlan(selectedGoal)}
                  disabled={!selectedGoal || generating}
                  loading={generating}
                  icon={<Sparkles className="w-5 h-5" />}
                  size="lg"
                >
                  {generating ? 'Génération...' : 'Générer'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Existing plans */}
      {plans.length === 0 ? (
        <Card className="text-center py-16" variant="glass">
          <Calendar size={64} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-2 text-gray-300">Aucun plan d'entraînement</h2>
          <p className="text-gray-400 mb-6">
            {availableGoals.length > 0
              ? 'Générez votre premier plan ci-dessus'
              : 'Créez un objectif pour commencer'}
          </p>
          {availableGoals.length === 0 && (
            <Button onClick={() => navigate('/goals')}>
              Créer un objectif
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant="gradient"
              hover
              className="group cursor-pointer"
              onClick={() => navigate(`/workouts`)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:gradient-text transition-all">
                      {plan.name}
                    </h3>
                    {plan.generated_by_ai && (
                      <Badge variant="purple">
                        <Sparkles className="w-3 h-3 mr-1 inline" />
                        IA
                      </Badge>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-gray-300">{plan.description}</p>
                  )}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteClick(plan, e)}
                    icon={<Trash2 className="w-4 h-4" />}
                    className="!p-2 opacity-0 group-hover:opacity-100 transition-opacity !text-red-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/40">
                    <Calendar className="text-blue-400" size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Durée</p>
                    <p className="font-semibold text-white text-lg">{plan.duration_weeks} semaines</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/40">
                    <Target className="text-green-400" size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Séances</p>
                    <p className="font-semibold text-white text-lg">
                      {plan.completed_workouts || 0}/{plan.total_workouts || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/40">
                    <TrendingUp className="text-purple-400" size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Progression</p>
                    <p className="font-semibold text-white text-lg">{Math.round(plan.completion_rate || 0)}%</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="w-full bg-slate-900/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-green-500/50"
                    style={{ width: `${plan.completion_rate || 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-600/50">
                <div className="text-sm text-gray-400">
                  Du {format(new Date(plan.start_date), 'dd MMM', { locale: fr })} au{' '}
                  {format(new Date(plan.end_date), 'dd MMM yyyy', { locale: fr })}
                </div>

                <div className="text-sm text-blue-400 font-medium flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Cliquez pour voir les séances
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPlanToDelete(null);
        }}
        title="Supprimer le plan d'entraînement"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Êtes-vous sûr de vouloir supprimer le plan <span className="font-bold text-white">"{planToDelete?.name}"</span> ?
          </p>
          <p className="text-sm text-gray-400">
            Cette action supprimera toutes les séances associées.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setPlanToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePlan}
              loading={deleting}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TrainingPlans;
