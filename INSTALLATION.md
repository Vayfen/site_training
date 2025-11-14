# Guide d'Installation - RunAI

## Prérequis

- Docker et Docker Compose
- Node.js 18+ (pour le développement local)
- Python 3.11+ (pour le développement local)
- Une clé API Anthropic (Claude)

## Installation Rapide avec Docker

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd site_training
```

### 2. Configuration

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditez le fichier `.env` et ajoutez votre clé API Anthropic :

```env
ANTHROPIC_API_KEY=votre-clé-anthropic-ici
```

### 3. Lancer l'application

```bash
docker-compose up -d
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000
- Documentation API : http://localhost:8000/docs

### 4. Arrêter l'application

```bash
docker-compose down
```

## Installation pour le Développement

### Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Sur Linux/Mac :
source venv/bin/activate
# Sur Windows :
venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp ../.env.example ../.env
# Éditer .env avec vos paramètres

# Lancer le serveur
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur http://localhost:5173

## Configuration de la Base de Données

### Avec Docker

La base de données PostgreSQL est automatiquement configurée avec Docker Compose.

### Manuel

Si vous utilisez une base de données PostgreSQL existante :

1. Créez une base de données :
```sql
CREATE DATABASE runai_db;
CREATE USER runai_user WITH PASSWORD 'runai_password';
GRANT ALL PRIVILEGES ON DATABASE runai_db TO runai_user;
```

2. Mettez à jour `DATABASE_URL` dans votre fichier `.env` :
```env
DATABASE_URL=postgresql://runai_user:runai_password@localhost:5432/runai_db
```

## Configuration de l'API Anthropic

1. Créez un compte sur https://console.anthropic.com/
2. Générez une clé API
3. Ajoutez-la dans votre fichier `.env` :
```env
ANTHROPIC_API_KEY=sk-ant-...
```

## Vérification de l'Installation

### Backend

Visitez http://localhost:8000/health - vous devriez voir :
```json
{
  "status": "healthy",
  "service": "RunAI Backend"
}
```

### Frontend

Visitez http://localhost:3000 - vous devriez voir la page de connexion.

## Résolution des Problèmes

### Le backend ne démarre pas

- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez la variable `DATABASE_URL` dans `.env`
- Vérifiez les logs : `docker-compose logs backend`

### Le frontend ne se connecte pas au backend

- Vérifiez que le backend est accessible sur http://localhost:8000
- Vérifiez la variable `VITE_API_URL` dans `.env`
- Vérifiez les logs : `docker-compose logs frontend`

### Erreur "ANTHROPIC_API_KEY not set"

- Assurez-vous d'avoir ajouté votre clé API dans le fichier `.env`
- Redémarrez les conteneurs : `docker-compose restart`

### Port déjà utilisé

Si un port est déjà utilisé, modifiez-le dans `docker-compose.yml` :

```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Changez 8000 en 8001
```

## Tests

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm test
```

## Production

Pour déployer en production :

1. Utilisez des variables d'environnement sécurisées
2. Changez `SECRET_KEY` dans `.env`
3. Désactivez le mode debug : `DEBUG=false`
4. Utilisez un serveur de production (ex: Nginx + Gunicorn)
5. Configurez HTTPS
6. Configurez les backups de la base de données

## Support

Pour toute question, ouvrez une issue sur GitHub.
