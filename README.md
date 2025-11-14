# RunAI - Plateforme d'Entraînement Running 100% Locale 🏃‍♂️

> **NOUVEAU !** Version 2.0 - 100% Gratuit, 100% Local, 0% Cloud
>
> Utilisez l'IA pour planifier vos entraînements **sans aucun frais** en utilisant Ollama sur votre PC.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Pourquoi RunAI ?

- ✅ **Gratuit à 100%** - Pas de frais d'API, tout sur votre PC
- ✅ **Privé** - Vos données restent chez vous
- ✅ **Intelligent** - IA locale pour des plans personnalisés
- ✅ **Complet** - Objectifs, plans, séances, itinéraires, stats
- ✅ **Offline** - Fonctionne sans internet (après installation)

## 🚀 Démarrage Rapide

### Installation en 3 étapes

#### Windows
```cmd
1. Installez Python, Node.js et Ollama (liens ci-dessous)
2. Double-cliquez sur : install-windows.bat
3. Double-cliquez sur : start-runai.bat
```

#### Linux / Mac
```bash
1. Installez Python, Node.js et Ollama (liens ci-dessous)
2. ./install-linux-mac.sh
3. ./start-runai.sh
```

**Ouvrez** : http://localhost:5173

📖 **Guide Détaillé** : [QUICK-START.md](QUICK-START.md)

### Prérequis

