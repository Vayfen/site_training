import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersService } from '../services/users.service';
import { goalsService } from '../services/goals.service';
import { trainingService } from '../services/training.service';
import { UserStats, Goal, Workout } from '../types';
import { Target, Calendar, TrendingUp, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, goalsData, workoutsData] = await Promise.all([
        usersService.getStats(),
        goalsService.getGoals(true),
        trainingService.getWorkouts({ upcoming: true }),
      ]);

      setStats(statsData);
      setGoals(goalsData);
      setUpcomingWorkouts(workoutsData.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Objectifs actifs</p>
              <p className="text-3xl font-bold mt-1">{stats?.active_goals || 0}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Target className="text-primary-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de complétion</p>
              <p className="text-3xl font-bold mt-1">{stats?.completion_rate || 0}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Distance totale</p>
              <p className="text-3xl font-bold mt-1">{stats?.total_distance_km || 0} km</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Activity className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cette semaine</p>
              <p className="text-3xl font-bold mt-1">{stats?.current_week_workouts || 0} séances</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Goals */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Objectifs actifs</h2>
            <Link to="/goals" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Voir tout
            </Link>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucun objectif actif</p>
              <Link to="/goals" className="btn btn-primary mt-4 inline-block">
                Créer un objectif
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{goal.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {goal.distance_km}km - {goal.race_type}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {goal.days_until_race !== undefined && goal.days_until_race > 0
                          ? `Dans ${goal.days_until_race} jours`
                          : 'Aujourd\'hui'}
                      </p>
                    </div>
                    {goal.training_completion_rate !== null && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          {Math.round(goal.training_completion_rate || 0)}%
                        </div>
                        <div className="text-xs text-gray-500">complété</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Workouts */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Prochaines séances</h2>
            <Link to="/workouts" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Voir tout
            </Link>
          </div>

          {upcomingWorkouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucune séance programmée</p>
              <Link to="/training-plans" className="btn btn-primary mt-4 inline-block">
                Créer un plan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingWorkouts.map((workout) => (
                <Link
                  key={workout.id}
                  to="/workouts"
                  className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{workout.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {workout.distance_km && `${workout.distance_km}km`}
                        {workout.duration_minutes && ` - ${workout.duration_minutes}min`}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {format(new Date(workout.scheduled_date), 'dd MMM', { locale: fr })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
