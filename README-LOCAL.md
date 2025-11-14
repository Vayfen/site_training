# RunAI - Plateforme d'Entraînement Running 100% Locale 🏃‍♂️

**Aucun frais d'API ! Tout fonctionne sur votre PC avec l'IA locale.**

Une plateforme complète d'entraînement pour coureurs avec planification assistée par IA locale (Ollama), génération d'itinéraires et suivi des objectifs. **Gratuit et sans connexion internet requise pour l'IA.**

## ✨ Fonctionnalités

### 🎯 Gestion des Objectifs
- Création et suivi de multiples objectifs de course
- Support de tous types : 5K, 10K, semi-marathon, marathon, trail, ultra
- Priorités et dates cibles

### 🤖 IA Locale (Ollama)
- **Génération de plans d'entraînement personnalisés** avec Llama 3.2
- **Pas de coûts d'API** - tout tourne sur votre machine
- Descriptions détaillées de chaque séance
- Adaptation au niveau et aux objectifs

### 📅 Planning Intelligent
- Séances hebdomadaires adaptées
- Descriptions précises (échauffement, corps, récupération)
- Allures personnalisées
- Suivi de progression

### 🗺️ Génération d'Itinéraires
- Routes trail et route personnalisées
- Génération avec dénivelé
- Sauvegarde de vos parcours favoris

### 📊 Statistiques
- Taux de complétion
- Distance et durée totales
- Progression hebdomadaire

## 🚀 Installation Rapide

### Windows