| Logiciel | Windows | Linux/Mac | Pourquoi |
|----------|---------|-----------|----------|
| [Python 3.11+](https://www.python.org/downloads/) | ✅ | ✅ | Backend API |
| [Node.js 18+](https://nodejs.org/) | ✅ | ✅ | Frontend |
| [Ollama](https://ollama.ai/download) | ✅ | ✅ | IA Locale |

## ✨ Fonctionnalités

### 🤖 IA Locale (Ollama)
- Plans d'entraînement personnalisés générés par LLM local
- Descriptions détaillées de chaque séance
- Adaptation au niveau, objectifs et disponibilité
- **Pas de frais d'API !**

### 🎯 Gestion des Objectifs
- Support de tous types de courses :
  - Route : 5K, 10K, Semi-marathon, Marathon
  - Trail : Court, Moyen, Long, Ultra
- Suivi de progression en temps réel
- Multi-objectifs simultanés

### 📅 Plans d'Entraînement
- Génération automatique par l'IA
- Séances variées : endurance, fractionné, tempo, côtes...
- Allures personnalisées par zone d'intensité
- Descriptions étape par étape (échauffement, corps, récupération)

### 🗺️ Itinéraires Personnalisés
- Génération d'itinéraires trail/route
- Adaptation distance et dénivelé
- Favoris et historique
- Coordonnées GPS

### 📊 Suivi & Analytics
- Statistiques de progression
- Taux de complétion
- Graphiques de performance
- Historique complet

## 🖥️ Architecture Technique

### Backend
- **Framework** : FastAPI (Python 3.11+)
- **Base de données** : **SQLite** (locale, aucune configuration)
- **IA** : **Ollama** (LLM local - Llama 3.2, Mistral, etc.)
- **Authentification** : JWT

### Frontend
- **Framework** : React 18 + TypeScript
- **UI** : Tailwind CSS
- **État** : Context API
- **Build** : Vite

### Infrastructure
- **Stockage** :
  - Windows : `%APPDATA%\RunAI\runai.db`
  - Linux/Mac : `~/.runai/runai.db`
- **Ports** :
  - Backend : 8000
  - Frontend : 5173
  - Ollama : 11434

## 📊 Configuration Système

### Minimale
- **CPU** : 2 cores @ 2.0 GHz
- **RAM** : 8 GB
- **Disque** : 5 GB
- **OS** : Windows 10+, Ubuntu 20.04+, macOS 11+

### Recommandée
- **CPU** : 4+ cores @ 2.5 GHz
- **RAM** : 16 GB
- **Disque** : 10 GB SSD
- **GPU** : Optionnel (accélère l'IA)

## 🔧 Utilisation

### 1. Inscription
```
Créez un compte local (email + mot de passe)
→ Stocké localement, aucune connexion internet
```

### 2. Configuration du Profil
```
- Niveau : Débutant / Intermédiaire / Avancé / Expert
- Records personnels (5K, 10K, Semi, Marathon)
- Disponibilité hebdomadaire
- Préférence terrain : Trail / Route / Mixte
```

### 3. Création d'un Objectif
```
- Type de course (5K → Ultra)
- Date de l'objectif
- Temps visé (optionnel)
- Dénivelé (pour trail)
```

### 4. Génération du Plan
```
Cliquez sur "Générer un plan"
→ L'IA locale analyse votre profil
→ Génère un plan personnalisé (10-30 secondes)
→ Séances hebdomadaires avec descriptions détaillées
```

### 5. Suivi des Entraînements
```
- Consultez votre planning
- Marquez les séances complétées
- Ajoutez vos performances
- Visualisez votre progression
```

## 🔒 Sécurité & Confidentialité

- ✅ **100% Local** - Aucune donnée n'est envoyée en ligne
- ✅ **Pas de tracking** - Aucune télémétrie
- ✅ **Open Source** - Code auditable
- ✅ **Vos données** - Base SQLite locale

## 📚 Documentation

- 📘 [Guide de Démarrage Rapide](QUICK-START.md)
- 📗 [README Complet](README-LOCAL.md)
- 📙 [Guide d'Installation Détaillé](INSTALLATION.md)
- 📕 [Guide de Contribution](CONTRIBUTING.md)

## 🆘 Support & Dépannage

### L'IA ne fonctionne pas ?

```bash
# Vérifiez qu'Ollama est installé
ollama --version

# Téléchargez le modèle
ollama pull llama3.2:3b

# Listez les modèles disponibles
ollama list
```

### Port déjà utilisé ?

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Plus de détails ?

Voir [QUICK-START.md](QUICK-START.md) pour tous les problèmes courants.

## 🌟 Modèles IA Recommandés

| Modèle | Taille | RAM | Vitesse | Qualité |
|--------|--------|-----|---------|---------|
| `llama3.2:3b` | 2 GB | 8 GB | ⚡⚡⚡ | ⭐⭐⭐ |
| `llama3.2:7b` | 4 GB | 12 GB | ⚡⚡ | ⭐⭐⭐⭐ |
| `mistral:7b` | 4 GB | 12 GB | ⚡⚡ | ⭐⭐⭐⭐ |
| `llama3:8b` | 4.7 GB | 16 GB | ⚡ | ⭐⭐⭐⭐⭐ |

**Recommandé pour démarrer** : `llama3.2:3b`

Pour changer :
```bash
ollama pull <modele>
# Puis éditez .env
OLLAMA_MODEL=<modele>
```

## 🛠️ Développement

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md)

## 📝 Licence

MIT - Utilisez, modifiez et distribuez librement

## 🙏 Remerciements

- [Ollama](https://ollama.ai/) - IA locale gratuite
- [FastAPI](https://fastapi.tiangolo.com/) - Backend Python
- [React](https://react.dev/) - Framework frontend
- Communauté open source

## 📊 Changelog

### Version 2.0 (Actuelle)
- ✨ Remplacement d'Anthropic par Ollama (IA locale)
- ✨ Remplacement de PostgreSQL par SQLite
- ✨ Scripts d'installation automatisés
- ✨ Support Windows/Linux/Mac
- ✨ Mode 100% offline
- ✨ Zéro coût d'API

### Version 1.0
- Première version avec Anthropic API
- PostgreSQL + Docker

---

**RunAI - Entraînez-vous intelligemment, gratuitement et en privé ! 🏃‍♂️💪**

[⭐ Star le projet](../../) | [🐛 Signaler un bug](../../issues) | [💡 Proposer une fonctionnalité](../../issues)
