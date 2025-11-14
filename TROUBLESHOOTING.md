# 🔧 Guide de Dépannage RunAI

## ❌ Impossible de créer un compte

### Symptôme
Le formulaire d'inscription ne fonctionne pas ou affiche une erreur.

### Solutions

#### 1. Vérifiez que le backend est démarré

**Windows** :
```cmd
# Ouvrez un terminal dans le dossier du projet
cd backend
venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Linux/Mac** :
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Vous devriez voir :
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

#### 2. Vérifiez la base de données

La base de données devrait se créer automatiquement, mais vous pouvez la forcer :

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python init_db.py
```

Vous devriez voir :
```
✅ Database initialized successfully!
```

#### 3. Testez l'API directement

Ouvrez : http://localhost:8000/docs

Essayez l'endpoint `/api/auth/register` avec :
```json
{
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User"
}
```

#### 4. Vérifiez les logs

Dans le terminal du backend, cherchez les erreurs. Les plus courantes :

**"Table doesn't exist"** :
```bash
cd backend
python init_db.py
```

**"Database is locked"** :
```bash
# Supprimez la base de données et recréez-la
# Windows
del %APPDATA%\RunAI\runai.db
# Linux/Mac
rm ~/.runai/runai.db

# Puis redémarrez le backend
```

**"Connection refused"** :
Le frontend ne peut pas joindre le backend. Vérifiez que le backend tourne sur le port 8000.

#### 5. Vérifiez le frontend

**Le frontend se connecte-t-il au bon backend ?**

Éditez `.env` à la racine du projet :
```env
VITE_API_URL=http://localhost:8000
```

Puis redémarrez le frontend :
```bash
cd frontend
npm run dev
```

#### 6. Supprimez le cache du navigateur

1. Ouvrez les outils de développement (F12)
2. Onglet "Application" ou "Storage"
3. Supprimez le Local Storage et les cookies
4. Rechargez la page (Ctrl+F5)

---

## ❌ L'IA ne génère pas de plans

### Symptôme
Le bouton "Générer" charge indéfiniment ou affiche une erreur.

### Solutions

#### 1. Vérifiez qu'Ollama est installé et lancé

```bash
# Vérifiez l'installation
ollama --version

# Listez les modèles
ollama list

# Si le modèle n'est pas là, téléchargez-le
ollama pull llama3.2:3b
```

#### 2. Vérifiez qu'Ollama tourne

```bash
# Testez Ollama
ollama run llama3.2:3b "Hello, how are you?"
```

Si ça fonctionne, Ollama marche !

#### 3. Vérifiez le port d'Ollama

Ollama tourne normalement sur le port 11434. Testez :
```bash
curl http://localhost:11434/api/tags
```

Si ça ne fonctionne pas, vérifiez les paramètres d'Ollama ou redémarrez-le.

#### 4. Augmentez le timeout

Si l'IA est lente, éditez `backend/app/services/ai_planner.py` et augmentez le timeout dans la fonction `generate_training_plan`.

#### 5. Utilisez le plan de secours

L'application devrait générer automatiquement un plan de base si l'IA échoue. Vérifiez les logs du backend pour voir si c'est le cas.

---

## ❌ Port déjà utilisé

### Symptôme
```
Error: Address already in use
```

### Solutions

#### Windows
```cmd
# Trouvez quel processus utilise le port 8000
netstat -ano | findstr :8000

# Tuez le processus (remplacez PID par le numéro trouvé)
taskkill /PID <PID> /F
```

