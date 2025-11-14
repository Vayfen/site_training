# 🚀 Guide de Démarrage Rapide - RunAI

## Installation en 5 minutes ⏱️

### Windows

```cmd
1. Téléchargez et installez (dans l'ordre) :
   - Python : https://www.python.org/downloads/
   - Node.js : https://nodejs.org/
   - Ollama : https://ollama.ai/download

2. Ouvrez un terminal dans le dossier du projet

3. Lancez l'installation :
   install-windows.bat

4. Démarrez l'application :
   start-runai.bat

5. Ouvrez votre navigateur :
   http://localhost:5173
```

### Linux / Mac

```bash
# 1. Installez les prérequis
# Ubuntu/Debian:
sudo apt update
sudo apt install python3 python3-pip python3-venv nodejs npm
curl -fsSL https://ollama.ai/install.sh | sh

# Mac (avec Homebrew):
brew install python3 node
# Téléchargez Ollama depuis https://ollama.ai/download

# 2. Installation
chmod +x install-linux-mac.sh
./install-linux-mac.sh

# 3. Démarrage
./start-runai.sh

# 4. Ouvrez votre navigateur
http://localhost:5173
```

## Première Utilisation 🎯

### 1. Créez votre compte (2 min)
- Ouvrez http://localhost:5173
- Cliquez sur "S'inscrire"
- Entrez email + mot de passe
- ✅ Tout est stocké localement !

### 2. Configurez votre profil (2 min)
- Niveau : Débutant / Intermédiaire / Avancé / Expert
- Disponibilité : heures par semaine
- Records personnels (optionnel)
- Préférence : Trail / Route / Les deux

### 3. Créez votre premier objectif (1 min)
- Cliquez sur "Objectifs" → "Nouvel objectif"
- Choisissez :
  - Type de course (5K, 10K, Semi, Marathon, Trail...)
  - Date de l'objectif
  - Distance
  - Temps visé (optionnel)

### 4. Générez votre plan d'entraînement (30 sec)
- Cliquez sur "Plans d'entraînement"
- Sélectionnez votre objectif
- Cliquez sur "Générer"
- ⏳ L'IA locale crée votre plan (10-30 secondes)

### 5. Suivez vos séances 📅
- Ouvrez "Séances"
- Consultez votre planning hebdomadaire
- Cliquez sur une séance pour voir les détails :
  - Échauffement
  - Corps de séance (avec allures précises)
  - Retour au calme
- Marquez comme complété après l'entraînement

## Astuces 💡

### Changer de Modèle IA

Pour plus de précision (mais plus lent) :
```bash
# Téléchargez un modèle plus gros
ollama pull llama3.2:7b

# Éditez .env
OLLAMA_MODEL=llama3.2:7b
```

### Sauvegarder vos Données

Votre base de données est ici :
- **Windows** : `%APPDATA%\RunAI\runai.db`
- **Linux/Mac** : `~/.runai/runai.db`

Faites une copie régulière de ce fichier !

### Accélérer l'IA

1. **Utilisez un modèle plus petit** :
   ```bash
   ollama pull llama3.2:3b  # Rapide, 2GB
   ```

2. **Si vous avez un GPU NVIDIA** :
   - Ollama l'utilisera automatiquement
   - Beaucoup plus rapide !

3. **Augmentez la RAM** :
   - Fermez les autres applications
   - 8GB minimum, 16GB recommandé

## Problèmes Courants ⚠️

### "Ollama not found"
```bash
# Vérifiez l'installation
ollama --version

# Si absent, installez :
# Windows/Mac : https://ollama.ai/download
# Linux : curl -fsSL https://ollama.ai/install.sh | sh
```

### "Port 8000 déjà utilisé"
```bash
# Trouvez et tuez le processus
# Windows :
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac :
lsof -ti:8000 | xargs kill -9
```

### L'IA ne génère rien
```bash
# Téléchargez le modèle
ollama pull llama3.2:3b

# Vérifiez qu'Ollama tourne
ollama list

# Redémarrez l'application
```

### Erreur de base de données
```bash
# Supprimez et recréez
# Windows :
del %APPDATA%\RunAI\runai.db

# Linux/Mac :
rm ~/.runai/runai.db

# Puis redémarrez l'app
```

## Prochaines Étapes 🎯

1. **Explorez les fonctionnalités** :
   - Générez des itinéraires
   - Consultez vos statistiques
   - Créez plusieurs objectifs

2. **Personnalisez** :
   - Éditez les prompts IA dans `backend/app/services/ai_planner.py`
   - Changez les couleurs du frontend

3. **Partagez** :
   - Aucune donnée n'est envoyée en ligne
   - Mais vous pouvez exporter votre BDD !

## Aide Supplémentaire 📚

- **README Complet** : [README-LOCAL.md](README-LOCAL.md)
- **Installation Détaillée** : [INSTALLATION.md](INSTALLATION.md)
- **Contribution** : [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Bon entraînement ! 🏃‍♂️💪**
