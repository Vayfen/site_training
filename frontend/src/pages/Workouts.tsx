import { useEffect, useState } from 'react';
import { trainingService } from '../services/training.service';
import { Workout } from '../types';
import { Calendar, Clock, MapPin, CheckCircle2, Circle, ChevronDown, ChevronUp, Home, Trash2, Flame } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button, Card, Badge, Modal } from '../components/ui';

const Workouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadWorkouts();
  }, [weekOffset]);

  const loadWorkouts = async () => {
    try {
      const data = await trainingService.getWeekWorkouts(weekOffset);
      setWorkouts(data);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkout = async (workout: Workout) => {
    try {
      if (workout.is_completed) {
        await trainingService.uncompleteWorkout(workout.id);
      } else {
        await trainingService.completeWorkout(workout.id, {
          actual_distance_km: workout.distance_km || undefined,
          actual_duration_minutes: workout.duration_minutes || undefined,
        });
      }
      await loadWorkouts();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur');
    }
  };

  const toggleWorkout = (workoutId: number) => {
    setExpandedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  };

  const handleDeleteClick = (workout: Workout, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkoutToDelete(workout);
    setShowDeleteModal(true);
  };

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return;
    setDeleting(true);

    try {
      await trainingService.deleteWorkout(workoutToDelete.id);
      await loadWorkouts();
      setShowDeleteModal(false);
      setWorkoutToDelete(null);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const workoutTypeLabels: Record<string, string> = {
    easy_run: 'Endurance',
    long_run: 'Sortie longue',
    tempo: 'Tempo',
    intervals: 'Fractionné',
    hill_repeats: 'Côtes',
    fartlek: 'Fartlek',
    recovery: 'Récupération',
    race_pace: 'Allure course',
    progression: 'Progression',
    rest: 'Repos',
  };

  const intensityVariants: Record<string, 'success' | 'primary' | 'warning' | 'danger'> = {
    very_easy: 'success',
    easy: 'primary',
    moderate: 'warning',
    hard: 'danger',
    very_hard: 'danger',
  };

  const intensityLabels: Record<string, string> = {
    very_easy: 'Très facile',
    easy: 'Facile',
    moderate: 'Modéré',
    hard: 'Difficile',
    very_hard: 'Très difficile',
  };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekStart = addDays(weekStart, weekOffset * 7);
  const isCurrentWeek = weekOffset === 0;

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
          <Flame className="w-10 h-10" />
          Mes Séances
        </h1>
        <p className="text-gray-300 mt-2">
          Planning hebdomadaire de vos entraînements
        </p>
      </div>

      {/* Week navigator */}
      <Card variant="gradient">
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={() => setWeekOffset(weekOffset - 1)}
            variant="secondary"
            size="lg"
          >
            ← Précédente
          </Button>

          <div className="flex-1 text-center">
            <div className="text-xl font-bold text-white">
              {format(currentWeekStart, 'dd MMMM yyyy', { locale: fr })}
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              {isCurrentWeek ? (
                <Badge variant="success" size="lg">
                  <Home className="w-3 h-3 mr-1 inline" />
                  Semaine en cours
                </Badge>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setWeekOffset(0)}
                  icon={<Home className="w-4 h-4" />}
                >
                  Semaine actuelle
                </Button>
              )}
            </div>
          </div>

          <Button
            onClick={() => setWeekOffset(weekOffset + 1)}
            variant="secondary"
            size="lg"
          >
            Suivante →
          </Button>
        </div>
      </Card>

      {/* Workouts list */}
      {workouts.length === 0 ? (
        <Card className="text-center py-16" variant="glass">
          <Calendar size={64} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-2 text-gray-300">Aucune séance cette semaine</h2>
          <p className="text-gray-400">Générez un plan d'entraînement pour commencer</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => {
            const isExpanded = expandedWorkouts.has(workout.id);
            return (
              <Card
                key={workout.id}
                variant={workout.is_completed ? 'default' : 'gradient'}
                hover
                className={`group cursor-pointer ${
                  workout.is_completed ? 'border-green-500/40' : ''
                }`}
                onClick={() => toggleWorkout(workout.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Completion checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompleteWorkout(workout);
                    }}
                    className="mt-1 flex-shrink-0"
                  >
                    {workout.is_completed ? (
                      <CheckCircle2 className="text-green-500 w-8 h-8" />
                    ) : (
                      <Circle className="text-gray-500 hover:text-blue-400 w-8 h-8 transition-colors" />
                    )}
                  </button>

                  {/* Workout details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 ${workout.is_completed ? 'text-green-400' : 'text-white'}`}>
                          {workout.name}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant={intensityVariants[workout.intensity] || 'info'}>
                            {intensityLabels[workout.intensity] || workout.intensity}
                          </Badge>
                          <Badge variant="primary">
                            {workoutTypeLabels[workout.workout_type] || workout.workout_type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWorkout(workout.id)}
                          icon={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          className="!p-2"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(workout, e)}
                          icon={<Trash2 className="w-4 h-4" />}
                          className="!p-2 opacity-0 group-hover:opacity-100 transition-opacity !text-red-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        {format(new Date(workout.scheduled_date), 'EEEE dd MMMM', { locale: fr })}
                      </div>

                      {workout.distance_km && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-400" />
                          {workout.distance_km}km
                        </div>
                      )}

                      {workout.duration_minutes && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-400" />
                          {workout.duration_minutes}min
                        </div>
                      )}
                    </div>

                    <p className="text-gray-300 line-clamp-2">{workout.description}</p>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-slate-600/50 space-y-4 animate-slideInDown">
                        {workout.warmup_description && (
                          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30">
                            <h4 className="font-semibold mb-2 text-blue-400 flex items-center gap-2">
                              <Flame className="w-4 h-4" />
                              Échauffement
                            </h4>
                            <p className="text-gray-300">{workout.warmup_description}</p>
                          </div>
                        )}

                        <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/30">
                          <h4 className="font-semibold mb-2 text-purple-400 flex items-center gap-2">
                            <Flame className="w-4 h-4" />
                            Corps de séance
                          </h4>
                          <p className="text-gray-300">{workout.main_set_description}</p>
                        </div>

                        {workout.cooldown_description && (
                          <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30">
                            <h4 className="font-semibold mb-2 text-green-400 flex items-center gap-2">
                              <Flame className="w-4 h-4" />
                              Retour au calme
                            </h4>
                            <p className="text-gray-300">{workout.cooldown_description}</p>
                          </div>
                        )}

                        {workout.target_pace_min && workout.target_pace_max && (
                          <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/30">
                            <h4 className="font-semibold mb-2 text-orange-400">Allure cible</h4>
                            <p className="text-gray-300 font-mono text-lg">
                              {Math.floor(workout.target_pace_min / 60)}:
                              {String(workout.target_pace_min % 60).padStart(2, '0')} -{' '}
                              {Math.floor(workout.target_pace_max / 60)}:
                              {String(workout.target_pace_max % 60).padStart(2, '0')} /km
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setWorkoutToDelete(null);
        }}
        title="Supprimer la séance"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Êtes-vous sûr de vouloir supprimer la séance <span className="font-bold text-white">"{workoutToDelete?.name}"</span> ?
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setWorkoutToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteWorkout}
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

export default Workouts;
