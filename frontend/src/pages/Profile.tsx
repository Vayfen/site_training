import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersService } from '../services/users.service';
import { User as UserIcon, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    level: user?.level || 'beginner',
    weekly_availability_hours: user?.weekly_availability_hours || 5,
    preferred_training_days: user?.preferred_training_days || 3,
    prefers_trail: user?.prefers_trail || 'both',
    pr_5k: user?.pr_5k ? Math.floor(user.pr_5k / 60) : '',
    pr_10k: user?.pr_10k ? Math.floor(user.pr_10k / 60) : '',
    pr_half_marathon: user?.pr_half_marathon ? Math.floor(user.pr_half_marathon / 60) : '',
    pr_marathon: user?.pr_marathon ? Math.floor(user.pr_marathon / 60) : '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updateData: any = {
        full_name: formData.full_name,
        level: formData.level,
        weekly_availability_hours: formData.weekly_availability_hours,
        preferred_training_days: formData.preferred_training_days,
        prefers_trail: formData.prefers_trail,
      };

      // Convert times from minutes to seconds
      if (formData.pr_5k) updateData.pr_5k = Number(formData.pr_5k) * 60;
      if (formData.pr_10k) updateData.pr_10k = Number(formData.pr_10k) * 60;
      if (formData.pr_half_marathon) updateData.pr_half_marathon = Number(formData.pr_half_marathon) * 60;
      if (formData.pr_marathon) updateData.pr_marathon = Number(formData.pr_marathon) * 60;

      const updatedUser = await usersService.updateProfile(updateData);
      updateUser(updatedUser);
      setMessage('Profil mis à jour avec succès');
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mon profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('succès')
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserIcon size={24} />
              Informations de base
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input bg-gray-100"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <label className="label">Nom complet</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Running Profile */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4">Profil de coureur</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Niveau</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  className="input"
                >
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="label">Préférence de terrain</label>
                <select
                  value={formData.prefers_trail}
                  onChange={(e) => setFormData({ ...formData, prefers_trail: e.target.value })}
                  className="input"
                >
                  <option value="road">Route</option>
                  <option value="trail">Trail</option>
                  <option value="both">Les deux</option>
                </select>
              </div>

              <div>
                <label className="label">Disponibilité hebdomadaire (heures)</label>
                <input
                  type="number"
                  value={formData.weekly_availability_hours}
                  onChange={(e) => setFormData({ ...formData, weekly_availability_hours: Number(e.target.value) })}
                  className="input"
                  min="1"
                  max="30"
                />
              </div>

              <div>
                <label className="label">Nombre de séances par semaine</label>
                <input
                  type="number"
                  value={formData.preferred_training_days}
                  onChange={(e) => setFormData({ ...formData, preferred_training_days: Number(e.target.value) })}
                  className="input"
                  min="1"
                  max="7"
                />
              </div>
            </div>
          </div>

          {/* Personal Records */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4">Records personnels</h2>
            <p className="text-sm text-gray-600 mb-4">
              Entrez vos meilleurs temps en minutes (ex: 45 pour 45 minutes)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">5km (minutes)</label>
                <input
                  type="number"
                  value={formData.pr_5k}
                  onChange={(e) => setFormData({ ...formData, pr_5k: e.target.value as any })}
                  className="input"
                  placeholder="Ex: 25"
                />
              </div>

              <div>
                <label className="label">10km (minutes)</label>
                <input
                  type="number"
                  value={formData.pr_10k}
                  onChange={(e) => setFormData({ ...formData, pr_10k: e.target.value as any })}
                  className="input"
                  placeholder="Ex: 50"
                />
              </div>

              <div>
                <label className="label">Semi-marathon (minutes)</label>
                <input
                  type="number"
                  value={formData.pr_half_marathon}
                  onChange={(e) => setFormData({ ...formData, pr_half_marathon: e.target.value as any })}
                  className="input"
                  placeholder="Ex: 120"
                />
              </div>

              <div>
                <label className="label">Marathon (minutes)</label>
                <input
                  type="number"
                  value={formData.pr_marathon}
                  onChange={(e) => setFormData({ ...formData, pr_marathon: e.target.value as any })}
                  className="input"
                  placeholder="Ex: 240"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save size={20} />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
