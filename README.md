# RunAI - Plateforme d'Entraînement Running avec IA

Une plateforme complète d'entraînement pour coureurs avec planification assistée par IA, génération d'itinéraires et suivi des objectifs.

## Fonctionnalités

### 🎯 Gestion des Objectifs
- Création et suivi de multiples objectifs de course (10km, semi-marathon, marathon, trail, ultra)
- Définition de dates cibles et niveaux actuels
- Planification multi-objectifs intelligente

### 🤖 Planification IA des Entraînements
- Génération automatique de plans d'entraînement personnalisés
- Adaptation selon le niveau, disponibilité et objectifs
- Descriptions détaillées de chaque séance (échauffement, corps, récupération)
- Types de séances variés : endurance, fractionné, tempo, sortie longue, récupération

### 🗺️ Recherche d'Itinéraires
- Génération d'itinéraires trail et route
- Adaptation selon la distance et le dénivelé souhaité
- Points de départ personnalisables
- Informations détaillées : distance, dénivelé, type de terrain

### 📊 Suivi et Analyses
- Historique complet des entraînements
- Graphiques de progression
- Statistiques hebdomadaires/mensuelles
- Taux de complétion des séances

### 👤 Profil Utilisateur
- Niveau de course (débutant, intermédiaire, avancé, expert)
- Historique de performances
- Disponibilité d'entraînement
- Préférences de terrain

## Architecture Technique

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Base de données**: PostgreSQL
- **ORM**: SQLAlchemy
- **IA**: Anthropic Claude API
- **Cartographie**: OpenStreetMap + SRTM pour le dénivelé

### Frontend
- **Framework**: React 18 + TypeScript
- **UI**: Tailwind CSS + Shadcn/UI
- **État**: React Query + Context API
- **Cartes**: Leaflet / Mapbox
- **Graphiques**: Recharts

### Infrastructure
- **Conteneurisation**: Docker + Docker Compose
- **API Documentation**: OpenAPI/Swagger
- **Tests**: Pytest + React Testing Library

## Installation

### Prérequis
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### Développement Local

1. Cloner le repository
```bash
git clone <repository-url>
cd site_training
```

2. Configuration des variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos clés API
```

3. Lancer avec Docker
```bash
docker-compose up -d
```

4. Accéder à l'application
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Documentation API: http://localhost:8000/docs

### Installation Manuelle

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Utilisation

### 1. Créer un Compte
Inscrivez-vous avec email et mot de passe

### 2. Compléter votre Profil
- Niveau de course actuel
- Meilleur temps sur différentes distances
- Disponibilité hebdomadaire
- Préférences (trail/route)

### 3. Définir des Objectifs
- Type de course (10km, semi, marathon, trail, ultra)
- Date de l'objectif
- Temps visé
- Priorité

### 4. Générer un Plan d'Entraînement
L'IA analyse votre profil et génère un plan personnalisé avec :
- Séances hebdomadaires adaptées
- Progression intelligente
- Descriptions détaillées de chaque entraînement
- Recommandations d'itinéraires

### 5. Suivre vos Entraînements
- Marquer les séances comme complétées
- Ajouter des notes et ressentis
- Visualiser votre progression

## Structure du Projet

```
site_training/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── goals.py
│   │   │   │   ├── training_plans.py
│   │   │   │   ├── workouts.py
│   │   │   │   └── routes.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── goal.py
│   │   │   ├── training_plan.py
│   │   │   ├── workout.py
│   │   │   └── route.py
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── ai_planner.py
│   │   │   ├── route_finder.py
│   │   │   └── workout_generator.py
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── goals/
│   │   │   ├── training/
│   │   │   ├── routes/
│   │   │   └── shared/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Users
- `GET /api/users/me` - Profil utilisateur
- `PUT /api/users/me` - Mettre à jour le profil
- `GET /api/users/me/stats` - Statistiques

### Goals
- `GET /api/goals` - Liste des objectifs
- `POST /api/goals` - Créer un objectif
- `GET /api/goals/{id}` - Détails d'un objectif
- `PUT /api/goals/{id}` - Modifier un objectif
- `DELETE /api/goals/{id}` - Supprimer un objectif

### Training Plans
- `GET /api/training-plans` - Liste des plans
- `POST /api/training-plans/generate` - Générer un plan avec l'IA
- `GET /api/training-plans/{id}` - Détails d'un plan
- `PUT /api/training-plans/{id}/workouts/{workout_id}` - Marquer séance complétée

### Workouts
- `GET /api/workouts` - Liste des séances
- `GET /api/workouts/{id}` - Détails d'une séance
- `POST /api/workouts/{id}/complete` - Marquer comme complétée
- `POST /api/workouts/{id}/notes` - Ajouter des notes

### Routes
- `POST /api/routes/generate` - Générer un itinéraire
- `GET /api/routes` - Historique des itinéraires
- `GET /api/routes/{id}` - Détails d'un itinéraire

## Variables d'Environnement

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/runai

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Anthropic AI
ANTHROPIC_API_KEY=your-anthropic-api-key

# Maps API (optional)
MAPBOX_TOKEN=your-mapbox-token
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=your-mapbox-token
```

## Contribution

Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

MIT

## Support

Pour toute question ou problème, ouvrir une issue sur GitHub.