#### Linux/Mac
```bash
# Trouvez et tuez le processus sur le port 8000
lsof -ti:8000 | xargs kill -9

# Pour le frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

---

## ❌ Erreur "Module not found"

### Symptôme
```
ModuleNotFoundError: No module named 'ollama'
```

### Solutions

#### Réinstallez les dépendances

**Backend** :
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

**Frontend** :
```bash
cd frontend
rm -rf node_modules package-lock.json  # Windows: del /s node_modules
npm install
```

---

## ❌ Performance lente de l'IA

### Symptôme
L'IA met plus de 60 secondes à générer un plan.

### Solutions

#### 1. Utilisez un modèle plus petit
```bash
ollama pull llama3.2:3b  # Plus rapide que :7b
```

Éditez `.env` :
```env
OLLAMA_MODEL=llama3.2:3b
```

#### 2. Augmentez la RAM disponible

Fermez les autres applications pour libérer de la RAM.

#### 3. Utilisez un GPU (si disponible)

Si vous avez une carte NVIDIA, Ollama utilisera automatiquement le GPU. Vérifiez avec :
```bash
nvidia-smi  # Devrait montrer ollama
```

#### 4. Réduisez la longueur des plans

Dans `backend/app/services/ai_planner.py`, vous pouvez réduire `max_tokens` de 4000 à 2000 pour des réponses plus rapides.

---

## ❌ La base de données est corrompue

### Symptôme
Erreurs bizarres, données qui disparaissent, crashes aléatoires.

### Solution

Supprimez et recréez la base de données :

```bash
# Windows
del %APPDATA%\RunAI\runai.db

# Linux/Mac
rm ~/.runai/runai.db

# Puis redémarrez le backend
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python init_db.py
uvicorn app.main:app --reload
```

**⚠️ ATTENTION : Cela supprime toutes vos données !**

---

## ❌ Le frontend affiche "Network Error"

### Solutions

1. **Vérifiez que le backend tourne** : http://localhost:8000/health
2. **Vérifiez VITE_API_URL dans .env** : `VITE_API_URL=http://localhost:8000`
3. **Vérifiez CORS** : Ouvrez la console du navigateur (F12), onglet Console
4. **Redémarrez tout** :
   ```bash
   # Ctrl+C dans les deux terminaux
   # Puis relancez
   ```

---

## ❌ Erreurs dans la console du navigateur

### "Failed to fetch"
Le frontend ne peut pas joindre le backend. Vérifiez que http://localhost:8000 fonctionne.

### "CORS policy"
Le backend bloque les requêtes. Vérifiez `BACKEND_CORS_ORIGINS` dans `.env`.

### "Unexpected token"
Problème de parsing JSON. Souvent causé par une réponse HTML au lieu de JSON. Le backend a probablement crashé.

---

## 🆘 Rien ne fonctionne ?

### Réinstallation complète

```bash
# 1. Supprimez tout
rm -rf backend/venv frontend/node_modules

# Windows
rmdir /s backend\venv frontend\node_modules

# 2. Supprimez la base de données
# Windows: del %APPDATA%\RunAI\runai.db
# Linux/Mac: rm ~/.runai/runai.db

# 3. Réinstallez
./install-linux-mac.sh  # ou install-windows.bat
```

### Vérification étape par étape

```bash
# 1. Python installé ?
python3 --version  # Devrait afficher 3.11+

# 2. Node.js installé ?
node --version  # Devrait afficher 18+

# 3. Ollama installé ?
ollama --version

# 4. Backend fonctionne ?
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
# Ouvrez http://localhost:8000/docs

# 5. Frontend fonctionne ?
cd frontend
npm run dev
# Ouvrez http://localhost:5173
```

---

## 📞 Obtenir de l'aide

Si aucune de ces solutions ne fonctionne :

1. **Vérifiez les logs** :
   - Backend : Dans le terminal où tourne le backend
   - Frontend : Console du navigateur (F12)

2. **Créez une issue** sur GitHub avec :
   - Votre système d'exploitation
   - Les versions (Python, Node.js, Ollama)
   - Le message d'erreur complet
   - Les étapes pour reproduire le problème

3. **Captures d'écran** des erreurs sont très utiles !

---

## ✅ Checklist de démarrage

Avant d'utiliser RunAI, vérifiez que :

- [ ] Python 3.11+ est installé
- [ ] Node.js 18+ est installé
- [ ] Ollama est installé ET lancé
- [ ] Le modèle est téléchargé : `ollama pull llama3.2:3b`
- [ ] Le backend tourne (port 8000)
- [ ] Le frontend tourne (port 5173)
- [ ] http://localhost:8000/health retourne "healthy"
- [ ] http://localhost:5173 affiche la page de connexion

Si tout est coché, ça devrait fonctionner ! 🎉