1. **Prérequis** :
   - [Python 3.11+](https://www.python.org/downloads/)
   - [Node.js 18+](https://nodejs.org/)
   - [Ollama](https://ollama.ai/download) (IA locale gratuite)

2. **Installation** :
   ```cmd
   # Double-cliquez sur le fichier ou exécutez :
   install-windows.bat
   ```

3. **Démarrage** :
   ```cmd
   # Double-cliquez sur :
   start-runai.bat
   ```

### Linux / Mac

1. **Prérequis** :
   - Python 3.11+ : `sudo apt install python3 python3-pip python3-venv` (Ubuntu/Debian)
   - Node.js 18+ : `sudo apt install nodejs npm` ou via [nvm](https://github.com/nvm-sh/nvm)
   - Ollama : `curl -fsSL https://ollama.ai/install.sh | sh`

2. **Installation** :
   ```bash
   chmod +x install-linux-mac.sh
   ./install-linux-mac.sh
   ```

3. **Démarrage** :
   ```bash
   ./start-runai.sh
   ```

## 🔧 Configuration de l'IA Locale (Ollama)

### Installation d'Ollama

**Windows / Mac** :
- Téléchargez sur https://ollama.ai/download
- Installez et lancez l'application

**Linux** :
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Téléchargement du modèle

Le script d'installation le fait automatiquement, mais vous pouvez aussi :

```bash
ollama pull llama3.2:3b
```

**Modèles recommandés** :
- `llama3.2:3b` (2 GB) - **Rapide, recommandé pour démarrer**
- `llama3.2:7b` (4 GB) - Plus précis, nécessite plus de RAM
- `mistral:7b` (4 GB) - Alternative performante

Pour changer de modèle, éditez `.env` :
```env
OLLAMA_MODEL=llama3.2:7b
```

## 📦 Structure du Projet

```
site_training/
├── backend/              # API FastAPI + SQLite
│   ├── app/
│   │   ├── api/         # Routes API
│   │   ├── services/    # Services IA (Ollama)
│   │   ├── models/      # Modèles DB
│   │   └── core/        # Configuration
│   └── requirements.txt
├── frontend/             # React + TypeScript
│   ├── src/
│   │   ├── pages/       # Pages principales
│   │   ├── services/    # API clients
│   │   └── components/  # Composants UI
│   └── package.json
├── install-windows.bat   # Installation Windows
├── install-linux-mac.sh  # Installation Linux/Mac
└── start-runai.sh/bat    # Scripts de démarrage
```

## 💾 Stockage des Données

Tout est stocké **localement sur votre PC** :

- **Windows** : `%APPDATA%\RunAI\runai.db`
- **Linux/Mac** : `~/.runai/runai.db`

Aucune donnée n'est envoyée sur internet !

## 🖥️ Accès à l'Application

Une fois démarré :
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs

## 📚 Utilisation

### 1. Créer un Compte
Inscrivez-vous avec un email et mot de passe (stockés localement)

### 2. Compléter votre Profil
- Niveau de course (débutant → expert)
- Records personnels
- Disponibilité hebdomadaire
- Préférences (trail/route)

### 3. Définir un Objectif
- Type de course (5K, 10K, marathon, trail...)
- Date de l'objectif
- Temps visé

### 4. Générer un Plan d'Entraînement
Cliquez sur "Générer un plan" - L'IA locale créera :
- Séances hebdomadaires personnalisées
- Descriptions détaillées de chaque entraînement
- Allures adaptées à votre niveau
- Progression intelligente

### 5. Suivre vos Entraînements
- Marquez les séances comme complétées
- Ajoutez vos performances réelles
- Visualisez votre progression

## ⚡ Performances

### Configuration Minimale
- **CPU** : Dual-core 2.0 GHz
- **RAM** : 8 GB (4 GB pour le système + 4 GB pour Ollama)
- **Disque** : 5 GB d'espace libre
- **OS** : Windows 10+, Ubuntu 20.04+, macOS 11+

### Configuration Recommandée
- **CPU** : Quad-core 2.5 GHz+
- **RAM** : 16 GB
- **Disque** : 10 GB SSD
- **GPU** : Optionnel (accélère l'IA)

### Temps de Génération
- Plan d'entraînement : 10-30 secondes
- Itinéraire : 5-15 secondes

*Note : Plus rapide avec un CPU puissant ou un GPU compatible*

## 🔒 Sécurité & Confidentialité

✅ **100% Local** - Aucune donnée personnelle n'est envoyée sur internet
✅ **Pas de tracking** - Aucune télémétrie
✅ **Open Source** - Code auditable
✅ **Vos données vous appartiennent** - Base de données SQLite locale

## 🛠️ Dépannage

### L'IA ne génère pas de plans

1. Vérifiez qu'Ollama tourne :
   ```bash
   ollama list
   ```

2. Téléchargez le modèle :
   ```bash
   ollama pull llama3.2:3b
   ```

3. Vérifiez les logs du backend

**Solution de secours** : L'application génère automatiquement un plan de base si l'IA échoue.

### Port déjà utilisé

Si le port 8000 ou 5173 est occupé, modifiez dans :
- Backend : `backend/app/core/config.py`
- Frontend : `frontend/vite.config.ts`

### Erreur SQLite

Supprimez la base de données et relancez :
```bash
# Windows
del %APPDATA%\RunAI\runai.db

# Linux/Mac
rm ~/.runai/runai.db
```

### Performance lente de l'IA

Options :
1. Utilisez un modèle plus petit : `llama3.2:3b` au lieu de `:7b`
2. Augmentez la RAM allouée
3. Utilisez un GPU (si disponible)

## 🚀 Optimisations Avancées

### Utiliser un GPU

Si vous avez une carte NVIDIA :
```bash
# Installez CUDA
# Puis relancez Ollama
```

### Mode Offline

L'application fonctionne **100% offline** une fois installée !

### Personnaliser les Prompts

Éditez `backend/app/services/ai_planner.py` pour modifier les prompts envoyés à l'IA.

## 📈 Roadmap

- [ ] Support GPU automatique
- [ ] Application desktop Electron
- [ ] Mode hors-ligne pour le frontend
- [ ] Import/Export de données
- [ ] Synchronisation entre appareils (optionnelle)
- [ ] Support de plus de LLMs locaux

## 🤝 Contribution

Contributions bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md)

## 📝 Licence

MIT - Utilisez librement, modifiez, distribuez

## 🆘 Support

- Issues GitHub : [Ouvrir une issue](https://github.com/votre-repo/issues)
- Documentation : Ce README + code commenté

## 🎉 Remerciements

- [Ollama](https://ollama.ai/) pour l'IA locale gratuite
- [FastAPI](https://fastapi.tiangolo.com/) pour le backend
- [React](https://react.dev/) pour le frontend
- La communauté open source !

---

**RunAI - Entraînement intelligent, privé et gratuit ! 🏃‍♂️💪**
