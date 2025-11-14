import { useEffect, useState } from 'react';
import { trainingService } from '../services/training.service';
import { Workout } from '../types';
import { Calendar, Clock, MapPin, CheckCircle2, Circle } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const Workouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

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
      setSelectedWorkout(null);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erreur');
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

  const intensityColors: Record<string, string> = {
    very_easy: 'bg-green-100 text-green-800',
    easy: 'bg-blue-100 text-blue-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    very_hard: 'bg-red-100 text-red-800',
  };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekStart = addDays(weekStart, weekOffset * 7);

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mes séances</h1>
        <p className="text-gray-600">Planning hebdomadaire</p>
      </div>

      {/* Week navigator */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="btn btn-secondary"
          >
            ← Semaine précédente
          </button>

          <div className="text-center">
            <div className="text-lg font-semibold">
              Semaine du {format(currentWeekStart, 'dd MMMM yyyy', { locale: fr })}
            </div>
            {weekOffset === 0 && (
              <div className="text-sm text-primary-600 mt-1">Semaine en cours</div>
            )}
          </div>

          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="btn btn-secondary"
          >
            Semaine suivante →
          </button>
        </div>
      </div>

      {/* Workouts list */}
      {workouts.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Aucune séance cette semaine</h2>
          <p className="text-gray-600">Générez un plan d'entraînement pour commencer</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className={`card cursor-pointer transition-all ${
                workout.is_completed
                  ? 'bg-green-50 border-green-200'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedWorkout(workout)}
            >
              <div className="flex items-start gap-6">
                {/* Completion checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteWorkout(workout);
                  }}
                  className="mt-1"
                >
                  {workout.is_completed ? (
                    <CheckCircle2 className="text-green-600" size={28} />
                  ) : (
                    <Circle className="text-gray-300 hover:text-primary-500" size={28} />
                  )}
                </button>

                {/* Workout details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{workout.name}</h3>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            intensityColors[workout.intensity] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {workoutTypeLabels[workout.workout_type] || workout.workout_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {format(new Date(workout.scheduled_date), 'EEEE dd MMMM', { locale: fr })}
                    </div>

                    {workout.distance_km && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {workout.distance_km}km
                      </div>
                    )}

                    {workout.duration_minutes && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {workout.duration_minutes}min
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 line-clamp-2">{workout.description}</p>

                  {selectedWorkout?.id === workout.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-4">
                        {workout.warmup_description && (
                          <div>
                            <h4 className="font-semibold mb-2">Échauffement</h4>
                            <p className="text-gray-700">{workout.warmup_description}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold mb-2">Corps de séance</h4>
                          <p className="text-gray-700">{workout.main_set_description}</p>
                        </div>

                        {workout.cooldown_description && (
                          <div>
                            <h4 className="font-semibold mb-2">Retour au calme</h4>
                            <p className="text-gray-700">{workout.cooldown_description}</p>
                          </div>
                        )}

                        {workout.target_pace_min && workout.target_pace_max && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Allure cible</h4>
                            <p className="text-gray-700">
                              {Math.floor(workout.target_pace_min / 60)}:
                              {String(workout.target_pace_min % 60).padStart(2, '0')} -{' '}
                              {Math.floor(workout.target_pace_max / 60)}:
                              {String(workout.target_pace_max % 60).padStart(2, '0')} /km
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workouts;
