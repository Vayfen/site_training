import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalsService } from '../services/goals.service';
import { Goal } from '../types';
import { Plus, Target, Calendar, MapPin, Trophy, Edit2, Trash2, Zap, TrendingUp, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button, Card, Modal, Badge } from '../components/ui';

const Goals = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const raceTypes = [
    { value: '5k', label: '5km', distance: 5 },
    { value: '10k', label: '10km', distance: 10 },
    { value: 'half_marathon', label: 'Semi-marathon', distance: 21.1 },
    { value: 'marathon', label: 'Marathon', distance: 42.2 },
    { value: 'trail_short', label: 'Trail court (<25km)', distance: 20 },
    { value: 'trail_medium', label: 'Trail moyen (25-50km)', distance: 35 },
    { value: 'trail_long', label: 'Trail long (50-80km)', distance: 65 },
    { value: 'ultra_trail', label: 'Ultra trail (>80km)', distance: 100 },
  ];

  const handleRaceTypeChange = (raceType: string) => {
    const selected = raceTypes.find(rt => rt.value === raceType);
    setFormData({
      ...formData,
      race_type: raceType,
      distance_km: selected?.distance || 10,
    });
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
      if (formData.race_name) goalData.race_name = formData.race_name;
      if (formData.race_location) goalData.race_location = formData.race_location;

      await goalsService.createGoal(goalData);
      await loadGoals();
      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setFormData({
      name: goal.name,
      race_type: goal.race_type,
      target_date: goal.target_date.split('T')[0],
      target_time_seconds: goal.target_time_seconds ? String(goal.target_time_seconds / 60) : '',
      race_name: goal.race_name || '',
      race_location: goal.race_location || '',
      distance_km: goal.distance_km,
      elevation_gain_m: goal.elevation_gain_m,
      priority: goal.priority,
    });
    setShowEditModal(true);
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setEditing(true);

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
      if (formData.race_name) goalData.race_name = formData.race_name;
      if (formData.race_location) goalData.race_location = formData.race_location;

      await goalsService.updateGoal(selectedGoal.id, goalData);
      await loadGoals();
      setShowEditModal(false);
      setSelectedGoal(null);
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowDeleteModal(true);
  };

  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;
    setDeleting(true);

    try {
      await goalsService.deleteGoal(selectedGoal.id);
      await loadGoals();
      setShowDeleteModal(false);
      setSelectedGoal(null);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
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
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'danger' | 'warning' | 'info'> = {
      high: 'danger',
      medium: 'warning',
      low: 'info',
    };
    return variants[priority] || 'info';
  };

  const getRaceTypeLabel = (raceType: string) => {
    return raceTypes.find(rt => rt.value === raceType)?.label || raceType;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            Mes Objectifs
          </h1>
          <p className="text-gray-400 mt-2">
            Définissez vos objectifs et générez vos plans d'entraînement
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-5 h-5" />}
          size="lg"
        >
          Nouvel objectif
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="text-center py-16" variant="glass">
          <Target className="w-20 h-20 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucun objectif</h3>
          <p className="text-gray-500 mb-6">Commencez par créer votre premier objectif de course</p>
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-5 h-5" />}
          >
            Créer un objectif
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card
              key={goal.id}
              variant="gradient"
              hover
              className="group animate-slideInUp"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getPriorityBadge(goal.priority)} size="sm">
                      {goal.priority === 'high' ? 'Prioritaire' : goal.priority === 'medium' ? 'Moyen' : 'Bas'}
                    </Badge>
                    <Badge variant="primary" size="sm">
                      {getRaceTypeLabel(goal.race_type)}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all">
                    {goal.name}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(goal)}
                    icon={<Edit2 className="w-4 h-4" />}
                    className="!p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(goal)}
                    icon={<Trash2 className="w-4 h-4" />}
                    className="!p-2 opacity-0 group-hover:opacity-100 transition-opacity !text-red-400"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">
                    {format(new Date(goal.target_date), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                  <Badge variant="info" size="sm">
                    {(goal as any).days_until_race} jours
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">{goal.distance_km} km</span>
                  {goal.elevation_gain_m > 0 && (
                    <span className="text-xs text-gray-400">• {goal.elevation_gain_m}m D+</span>
                  )}
                </div>

                {goal.race_location && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{goal.race_location}</span>
                  </div>
                )}
              </div>

              {/* Progress */}
              {(goal as any).has_training_plan && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-300">Plan d'entraînement</span>
                    <span className="text-sm font-semibold text-blue-400">
                      {Math.round((goal as any).training_completion_rate || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-900/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(goal as any).training_completion_rate || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {(goal as any).has_training_plan ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/training-plans')}
                    icon={<ExternalLink className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Voir le plan
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => navigate('/training-plans')}
                    icon={<TrendingUp className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Générer un plan
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedGoal(null);
          resetForm();
        }}
        title={showEditModal ? 'Modifier l\'objectif' : 'Créer un nouvel objectif'}
        size="lg"
      >
        <form onSubmit={showEditModal ? handleUpdateGoal : handleCreateGoal} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Nom de l'objectif *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Marathon de Paris 2024"
                required
              />
            </div>

            <div>
              <label className="label">Type de course *</label>
              <select
                className="input"
                value={formData.race_type}
                onChange={(e) => handleRaceTypeChange(e.target.value)}
                required
              >
                {raceTypes.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Date de la course *</label>
              <input
                type="date"
                className="input"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Distance (km) *</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={formData.distance_km}
                onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="label">Dénivelé (m)</label>
              <input
                type="number"
                className="input"
                value={formData.elevation_gain_m}
                onChange={(e) => setFormData({ ...formData, elevation_gain_m: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="label">Temps objectif (minutes)</label>
              <input
                type="number"
                className="input"
                value={formData.target_time_seconds}
                onChange={(e) => setFormData({ ...formData, target_time_seconds: e.target.value })}
                placeholder="Ex: 210 pour 3h30"
              />
            </div>

            <div>
              <label className="label">Priorité *</label>
              <select
                className="input"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                required
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">Nom de la course</label>
              <input
                type="text"
                className="input"
                value={formData.race_name}
                onChange={(e) => setFormData({ ...formData, race_name: e.target.value })}
                placeholder="Ex: Marathon de Paris"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Lieu de la course</label>
              <input
                type="text"
                className="input"
                value={formData.race_location}
                onChange={(e) => setFormData({ ...formData, race_location: e.target.value })}
                placeholder="Ex: Paris, France"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedGoal(null);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creating || editing}
            >
              {showEditModal ? 'Mettre à jour' : 'Créer l\'objectif'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedGoal(null);
        }}
        title="Supprimer l'objectif"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Êtes-vous sûr de vouloir supprimer l'objectif <span className="font-bold text-white">"{selectedGoal?.name}"</span> ?
          </p>
          <p className="text-sm text-gray-400">
            Cette action supprimera également tous les plans d'entraînement associés.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedGoal(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteGoal}
              loading={deleting}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Goals;
