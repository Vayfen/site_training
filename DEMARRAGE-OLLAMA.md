# Guide de démarrage avec Ollama

## Problème identifié

Lorsque vous générez un plan d'entraînement sans que **Ollama soit en cours d'exécution**, le système devrait créer un plan de secours avec des séances pré-programmées. Ce problème a été corrigé.

## Solution apportée

✅ **Corrections effectuées dans le code :**
1. Vérification automatique que les données AI sont valides
2. Bascule automatique vers un plan de secours si l'IA échoue
3. Logs détaillés pour diagnostiquer les problèmes
4. Le plan de secours génère toujours des séances complètes

## Comment utiliser la plateforme

### Option 1 : Avec Ollama (recommandé pour l'IA)

**1. Installer Ollama** (si pas déjà fait)
```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Mac
brew install ollama

# Windows
# Télécharger depuis https://ollama.com/download
```

**2. Lancer le serveur Ollama**
```bash
ollama serve
```

**3. Télécharger le modèle** (dans un autre terminal)
```bash
ollama pull llama3.2:3b
```

**4. Vérifier qu'Ollama fonctionne**
```bash
curl http://localhost:11434/api/tags
```

Vous devriez voir une liste des modèles installés.

**5. Lancer la plateforme RunAI**

**Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2 : Sans Ollama (plan de secours)

Si vous ne voulez pas installer Ollama ou si vous voulez tester rapidement :

1. **Ne lancez PAS Ollama**
2. **Lancez juste la plateforme** (backend + frontend)
3. **Générez un plan d'entraînement**

→ Le système détectera automatiquement qu'Ollama n'est pas disponible et créera un **plan de secours pré-programmé** avec :
- Séances d'endurance
- Fractionnés
- Sorties longues
- Adaptées à votre niveau et objectif

## Vérifier que tout fonctionne

### 1. Logs du backend

Quand vous générez un plan, vous devriez voir dans les logs du backend :

**Avec Ollama disponible :**
```
[AI Planner] Calling Ollama with model: llama3.2:3b
[AI Planner] Received response from Ollama (1234 chars)
[AI Planner] Successfully parsed 8 weeks from AI
[AI Planner] Creating workouts from plan data...
[AI Planner] Generated 32 workouts
[AI Planner] Training plan created with 32 workouts
```

**Sans Ollama (plan de secours) :**
```
[AI Planner] Error calling Ollama: [Errno 111] Connection refused
[AI Planner] Falling back to basic plan generation
[AI Planner] Creating workouts from plan data...
[AI Planner] Generated 24 workouts
[AI Planner] Training plan created with 24 workouts
```

### 2. Dans l'interface web

1. Allez dans **Objectifs**
2. Créez un objectif (ex: 10km dans 3 mois)
3. Cliquez sur **Générer un plan**
4. Allez dans **Plans d'entraînement**
5. Cliquez sur votre plan
6. **Vous devriez voir des séances programmées** 📅

## Si vous avez encore des problèmes

### Supprimer un plan vide

Si vous avez généré un plan AVANT la correction et qu'il est vide :

1. Allez dans **Plans d'entraînement**
2. Supprimez le plan vide
3. Relancez le backend (pour charger le nouveau code)
4. Générez un nouveau plan

### Vérifier les logs

Les logs du backend vous indiqueront exactement ce qui se passe. Recherchez les lignes commençant par `[AI Planner]`.

## Avantages de chaque option

### Avec Ollama (IA locale) :
- ✅ Plans personnalisés selon votre profil exact
- ✅ Descriptions détaillées des séances
- ✅ Adaptation fine à vos objectifs
- ✅ Variété dans les séances
- ❌ Nécessite Ollama installé (~2GB)
- ❌ Génération un peu plus lente (5-10s)

### Sans Ollama (plan de secours) :
- ✅ Aucune dépendance externe
- ✅ Génération instantanée
- ✅ Plans éprouvés et cohérents
- ✅ 0% de risque d'échec
- ❌ Moins personnalisé
- ❌ Descriptions plus génériques

## Recommandation

Pour une **première utilisation** : testez SANS Ollama pour voir que tout fonctionne.
Pour une **utilisation régulière** : installez Ollama pour des plans optimaux.

Les deux options créent maintenant **toujours des séances** ! 🎉
